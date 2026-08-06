import { Head, Link } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import AdminTabs from '@/components/admin-tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface TypeEquipement {
    id: number;
    code: string;
    nom: string;
    nom_en: string | null;
    description: string | null;
    actif: boolean;
}

interface Props {
    types: TypeEquipement[];
}

export default function AdministrationTypesEquipementIndex({ types }: Props) {
    const { t } = useLaravelReactI18n();

    return (
        <AppLayout breadcrumbs={[
            { title: t('Administration'), href: '/administration/utilisateurs' },
            { title: t("Types d'équipement"), href: '/administration/types-equipement' },
        ]}>
            <Head title={t("Gestion des types d'équipement")} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold">{t("Types d'équipement")}</h1>
                    <Button asChild>
                        <Link href="/administration/types-equipement/create">
                            <Plus className="mr-2 size-4" />
                            {t("Nouveau type d'équipement")}
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
                                        <th className="px-4 py-3 text-left font-medium">{t('Statut')}</th>
                                        <th className="px-4 py-3 text-right font-medium">{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {types.map((type) => (
                                        <tr key={type.id} className="border-b hover:bg-muted/30">
                                            <td className="px-4 py-3 font-mono font-medium">{type.code}</td>
                                            <td className="px-4 py-3">{type.nom}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={type.actif ? 'default' : 'secondary'}>
                                                    {type.actif ? t('Actif') : t('Inactif')}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/administration/types-equipement/${type.id}/edit`}>
                                                            <Pencil className="size-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {types.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                                {t("Aucun type d'équipement enregistré.")}
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
