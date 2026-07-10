<?php

namespace Database\Seeders;

use App\Models\ServiceAssistance;
use Illuminate\Database\Seeder;

class ServiceAssistanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tarifs issus du Guide des Tarifs Généraux 2026 (SOGEAG). Les tarifs
        // variables selon la catégorie de l'aéronef (repoussage, tractage,
        // passerelle télescopique) restent nuls ici et sont résolus par la
        // grille tarifaire lors du calcul de la facture proforma.
        $services = [
            ['code' => 'gpu', 'nom' => 'GPU', 'description' => 'Ground Power Unit', 'tarif_unitaire' => 201.69, 'unite_facturation' => 'rotation', 'facture_par_quantite' => false],
            ['code' => 'asu', 'nom' => 'ASU', 'description' => 'Air Starter Unit', 'tarif_unitaire' => 134.46, 'unite_facturation' => 'rotation', 'facture_par_quantite' => false],
            ['code' => 'pushback', 'nom' => 'Pushback', 'description' => 'Repoussage de l\'aéronef', 'tarif_unitaire' => null, 'unite_facturation' => 'operation', 'facture_par_quantite' => false],
            ['code' => 'servicing_toilette', 'nom' => 'Servicing toilette', 'description' => 'Vidange et service des toilettes (vide toilettes)', 'tarif_unitaire' => 102.18, 'unite_facturation' => 'operation', 'facture_par_quantite' => false],
            ['code' => 'cobus', 'nom' => 'Cobus', 'description' => 'Transport passagers par Cobus / mini bus', 'tarif_unitaire' => 20.00, 'unite_facturation' => 'mouvement', 'facture_par_quantite' => false],
            ['code' => 'tracteur_manutention', 'nom' => 'Tracteur de manutention', 'description' => 'Tractage avion / chariots et matériels', 'tarif_unitaire' => null, 'unite_facturation' => 'operation', 'facture_par_quantite' => false],
            ['code' => 'bus_vip', 'nom' => 'Bus VIP', 'description' => 'Transport passagers par véhicule VIP', 'tarif_unitaire' => 25.00, 'unite_facturation' => 'mouvement', 'facture_par_quantite' => false],
            ['code' => 'escalier_passager', 'nom' => 'Escalier passager', 'description' => 'Escalier d\'embarquement/débarquement (inclus au forfait de base passagers)', 'tarif_unitaire' => null, 'unite_facturation' => 'operation', 'facture_par_quantite' => false],
            ['code' => 'chariot_vrac', 'nom' => 'Chariot vrac', 'description' => 'Chariot pour bagages en vrac', 'tarif_unitaire' => null, 'unite_facturation' => 'operation', 'facture_par_quantite' => false],
            ['code' => 'passerelle_telescopique', 'nom' => 'Passerelle télescopique', 'description' => 'Passerelle d\'embarquement télescopique (facturée au quart d\'heure)', 'tarif_unitaire' => null, 'unite_facturation' => 'quart_heure', 'facture_par_quantite' => false],
            ['code' => 'assistance_pmr', 'nom' => 'Assistance PMR', 'description' => 'Assistance aux personnes à mobilité réduite (chaise roulante)', 'tarif_unitaire' => 20.00, 'unite_facturation' => 'passager', 'facture_par_quantite' => true],
            // Interventions spécifiques à la demande (tarif forfaitaire par agent et par opération)
            ['code' => 'cadre', 'nom' => 'Cadre', 'description' => 'Intervention spécifique à la demande (par agent et par opération)', 'tarif_unitaire' => 120.00, 'unite_facturation' => 'agent', 'facture_par_quantite' => true],
            ['code' => 'agent_exploitation', 'nom' => 'Agent d\'exploitation (TRC/OPS)', 'description' => 'Intervention spécifique à la demande (par agent et par opération)', 'tarif_unitaire' => 90.00, 'unite_facturation' => 'agent', 'facture_par_quantite' => true],
            ['code' => 'agent_passage', 'nom' => 'Agent Passage', 'description' => 'Intervention spécifique à la demande (par agent et par opération)', 'tarif_unitaire' => 60.00, 'unite_facturation' => 'agent', 'facture_par_quantite' => true],
            ['code' => 'agent_piste', 'nom' => 'Agent Piste', 'description' => 'Intervention spécifique à la demande (par agent et par opération)', 'tarif_unitaire' => 60.00, 'unite_facturation' => 'agent', 'facture_par_quantite' => true],
            ['code' => 'tractiste', 'nom' => 'Tractiste', 'description' => 'Intervention spécifique à la demande (par agent et par opération)', 'tarif_unitaire' => 25.00, 'unite_facturation' => 'agent', 'facture_par_quantite' => true],
        ];

        foreach ($services as $ordre => $service) {
            ServiceAssistance::updateOrCreate(
                ['code' => $service['code']],
                [...$service, 'actif' => true, 'ordre' => $ordre + 1],
            );
        }
    }
}
