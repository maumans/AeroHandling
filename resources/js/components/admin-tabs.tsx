import { Link, usePage } from '@inertiajs/react';
import { Building2, Plane, Settings, Wrench, Users, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminTabs() {
    const { url } = usePage();

    const tabs = [
        {
            name: 'Utilisateurs',
            href: '/administration/utilisateurs',
            icon: Users,
            active: url.startsWith('/administration/utilisateurs'),
        },
        {
            name: 'Compagnies',
            href: '/administration/compagnies',
            icon: Building2,
            active: url.startsWith('/administration/compagnies'),
        },
        {
            name: 'Aéronefs',
            href: '/administration/aeronefs',
            icon: Plane,
            active: url.startsWith('/administration/aeronefs'),
        },
        {
            name: 'Équipements',
            href: '/administration/equipements',
            icon: Wrench,
            active: url.startsWith('/administration/equipements'),
        },
        {
            name: 'Jours Fériés',
            href: '/administration/jours-feries',
            icon: CalendarDays,
            active: url.startsWith('/administration/jours-feries'),
        },
        {
            name: 'Paramètres',
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
