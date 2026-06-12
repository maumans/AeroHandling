import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <>
            <Head title="Redirection..." />
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Tableau de bord',
            href: '/tableau-de-bord',
        },
    ],
};
