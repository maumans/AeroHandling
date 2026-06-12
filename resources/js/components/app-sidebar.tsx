import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Bell,
    Calendar,
    ClipboardList,
    Gauge,
    LayoutGrid,
    Settings,
    Shield,
} from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem, User } from '@/types';

function useNavigationItems(): NavItem[] {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const roles = auth.user?.roles ?? [];

    return useMemo(() => {
        const items: NavItem[] = [
            {
                title: 'Tableau de bord',
                href: '/tableau-de-bord',
                icon: LayoutGrid,
            },
        ];

        // Demandes - visible par tous
        items.push({
            title: 'Demandes',
            href: '/demandes',
            icon: ClipboardList,
        });

        // Planning & Capacités - handling, coordinateur, admin
        if (roles.some((r: string) => ['handling', 'coordinateur', 'administrateur'].includes(r))) {
            items.push(
                {
                    title: 'Planning',
                    href: '/planning',
                    icon: Calendar,
                },
                {
                    title: 'Capacités',
                    href: '/capacites',
                    icon: Gauge,
                },
            );
        }

        // Aviation Civile - aviation_civile, admin
        if (roles.some((r: string) => ['aviation_civile', 'administrateur'].includes(r))) {
            items.push({
                title: 'Aviation Civile',
                href: '/aviation-civile',
                icon: Shield,
            });
        }

        // Rapports - handling, coordinateur, admin
        if (roles.some((r: string) => ['handling', 'coordinateur', 'administrateur'].includes(r))) {
            items.push({
                title: 'Rapports',
                href: '/rapports',
                icon: BarChart3,
            });
        }

        // Notifications - tous
        items.push({
            title: 'Notifications',
            href: '/notifications',
            icon: Bell,
        });

        // Administration - admin uniquement
        if (roles.includes('administrateur')) {
            items.push({
                title: 'Administration',
                href: '/administration/utilisateurs',
                icon: Settings,
                activeMatch: '/administration',
            });
        }

        return items;
    }, [roles]);
}

export function AppSidebar() {
    const navItems = useNavigationItems();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/tableau-de-bord" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
