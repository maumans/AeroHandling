<?php

namespace Database\Seeders;

use App\Models\JourFerie;
use Illuminate\Database\Seeder;

class JourFerieSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Jours fériés civils fixes de la République de Guinée (récurrents chaque
     * année). Les fêtes religieuses musulmanes (Aïd, Mawlid…), à dates variables
     * car décrétées, sont ajoutées manuellement par l'administrateur.
     * L'année de la date stockée est indifférente pour les jours récurrents :
     * seuls le mois et le jour sont comparés (cf. GrilleTarifaire::estJourFerie).
     */
    public function run(): void
    {
        $joursFixes = [
            ['date' => '2000-01-01', 'libelle' => "Jour de l'An"],
            ['date' => '2000-04-03', 'libelle' => 'Fête de la Deuxième République'],
            ['date' => '2000-05-01', 'libelle' => 'Fête du Travail'],
            ['date' => '2000-05-25', 'libelle' => "Journée de l'Afrique"],
            ['date' => '2000-08-15', 'libelle' => 'Assomption'],
            ['date' => '2000-10-02', 'libelle' => "Fête de l'Indépendance"],
            ['date' => '2000-11-01', 'libelle' => 'Toussaint'],
            ['date' => '2000-12-25', 'libelle' => 'Noël'],
        ];

        foreach ($joursFixes as $jour) {
            JourFerie::updateOrCreate(
                ['date' => $jour['date']],
                ['libelle' => $jour['libelle'], 'recurrent_annuel' => true],
            );
        }
    }
}
