import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import AdminTabs from '@/components/admin-tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface ServiceAssistance {
    id: number;
    code: string;
    categorie: string;
    nom: string;
    tarif_unitaire: string | null;
    unite_facturation: string | null;
    facture_par_quantite: boolean;
    actif: boolean;
}

interface PaginatedData {
    data: ServiceAssistance[];
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    services: PaginatedData;
}

export default function AdministrationServicesAssistanceIndex({ services }: Props) {
    const { t } = useLaravelReactI18n();

    return (
        <AppLayout breadcrumbs={[
            { title: t('Administration'), href: '/administration/utilisateurs' },
            { title: t("Services d'assistance"), href: '/administration/services-assistance' },
        ]}>
            <Head title={t("Gestion services")} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold">{t("Gestion des services d'assistance")}</h1>
                    <Button asChild>
                        <Link href="/administration/services-assistance/create">
                            <Plus className="mr-2 size-4" />
                            {t('Nouveau service')}
                        </Link>
                    </Button>
                </div>

                <AdminTabs />

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left font-medium">{t('Code')}</th>
                                        <th className="px-4 py-3 text-left font-medium">{t('Nom')}</th>
                                        <th className="px-4 py-3 text-left font-medium">{t('Catégorie')}</th>
                                        <th className="px-4 py-3 text-left font-medium">{t('Tarif')}</th>
                                        <th className="px-4 py-3 text-left font-medium">{t('Statut')}</th>
                                        <th className="px-4 py-3 text-right font-medium">{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.data.map((s) => (
                                        <tr key={s.id} className="border-b hover:bg-muted/30">
                                            <td className="px-4 py-3 font-mono font-medium">{s.code}</td>
                                            <td className="px-4 py-3">{s.nom}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{s.categorie}</td>
                                            <td className="px-4 py-3">{s.tarif_unitaire ? `${s.tarif_unitaire} EUR` : '—'}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={s.actif ? 'default' : 'secondary'}>
                                                    {s.actif ? t('Actif') : t('Inactif')}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/administration/services-assistance/${s.id}/edit`}>
                                                            <Pencil className="size-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {services.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                {t('Aucun service enregistré.')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {services.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {services.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
