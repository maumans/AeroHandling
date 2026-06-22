import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';

export default function AuthLayout({
    title = '',
    description = '',
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    const annee = new Date().getFullYear();

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <div className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border/60 bg-background shadow-xl lg:grid-cols-2">
                {/* Côté formulaire (clair) */}
                <div className="flex flex-col px-6 py-8 sm:px-10">
                    <Link
                        href={home()}
                        className="flex items-center gap-2 self-start font-bold tracking-tight text-foreground transition-opacity hover:opacity-80"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B2545] text-white shadow-sm">
                            <AppLogoIcon className="size-6 text-white" />
                        </div>
                        <span className="text-lg">AeroHandling</span>
                    </Link>

                    <div className="my-auto w-full max-w-sm space-y-5 py-6">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {title || 'Connexion'}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {description || 'Veuillez vous authentifier pour continuer.'}
                            </p>
                        </div>

                        {children}
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Portail sécurisé AeroHandling &copy; {annee}
                    </p>
                </div>

                {/* Côté marque (sombre) */}
                <div className="relative hidden overflow-hidden bg-[#0B1120] p-8 text-white lg:flex lg:flex-col lg:justify-between">
                    {/* Stries lumineuses diagonales */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -right-10 -top-10 h-[150%] w-28 rotate-[24deg] bg-gradient-to-b from-white/20 via-white/5 to-transparent blur-2xl" />
                        <div className="absolute right-16 -top-10 h-[150%] w-10 rotate-[24deg] bg-gradient-to-b from-[#1B98E0]/40 via-[#1B98E0]/10 to-transparent blur-xl" />
                        <div className="absolute right-32 -top-10 h-[150%] w-3 rotate-[24deg] bg-gradient-to-b from-white/30 to-transparent blur-md" />
                    </div>

                    {/* Logo filigrane */}
                    <AppLogoIcon className="pointer-events-none absolute -left-8 top-4 size-72 text-white/[0.04]" />

                    {/* Libellé marque */}
                    <div className="relative z-10 flex items-center gap-2 text-sm font-semibold tracking-wide text-white/80">
                        <AppLogoIcon className="size-5 text-white" />
                        AeroHandling
                    </div>

                    {/* Accroche */}
                    <div className="relative z-10 max-w-md space-y-4">
                        <h2 className="text-2xl font-bold leading-tight xl:text-3xl">
                            Bienvenue sur AeroHandling
                        </h2>
                        <p className="text-sm leading-relaxed text-white/70">
                            La plateforme qui orchestre vos opérations d'assistance en escale :
                            demandes, planification des ressources, capacités et autorisations.
                        </p>

                        {/* Carte vitrée flottante */}
                        <div className="mt-4 rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10 backdrop-blur-sm">
                            <h3 className="text-base font-semibold leading-snug">
                                Prêt à coordonner votre prochaine escale ?
                            </h3>
                            <p className="mt-1.5 text-sm leading-relaxed text-white/70">
                                Connectez-vous pour accéder à vos demandes, au planning et aux
                                indicateurs en temps réel.
                            </p>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="flex -space-x-3">
                                    {[
                                        { initials: 'HD', color: 'bg-[#1B98E0]' },
                                        { initials: 'CO', color: 'bg-emerald-500' },
                                        { initials: 'AC', color: 'bg-amber-500' },
                                    ].map((avatar) => (
                                        <div
                                            key={avatar.initials}
                                            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0B1120] text-xs font-semibold text-white ${avatar.color}`}
                                        >
                                            {avatar.initials}
                                        </div>
                                    ))}
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0B1120] bg-white/10 text-xs font-semibold text-white">
                                        +9
                                    </div>
                                </div>
                                <span className="text-xs text-white/70">
                                    Handling, Coordination & Aviation Civile
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
