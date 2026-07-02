import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { useRechercheGlobaleItems } from '@/hooks/use-recherche-globale-items';

export function RechercheGlobale() {
    const [ouvert, setOuvert] = useState(false);
    const items = useRechercheGlobaleItems();

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOuvert((valeur) => !valeur);
            }
        }

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, []);

    function allerA(href: string) {
        setOuvert(false);
        router.visit(href);
    }

    const groupes = Array.from(new Set(items.map((item) => item.groupe)));
    const estMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac');

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setOuvert(true)}
                className="hidden items-center gap-2 text-muted-foreground sm:flex"
            >
                <Search className="size-4" />
                <span className="text-sm">Rechercher...</span>
                <kbd className="ml-2 rounded border bg-muted px-1.5 py-0.5 text-xs">{estMac ? '⌘K' : 'Ctrl+K'}</kbd>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setOuvert(true)} className="sm:hidden">
                <Search className="size-4" />
            </Button>

            <CommandDialog open={ouvert} onOpenChange={setOuvert}>
                <CommandInput placeholder="Rechercher une page ou une action..." />
                <CommandList>
                    <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
                    {groupes.map((groupe) => (
                        <CommandGroup key={groupe} heading={groupe}>
                            {items
                                .filter((item) => item.groupe === groupe)
                                .map((item) => (
                                    <CommandItem
                                        key={item.href}
                                        value={`${item.titre} ${item.description ?? ''}`}
                                        onSelect={() => allerA(item.href)}
                                    >
                                        <item.icon className="mr-2 size-4" />
                                        <div className="flex flex-col">
                                            <span>{item.titre}</span>
                                            {item.description && (
                                                <span className="text-xs text-muted-foreground">{item.description}</span>
                                            )}
                                        </div>
                                    </CommandItem>
                                ))}
                        </CommandGroup>
                    ))}
                </CommandList>
            </CommandDialog>
        </>
    );
}
