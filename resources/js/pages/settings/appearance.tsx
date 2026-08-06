import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    const { t } = useLaravelReactI18n();

    return (
        <>
            <Head title={t("Paramètres d'apparence")} />

            <h1 className="sr-only">{t("Paramètres d'apparence")}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t("Paramètres d'apparence")}
                    description={t("Mettez à jour les paramètres d'apparence de votre compte")}
                />
                <AppearanceTabs />
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: "Paramètres d'apparence",
            href: editAppearance(),
        },
    ],
};
