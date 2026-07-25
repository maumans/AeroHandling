import { router, usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

const languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
];

export function LanguageSwitcher() {
    const { locale } = usePage().props as { locale: string };
    const { setLocale } = useLaravelReactI18n();

    const currentLang = languages.find((l) => l.code === locale) ?? languages[0];

    const switchLanguage = (code: string) => {
        setLocale(code);
        router.post(
            `/language/${code}`,
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <DropdownMenu>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="group h-9 w-9 cursor-pointer"
                        >
                            <Globe className="!size-5 opacity-80 group-hover:opacity-100" />
                        </Button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{currentLang.label}</p>
                </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => switchLanguage(lang.code)}
                        className={
                            locale === lang.code
                                ? 'bg-accent font-semibold'
                                : 'cursor-pointer'
                        }
                    >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
