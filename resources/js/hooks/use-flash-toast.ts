import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type Flash = { success?: string; error?: string; warning?: string; info?: string };

export function useFlashToast(): void {
    const { props } = usePage();
    const flash = (props as { flash?: Flash }).flash;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (flash?.warning) toast.warning(flash.warning);
        if (flash?.info) toast.info(flash.info);
    }, [flash?.success, flash?.error, flash?.warning, flash?.info]);
}
