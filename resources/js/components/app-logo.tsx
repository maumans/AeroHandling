import AppLogoIcon from '@/components/app-logo-icon';
import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { configDesign } = usePage().props;
    const logoUrl = (configDesign as any)?.logo_url;

    return (
        <>
            <div className="bg-primary flex aspect-square size-8 items-center justify-center rounded-lg text-white">
                {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="object-contain w-full h-full p-1" />
                ) : (
                    <AppLogoIcon className="size-5 fill-current" />
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm group-data-[collapsible=icon]:hidden">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    AeroHandling
                </span>
            </div>
        </>
    );
}
