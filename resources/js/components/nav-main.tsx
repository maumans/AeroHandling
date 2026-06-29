import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu className="gap-1">
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isCurrentOrParentUrl(item.activeMatch ?? item.href)}
                            tooltip={{ children: item.title }}
                            className="group/nav relative overflow-hidden rounded-md transition-all duration-200 hover:bg-sidebar-accent/70 data-[active=true]:bg-primary data-[active=true]:font-semibold data-[active=true]:text-white data-[active=true]:shadow-brand data-[active=true]:hover:brightness-110"
                        >
                            <Link href={item.href} prefetch>
                                {/* Indicateur latéral (état actif) */}
                                <span className="absolute left-0 top-1/2 h-0 w-[3px] -translate-y-1/2 rounded-r-full bg-white/90 transition-all duration-200 group-data-[active=true]/nav:h-5" />
                                {item.icon && (
                                    <item.icon className="shrink-0 text-sidebar-foreground/70 transition-colors group-hover/nav:text-sidebar-foreground group-data-[active=true]/nav:text-white" />
                                )}
                                <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
