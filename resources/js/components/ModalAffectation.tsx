import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import FormulaireAffectation from '@/components/FormulaireAffectation';

interface Equipement {
    id: number;
    code: string;
    nom: string;
}

interface Agent {
    id: number;
    name: string;
}

interface Props {
    demandeId: number;
    equipementsDisponibles: Equipement[];
    agentsDisponibles: Agent[];
    children: React.ReactNode;
}

export default function ModalAffectation({ demandeId, equipementsDisponibles, agentsDisponibles, children }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Planifier une affectation</DialogTitle>
                    <DialogDescription>
                        Affectez des ressources (agent et/ou équipement) pour cette demande.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <FormulaireAffectation
                        demandeId={demandeId}
                        equipementsDisponibles={equipementsDisponibles}
                        agentsDisponibles={agentsDisponibles}
                        onSuccess={() => setOpen(false)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
