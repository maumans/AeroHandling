import { Link, usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Building2, Plane, PlaneTakeoff, Settings, Wrench, Users, CalendarDays, Briefcase, Tag, Layers, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminTabs() {
    const { url } = usePage();
    const { t } = useLaravelReactI18n();

    const tabs = [
        // Acteurs du système
        {
            name: t('Utilisateurs'),
            href: '/administration/utilisateurs',
            icon: Users,
            active: url.startsWith('/administration/utilisateurs'),
        },
        {
            name: t('Compagnies'),
            href: '/administration/compagnies',
            icon: Building2,
            active: url.startsWith('/administration/compagnies'),
        },
        // Aéronefs + leurs référentiels
        {
            name: t("Types d'aéronef"),
            href: '/administration/types-aeronef',
            icon: PlaneTakeoff,
            active: url.startsWith('/administration/types-aeronef'),
        },
        // Équipements + leur référentiel
        {
            name: t('Équipements'),
            href: '/administration/equipements',
            icon: Wrench,
            active: url.startsWith('/administration/equipements'),
        },
        {
            name: t("Types d'équipement"),
            href: '/administration/types-equipement',
            icon: Layers,
            active: url.startsWith('/administration/types-equipement'),
        },
        // Référentiels utilisés dans le formulaire de demande
        {
            name: t('Services'),
            href: '/administration/services-assistance',
            icon: Briefcase,
            active: url.startsWith('/administration/services-assistance'),
        },
        {
            name: t('Natures Vol'),
            href: '/administration/natures-vol',
            icon: Tag,
            active: url.startsWith('/administration/natures-vol'),
        },
        {
            name: t('Types de marchandise'),
            href: '/administration/types-marchandise',
            icon: Package,
            active: url.startsWith('/administration/types-marchandise'),
        },
        // Configuration système
        {
            name: t('Jours Fériés'),
            href: '/administration/jours-feries',
            icon: CalendarDays,
            active: url.startsWith('/administration/jours-feries'),
        },
        {
            name: t('Paramètres'),
            href: '/administration/parametres',
            icon: Settings,
            active: url.startsWith('/administration/parametres'),
        },
    ];

    return (
        <div className="flex flex-wrap items-center gap-2 mb-4">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                    <Button
                        key={tab.name}
                        asChild
                        variant={tab.active ? 'default' : 'outline'}
                    >
                        <Link href={tab.href}>
                            <Icon className="mr-2 size-4" />
                            {tab.name}
                        </Link>
                    </Button>
                );
            })}
        </div>
    );
}
