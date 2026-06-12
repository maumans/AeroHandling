import { Link, usePage } from '@inertiajs/react';
import { Bell, ChevronsUpDown } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { NotificationsDropdown } from '@/components/notifications-dropdown';
import type { BreadcrumbItem as BreadcrumbItemType, User } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth, notificationsNonLues } = usePage<{ auth: { user: User }, notificationsNonLues: number }>().props;

    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 bg-background px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6">
            <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-1">
                <NotificationsDropdown />
                <ThemeToggle />
                
                {auth?.user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative ml-2 hidden h-auto items-center gap-2 rounded-full p-1 pl-1 pr-3 hover:bg-muted/50 data-[state=open]:bg-muted md:flex">
                                <UserInfo user={auth.user} />
                                <ChevronsUpDown className="ml-1 size-4 opacity-50 hidden sm:block" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 rounded-lg" align="end" side="bottom">
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header>
    );
}
