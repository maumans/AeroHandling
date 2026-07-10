<?php

namespace App\Services;

use App\Enums\NatureVol;
use App\Models\Demande;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Carbon;

class ProformaService
{
    public function __construct(
        private GrilleTarifaire $grilleTarifaire
    ) {}

    /**
     * Calcule le détail de la facture proforma pour une demande.
     *
     * @return array{
     *     categorie: int,
     *     lignes: array,
     *     sous_total_ht: float,
     *     majorations: array,
     *     total_majorations: float,
     *     total_ht: float,
     *     tva: float,
     *     total_ttc: float,
     *     est_nuit: bool,
     *     est_ferie: bool
     * }
     */
    public function calculer(Demande $demande): array
    {
        $mtow = (float) $demande->mtow;
        $categorie = $this->grilleTarifaire->categoriePourMtow($mtow);
        $estCargo = $demande->nature_vol === NatureVol::Freighter;

        $lignes = [];
        $sousTotalHt = 0.0;

        // 1. Forfait de base
        $forfait = $this->grilleTarifaire->forfaitBase($categorie, $estCargo);

        // Appliquer réduction Ambulance / Rapatriement (-50%) si applicable
        // Hypothèse : on traite le vol humanitaire comme un vol spécial (ou on peut le réduire ici si on le souhaite)
        // Le Guide stipule "Vols d'évacuation sanitaire : 50% de réduction". On ne l'applique qu'aux évacuations (Ambulance).
        if ($demande->nature_vol === NatureVol::VolEvacuationMedicale) {
            $forfait = $forfait * 0.5;
            $lignes[] = [
                'designation' => "Forfait d'assistance en escale (Cat. $categorie) - Réduction Ambulance (50%)",
                'quantite' => 1,
                'prix_unitaire' => $forfait,
                'total' => $forfait,
            ];
        } else {
            $lignes[] = [
                'designation' => "Forfait d'assistance en escale (Cat. $categorie)",
                'quantite' => 1,
                'prix_unitaire' => $forfait,
                'total' => $forfait,
            ];
        }
        $sousTotalHt += $forfait;

        // 2. Services d'assistance supplémentaires
        foreach ($demande->servicesAssistance as $service) {
            $pu = (float) $service->tarif_unitaire;
            // Résolution des tarifs variables (Pushback, Tractage, etc.)
            if ($pu === 0.0) {
                if (str_contains(strtolower($service->code), 'pushback')) {
                    $pu = $this->grilleTarifaire->tarifPushback($categorie);
                } elseif (str_contains(strtolower($service->code), 'tractage')) {
                    $pu = $this->grilleTarifaire->tarifTractage($categorie);
                } elseif (str_contains(strtolower($service->code), 'passerelle')) {
                    $pu = $this->grilleTarifaire->tarifPasserelleTelescopique($categorie);
                }
            }

            if ($pu > 0) {
                // Par défaut quantité = 1 pour cette version de la proforma
                $quantite = 1;
                $totalLigne = $pu * $quantite;

                $lignes[] = [
                    'designation' => $service->nom.($service->unite_facturation ? " ({$service->unite_facturation})" : ''),
                    'quantite' => $quantite,
                    'prix_unitaire' => $pu,
                    'total' => $totalLigne,
                ];
                $sousTotalHt += $totalLigne;
            }
        }

        // 3. Fret et Poste (si Cargo avec tonnage)
        if ($estCargo && $demande->tonnage_prevu > 0) {
            $tarifFret = $this->grilleTarifaire->tarifManipulationFret($demande->tonnage_prevu);
            $totalFret = $tarifFret * (float) $demande->tonnage_prevu;
            $lignes[] = [
                'designation' => 'Manipulation Fret & Poste',
                'quantite' => (float) $demande->tonnage_prevu,
                'prix_unitaire' => $tarifFret,
                'total' => $totalFret,
            ];
            $sousTotalHt += $totalFret;
        }

        // 4. Majorations (Nuit, Férié)
        // Les majorations s'appliquent sur le sous-total (Forfait + Services) selon le Guide.
        $majorations = [];
        $totalMajorations = 0.0;

        $estNuit = $this->grilleTarifaire->estServiceDeNuit($demande->date_arrivee);
        $estFerie = $this->grilleTarifaire->estJourFerie($demande->date_arrivee);

        if ($estNuit) {
            $montantNuit = $sousTotalHt * 0.25;
            $majorations[] = [
                'designation' => 'Majoration de Nuit (23h00 - 06h00) : 25%',
                'montant' => $montantNuit,
            ];
            $totalMajorations += $montantNuit;
        }

        if ($estFerie) {
            $montantFerie = $sousTotalHt * 0.25;
            $majorations[] = [
                'designation' => 'Majoration Dimanche / Jour Férié : 25%',
                'montant' => $montantFerie,
            ];
            $totalMajorations += $montantFerie;
        }

        $totalHt = $sousTotalHt + $totalMajorations;
        // TVA Guinéenne standard 18%
        $tva = $totalHt * 0.18;
        $totalTtc = $totalHt + $tva;

        return [
            'categorie' => $categorie,
            'lignes' => $lignes,
            'sous_total_ht' => $sousTotalHt,
            'majorations' => $majorations,
            'total_majorations' => $totalMajorations,
            'total_ht' => $totalHt,
            'tva' => $tva,
            'total_ttc' => $totalTtc,
            'est_nuit' => $estNuit,
            'est_ferie' => $estFerie,
        ];
    }

    /**
     * Génère le document PDF de la facture proforma.
     */
    public function genererPdf(Demande $demande): \Barryvdh\DomPDF\PDF
    {
        $calculs = $this->calculer($demande);

        $data = [
            'demande' => $demande,
            'compagnie' => $demande->compagnie ?? null,
            'calculs' => $calculs,
            'date_generation' => Carbon::now(),
            'reference_facture' => 'PROF-'.$demande->reference,
        ];

        return Pdf::loadView('pdf.proforma', $data)
            ->setPaper('a4', 'portrait');
    }
}
