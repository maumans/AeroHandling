import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import AdminTabs from '@/components/admin-tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface NatureVol {
    id: number;
    code: string;
    nom: string;
    est_cargo: boolean;
    est_vol_special: boolean;
    actif: boolean;
}

interface Props {
    natures: NatureVol[];
}

export default function AdministrationNaturesVolIndex({ natures }: Props) {
    const { t } = useLaravelReactI18n();

    return (
        <AppLayout breadcrumbs={[
            { title: t('Administration'), href: '/administration/utilisateurs' },
            { title: t('Natures de vol'), href: '/administration/natures-vol' },
        ]}>
            <Head title={t("Gestion natures de vol")} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold">{t('Gestion des natures de vol')}</h1>
                    <Button asChild>
                        <Link href="/administration/natures-vol/create">
                            <Plus className="mr-2 size-4" />
                            {t('Nouvelle nature de vol')}
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
                                        <th className="px-4 py-3 text-right font-medium">{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {natures.map((n) => (
                                        <tr key={n.id} className="border-b hover:bg-muted/30">
                                            <td className="px-4 py-3 font-mono font-medium">{n.code}</td>
                                            <td className="px-4 py-3">{n.nom}</td>
                                            <td className="px-4 py-3 flex gap-2">
                                                {n.est_cargo && <Badge variant="outline">{t('Cargo')}</Badge>}
                                                {n.est_vol_special && <Badge variant="outline">{t('Vol Spécial')}</Badge>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={n.actif ? 'default' : 'secondary'}>
                                                    {n.actif ? t('Actif') : t('Inactif')}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/administration/natures-vol/${n.id}/edit`}>
                                                            <Pencil className="size-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {natures.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                                {t('Aucune nature de vol enregistrée.')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
