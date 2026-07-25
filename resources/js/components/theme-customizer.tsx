import { usePage } from '@inertiajs/react';

export default function ThemeCustomizer() {
    const { configDesign } = usePage().props;

    if (!configDesign) return null;

    const { couleur_primaire, couleur_secondaire } = configDesign as any;

    return (
        <style dangerouslySetInnerHTML={{
            __html: `
                :root {
                    --primary: ${couleur_primaire};
                    --ring: ${couleur_primaire};
                    --sidebar-primary: ${couleur_primaire};
                    --sidebar-ring: ${couleur_primaire};
                    
                    --secondary: ${couleur_secondaire};
                }

                .dark {
                    --primary: ${couleur_secondaire};
                    --ring: ${couleur_secondaire};
                    --sidebar-primary: ${couleur_secondaire};
                    --sidebar-ring: ${couleur_secondaire};
                }
            `
        }} />
    );
}
