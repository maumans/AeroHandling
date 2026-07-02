import { usePage } from '@inertiajs/react';
import {
    BarChart3,
    Bell,
    Building2,
    Calendar,
    ClipboardList,
    FilePlus2,
    Gauge,
    LayoutGrid,
    LucideIcon,
    Plane,
    Settings,
    SlidersHorizontal,
    Truck,
    Users,
} from 'lucide-react';
import { useMemo } from 'react';
import type { User } from '@/types';

export interface RechercheGlobaleItem {
    titre: string;
    description?: string;
    href: string;
    icon: LucideIcon;
    groupe: string;
}

export function useRechercheGlobaleItems(): RechercheGlobaleItem[] {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const roles = auth.user?.roles ?? [];
    const estHandlingOuAdmin = roles.some((r: string) => ['handling', 'administrateur'].includes(r));
    const estAdmin = roles.includes('administrateur');

    return useMemo(() => {
        const items: RechercheGlobaleItem[] = [
            { titre: 'Tableau de bord', href: '/tableau-de-bord', icon: LayoutGrid, groupe: 'Navigation' },
            { titre: 'Demandes', description: 'Liste des demandes d\'assistance', href: '/demandes', icon: ClipboardList, groupe: 'Navigation' },
            { titre: 'Nouvelle demande', description: 'Créer une demande d\'assistance', href: '/demandes/creer', icon: FilePlus2, groupe: 'Actions' },
            { titre: 'Notifications', href: '/notifications', icon: Bell, groupe: 'Navigation' },
        ];

        if (estHandlingOuAdmin) {
            items.push(
                { titre: 'Planning', description: 'Calendrier des affectations', href: '/planning', icon: Calendar, groupe: 'Navigation' },
                { titre: 'Capacités', description: 'Stockage et parc équipements', href: '/capacites', icon: Gauge, groupe: 'Navigation' },
                { titre: 'Rapports', description: 'Indicateurs et exports', href: '/rapports', icon: BarChart3, groupe: 'Navigation' },
                { titre: 'Équipements', description: 'Parc matériel', href: '/equipements', icon: Truck, groupe: 'Navigation' },
            );
        }

        if (estAdmin) {
            items.push(
                { titre: 'Utilisateurs', description: 'Administration des comptes', href: '/administration/utilisateurs', icon: Users, groupe: 'Administration' },
                { titre: 'Compagnies', description: 'Administration des compagnies', href: '/administration/compagnies', icon: Building2, groupe: 'Administration' },
                { titre: 'Aéronefs', description: 'Administration des aéronefs', href: '/administration/aeronefs', icon: Plane, groupe: 'Administration' },
                { titre: 'Équipements (admin)', description: 'Gestion du parc matériel', href: '/administration/equipements', icon: Settings, groupe: 'Administration' },
                { titre: 'Paramètres', description: 'Configuration générale', href: '/administration/parametres', icon: SlidersHorizontal, groupe: 'Administration' },
            );
        }

        return items;
    }, [estHandlingOuAdmin, estAdmin]);
}
