import { Monitor, Moon, Sun } from 'lucide-react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';

export function ThemeToggle() {
    const { appearance, resolvedAppearance, updateAppearance } = useAppearance();
    const { t } = useLaravelReactI18n();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const options: { value: Appearance; label: string; icon: typeof Sun }[] = [
        { value: 'light', label: t('Clair'), icon: Sun },
        { value: 'dark', label: t('Sombre'), icon: Moon },
        { value: 'system', label: t('Système'), icon: Monitor },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-9"
                    aria-label={t('Changer le thème')}
                >
                    {mounted && resolvedAppearance === 'dark' ? (
                        <Moon className="size-5" />
                    ) : (
                        <Sun className="size-5" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {options.map(({ value, label, icon: Icon }) => (
                    <DropdownMenuItem
                        key={value}
                        onClick={() => updateAppearance(value)}
                        className={
                            appearance === value
                                ? 'bg-accent font-medium'
                                : ''
                        }
                    >
                        <Icon className="mr-2 size-4" />
                        {label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
