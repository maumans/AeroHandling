<?php

namespace App\Services;

use App\Models\JourFerie;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

/**
 * Résolution de la grille tarifaire d'assistance aéroportuaire (Guide des
 * Tarifs Généraux 2026, SOGEAG). Fournit les briques de calcul utilisées par
 * le générateur de facture proforma : catégorie de masse, forfait de base,
 * majorations (nuit, jour férié).
 */
class GrilleTarifaire
{
    /**
     * Détermine la catégorie tarifaire (1 à 10) correspondant au MTOW (tonnes).
     */
    public function categoriePourMtow(float $mtow): int
    {
        $categories = config('tarifs.categories_mtow', []);

        foreach ($categories as $palier) {
            if ($palier['max'] === null || $mtow <= (float) $palier['max']) {
                return (int) $palier['categorie'];
            }
        }

        // Repli défensif : dernière catégorie connue.
        return (int) (end($categories)['categorie'] ?? 10);
    }

    /**
     * Forfait de base d'assistance (Euro HT) pour une catégorie donnée.
     */
    public function forfaitBase(int $categorie, bool $estCargo): float
    {
        $forfaits = config('tarifs.forfait_base', []);
        $ligne = $forfaits[$categorie] ?? null;

        if ($ligne === null) {
            return 0.0;
        }

        return (float) ($estCargo ? $ligne['cargo'] : $ligne['passager']);
    }

    /**
     * Forfait de base directement à partir du MTOW.
     */
    public function forfaitBasePourMtow(float $mtow, bool $estCargo): float
    {
        return $this->forfaitBase($this->categoriePourMtow($mtow), $estCargo);
    }

    /**
     * Un service rendu à cette date/heure locale tombe-t-il dans la plage de
     * nuit (23h00–06h00 locales) donnant lieu à majoration ?
     */
    public function estServiceDeNuit(CarbonInterface $date): bool
    {
        $config = config('tarifs.majorations.nuit');
        $fuseau = config('tarifs.fuseau_horaire', config('app.timezone'));

        $locale = Carbon::instance($date instanceof Carbon ? $date : Carbon::parse($date))->setTimezone($fuseau);
        $heure = $locale->format('H:i');

        $debut = $config['debut']; // ex. 23:00
        $fin = $config['fin'];     // ex. 06:00

        // Plage traversant minuit : nuit si heure >= début OU heure < fin.
        return $heure >= $debut || $heure < $fin;
    }

    /**
     * La date (jour) est-elle un jour férié décrété en Guinée ?
     * Prend en compte les jours fixes récurrents (comparaison mois + jour) et
     * les dates ponctuelles exactes.
     */
    public function estJourFerie(CarbonInterface $date): bool
    {
        $fuseau = config('tarifs.fuseau_horaire', config('app.timezone'));
        $locale = Carbon::instance($date instanceof Carbon ? $date : Carbon::parse($date))->setTimezone($fuseau);

        $dateExacte = $locale->toDateString();
        $mois = $locale->month;
        $jour = $locale->day;

        return JourFerie::query()
            ->where(function ($q) use ($dateExacte, $mois, $jour) {
                $q->whereDate('date', $dateExacte)
                    ->orWhere(function ($q2) use ($mois, $jour) {
                        $q2->where('recurrent_annuel', true)
                            ->whereMonth('date', $mois)
                            ->whereDay('date', $jour);
                    });
            })
            ->exists();
    }

    public function tauxMajorationNuit(): float
    {
        return (float) config('tarifs.majorations.nuit.taux', 0);
    }

    public function tauxMajorationJourFerie(): float
    {
        return (float) config('tarifs.majorations.jour_ferie.taux', 0);
    }

    public function devise(): string
    {
        return (string) config('tarifs.devise', 'EUR');
    }

    public function tarifPushback(int $categorie): float
    {
        $tarifs = config("tarifs.repoussage_tractage.{$categorie}");
        return (float) ($tarifs['repoussage'] ?? 0.0);
    }

    public function tarifTractage(int $categorie): float
    {
        $tarifs = config("tarifs.repoussage_tractage.{$categorie}");
        return (float) ($tarifs['tractage'] ?? 0.0);
    }

    public function tarifPasserelleTelescopique(int $categorie): float
    {
        // Tarif estimé pour 1 heure (4 quarts d'heure) pour la proforma
        $tarifQuartHeure = config('tarifs.passerelle_telescopique.0.tarif_quart_heure', 0);
        return (float) ($tarifQuartHeure * 4);
    }

    public function tarifManipulationFret(float $tonnes): float
    {
        // On utilise le tarif Import (200€) par défaut. 
        // Si besoin d'être plus granulaire (Export, etc.), cela pourra être ajouté via le type de demande.
        return (float) config('tarifs.fret.import', 0.0);
    }
}
