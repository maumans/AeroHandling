import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { RealtimeNotifications } from '@/components/realtime-notifications';
import { useFlashToast } from '@/hooks/use-flash-toast';
import ThemeCustomizer from '@/components/theme-customizer';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    useFlashToast();

    return (
        <>
            <ThemeCustomizer />
            <RealtimeNotifications />
            <AppLayoutTemplate breadcrumbs={breadcrumbs}>
                {children}
            </AppLayoutTemplate>
        </>
    );
}
