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
    return (
        <div className="flex min-h-screen bg-background relative overflow-hidden">
            {/* Left Side: Gorgeous Image & Overlay */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[#0B2545] overflow-hidden">
                <img
                    src="/images/login-bg.png"
                    alt="AeroHandling Background"
                    className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay transition-transform duration-1000 hover:scale-105"
                />
                
                {/* Decorative gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2545] via-transparent to-[#1B98E0]/30 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/90 dark:to-background"></div>

                <div className="relative z-10 flex flex-col justify-between p-12 w-full h-full text-white">
                    <Link href={home()} className="flex items-center gap-3 font-bold text-2xl tracking-tight hover:opacity-90 transition-opacity">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md shadow-lg border border-white/20">
                            <AppLogoIcon className="size-8 text-white" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                            AeroHandling
                        </span>
                    </Link>

                    <div className="max-w-lg space-y-6 pb-12">
                        <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tighter">
                            Gérez vos opérations aéroportuaires <br/>
                            <span className="text-[#1B98E0]">avec précision.</span>
                        </h1>
                        <p className="text-lg text-blue-100/80 leading-relaxed font-medium">
                            Une plateforme de nouvelle génération conçue pour l'excellence du handling, la planification des vols et le traitement des capacités.
                        </p>
                        
                        <div className="flex items-center gap-4 pt-4">
                            <div className="flex -space-x-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0B2545] bg-blue-500 shadow-sm text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3.5 3.5L3 16l-1 2 4.1.9L7 23l2-1-1.5-2.5L11 16l5 6 1.8-.7c.4-.2.7-.6.6-1.1z"/></svg>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0B2545] bg-emerald-500 shadow-sm text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0B2545] bg-amber-500 shadow-sm text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 22 1-7 3-3-1-7 7 1 3-3 7 1-3 3 1 7-3 3-1 7-7-1z"/></svg>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0B2545] bg-rose-500 shadow-sm text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
                                </div>
                            </div>
                            <span className="text-sm font-semibold text-white/90">Rejoignez plus de 200 compagnies aériennes.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-12 xl:px-24">
                <div className="mx-auto flex w-full max-w-sm flex-col gap-8 relative z-10">
                    
                    {/* Mobile Logo */}
                    <div className="flex flex-col items-start gap-2 lg:hidden">
                        <Link href={home()} className="flex items-center gap-2 font-bold text-xl tracking-tight">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B2545] text-white">
                                <AppLogoIcon className="size-6 fill-current" />
                            </div>
                            AeroHandling
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="flex flex-col gap-2">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            {title || 'Bienvenue'}
                        </h2>
                        <p className="text-base text-muted-foreground">
                            {description || 'Veuillez vous authentifier pour continuer.'}
                        </p>
                    </div>

                    {/* Form Content */}
                    <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6 shadow-sm">
                        {children}
                    </div>

                    {/* Footer */}
                    <p className="text-center text-sm text-muted-foreground mt-4">
                        AeroHandling Secure Portal &copy; {new Date().getFullYear()}
                    </p>
                </div>
                
                {/* Subtle right-side background pattern / glow for dark mode */}
                <div className="absolute top-0 right-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_100%_-20%,rgba(27,152,224,0.1),rgba(255,255,255,0))]"></div>
            </div>
        </div>
    );
}
