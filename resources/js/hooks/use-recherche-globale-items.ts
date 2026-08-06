import { usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
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
    const { t } = useLaravelReactI18n();
    const roles = auth.user?.roles ?? [];
    const estHandlingOuAdmin = roles.some((r: string) => ['handling', 'administrateur'].includes(r));
    const estAdmin = roles.includes('administrateur');

    return useMemo(() => {
        const items: RechercheGlobaleItem[] = [
            { titre: t('Tableau de bord'), href: '/tableau-de-bord', icon: LayoutGrid, groupe: t('Navigation') },
            { titre: t('Demandes'), description: t("Liste des demandes d'assistance"), href: '/demandes', icon: ClipboardList, groupe: t('Navigation') },
            { titre: t('Nouvelle demande'), description: t("Créer une demande d'assistance"), href: '/demandes/creer', icon: FilePlus2, groupe: t('Actions') },
            { titre: t('Notifications'), href: '/notifications', icon: Bell, groupe: t('Navigation') },
        ];

        if (estHandlingOuAdmin) {
            items.push(
                { titre: t('Planning'), description: t('Calendrier des affectations'), href: '/planning', icon: Calendar, groupe: t('Navigation') },
                { titre: t('Capacités'), description: t('Stockage et parc équipements'), href: '/capacites', icon: Gauge, groupe: t('Navigation') },
                { titre: t('Rapports'), description: t('Indicateurs et exports'), href: '/rapports', icon: BarChart3, groupe: t('Navigation') },
                { titre: t('Équipements'), description: t('Parc matériel'), href: '/equipements', icon: Truck, groupe: t('Navigation') },
            );
        }

        if (estAdmin) {
            items.push(
                { titre: t('Utilisateurs'), description: t('Administration des comptes'), href: '/administration/utilisateurs', icon: Users, groupe: t('Administration') },
                { titre: t('Compagnies'), description: t('Administration des compagnies'), href: '/administration/compagnies', icon: Building2, groupe: t('Administration') },
                { titre: t('Aéronefs'), description: t('Administration des aéronefs'), href: '/administration/aeronefs', icon: Plane, groupe: t('Administration') },
                { titre: t('Équipements (admin)'), description: t('Gestion du parc matériel'), href: '/administration/equipements', icon: Settings, groupe: t('Administration') },
                { titre: t('Paramètres'), description: t('Configuration générale'), href: '/administration/parametres', icon: SlidersHorizontal, groupe: t('Administration') },
            );
        }

        return items;
    }, [estHandlingOuAdmin, estAdmin, t]);
}
