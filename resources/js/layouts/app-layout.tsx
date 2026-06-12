import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { RealtimeNotifications } from '@/components/realtime-notifications';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <>
            <RealtimeNotifications />
            <AppLayoutTemplate breadcrumbs={breadcrumbs}>
                {children}
            </AppLayoutTemplate>
        </>
    );
}
