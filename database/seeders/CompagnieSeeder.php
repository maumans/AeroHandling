<?php

namespace Database\Seeders;

use App\Models\Compagnie;
use Illuminate\Database\Seeder;

class CompagnieSeeder extends Seeder
{
    public function run(): void
    {
        $compagnies = [
            ['nom' => 'Royal Air Maroc', 'code_iata' => 'AT', 'code_icao' => 'RAM', 'pays' => 'Maroc'],
            ['nom' => 'Air Sénégal', 'code_iata' => 'HC', 'code_icao' => 'SZN', 'pays' => 'Sénégal'],
            ['nom' => 'Ethiopian Airlines', 'code_iata' => 'ET', 'code_icao' => 'ETH', 'pays' => 'Éthiopie'],
            ['nom' => 'Kenya Airways', 'code_iata' => 'KQ', 'code_icao' => 'KQA', 'pays' => 'Kenya'],
            ['nom' => 'ASKY Airlines', 'code_iata' => 'KP', 'code_icao' => 'SKK', 'pays' => 'Togo'],
            ['nom' => 'Air Côte d\'Ivoire', 'code_iata' => 'HF', 'code_icao' => 'VRE', 'pays' => 'Côte d\'Ivoire'],
            ['nom' => 'Turkish Airlines Cargo', 'code_iata' => 'TK', 'code_icao' => 'THY', 'pays' => 'Turquie'],
            ['nom' => 'Qatar Airways Cargo', 'code_iata' => 'QR', 'code_icao' => 'QTR', 'pays' => 'Qatar'],
            ['nom' => 'Air France', 'code_iata' => 'AF', 'code_icao' => 'AFR', 'pays' => 'France'],
            ['nom' => 'DHL Aviation', 'code_iata' => 'D0', 'code_icao' => 'DHK', 'pays' => 'Allemagne'],
        ];

        foreach ($compagnies as $compagnie) {
            Compagnie::create(array_merge($compagnie, [
                'contact_email' => strtolower(str_replace(' ', '', $compagnie['nom'])).'@example.com',
                'contact_telephone' => '+'.fake()->numberBetween(1, 99).' '.fake()->numerify('## ### ## ##'),
                'actif' => true,
            ]));
        }
    }
}
