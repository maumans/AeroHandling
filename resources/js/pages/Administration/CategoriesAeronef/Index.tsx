import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import AdminTabs from '@/components/admin-tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface CategorieAeronef {
    id: number;
    code: string;
    nom: string;
    tonnage_min: string | null;
    tonnage_max: string | null;
    tarif_atterrissage_passager: string;
    tarif_atterrissage_cargo: string;
    actif: boolean;
}

interface PaginatedData {
    data: CategorieAeronef[];
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    categories: PaginatedData;
}

export default function AdministrationCategoriesAeronefIndex({ categories }: Props) {
    const { t } = useLaravelReactI18n();

    return (
        <AppLayout breadcrumbs={[
            { title: t('Administration'), href: '/administration/utilisateurs' },
            { title: t("Catégories d'aéronefs"), href: '/administration/categories-aeronef' },
        ]}>
            <Head title={t("Gestion catégories d'aéronefs")} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold">{t("Gestion des catégories d'aéronefs")}</h1>
                    <Button asChild>
                        <Link href="/administration/categories-aeronef/create">
                            <Plus className="mr-2 size-4" />
                            {t('Nouvelle catégorie')}
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
                                        <th className="px-4 py-3 text-left font-medium">{t('Tonnage')}</th>
                                        <th className="px-4 py-3 text-left font-medium">{t('Tarifs de base')}</th>
                                        <th className="px-4 py-3 text-left font-medium">{t('Statut')}</th>
                                        <th className="px-4 py-3 text-right font-medium">{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.data.map((c) => (
                                        <tr key={c.id} className="border-b hover:bg-muted/30">
                                            <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                                            <td className="px-4 py-3">{c.nom}</td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {c.tonnage_min || 0}t - {c.tonnage_max ? `${c.tonnage_max}t` : '∞'}
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                Pax: {c.tarif_atterrissage_passager} € <br/>
                                                Cargo: {c.tarif_atterrissage_cargo} €
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={c.actif ? 'default' : 'secondary'}>
                                                    {c.actif ? t('Actif') : t('Inactif')}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/administration/categories-aeronef/${c.id}/edit`}>
                                                            <Pencil className="size-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {categories.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                {t('Aucune catégorie enregistrée.')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {categories.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {categories.links.map((link, i) => (
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
