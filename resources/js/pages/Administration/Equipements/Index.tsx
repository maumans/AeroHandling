import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Wrench } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import AdminTabs from '@/components/admin-tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { STATUT_EQUIPEMENT_BADGE } from '@/lib/couleurs';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface Equipement {
    id: number;
    code: string;
    nom: string;
    type: string;
    type_libelle: string;
    statut: string;
    statut_libelle: string;
    capacite_max: string | null;
}

interface PaginatedData {
    data: Equipement[];
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    equipements: PaginatedData;
}

export default function AdministrationEquipementsIndex({ equipements }: Props) {
    const { t } = useLaravelReactI18n();

    return (
        <AppLayout breadcrumbs={[
            { title: t('Administration'), href: '/administration/utilisateurs' },
            { title: t('Équipements'), href: '/administration/equipements' },
        ]}>
            <Head title={t("Gestion équipements")} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold">{t("Gestion des équipements")}</h1>
                    <Button asChild>
                        <Link href="/administration/equipements/creer">
                            <Plus className="mr-2 size-4" />
                            {t('Nouvel équipement')}
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
                                        <th className="px-4 py-3 text-left font-medium">{t('Type')}</th>
                                        <th className="px-4 py-3 text-left font-medium">{t('Statut')}</th>
                                        <th className="px-4 py-3 text-left font-medium">{t('Capacité max')}</th>
                                        <th className="px-4 py-3 text-right font-medium">{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {equipements.data.map((e) => (
                                        <tr key={e.id} className="border-b hover:bg-muted/30">
                                            <td className="px-4 py-3 font-mono font-medium">{e.code}</td>
                                            <td className="px-4 py-3">{e.nom}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{e.type_libelle}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant="secondary" className={STATUT_EQUIPEMENT_BADGE[e.statut] ?? ''}>
                                                    {e.statut_libelle}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">{e.capacite_max ? `${e.capacite_max} t` : '—'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/administration/equipements/${e.id}/editer`}>
                                                            <Pencil className="size-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {equipements.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                {t('Aucun équipement enregistré.')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {equipements.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {equipements.links.map((link, i) => (
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
