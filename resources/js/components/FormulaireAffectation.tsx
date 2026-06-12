import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';

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
    onSuccess?: () => void;
}

export default function FormulaireAffectation({ demandeId, equipementsDisponibles, agentsDisponibles, onSuccess }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        equipement_id: '',
        utilisateur_affectation_id: '',
        date_debut: '',
        date_fin: '',
        notes: '',
    });

    const soumettre: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/demandes/${demandeId}/affectations`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                if (onSuccess) onSuccess();
            },
        });
    };

    return (
        <form onSubmit={soumettre} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="equipement_id">Équipement</Label>
                    <Combobox
                        value={data.equipement_id}
                        onChange={(v) => setData('equipement_id', v)}
                        placeholder="Sélectionner un équipement"
                        options={[
                            { label: "Aucun équipement", value: "null" },
                            ...equipementsDisponibles.map((eq) => ({
                                label: `${eq.code} - ${eq.nom}`,
                                value: String(eq.id),
                            })),
                        ]}
                    />
                    {errors.equipement_id && <p className="text-sm text-destructive">{errors.equipement_id}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="utilisateur_affectation_id">Agent assigné</Label>
                    <Combobox
                        value={data.utilisateur_affectation_id}
                        onChange={(v) => setData('utilisateur_affectation_id', v)}
                        placeholder="Sélectionner un agent"
                        options={[
                            { label: "Aucun agent", value: "null" },
                            ...agentsDisponibles.map((agent) => ({
                                label: agent.name,
                                value: String(agent.id),
                            })),
                        ]}
                    />
                    {errors.utilisateur_affectation_id && <p className="text-sm text-destructive">{errors.utilisateur_affectation_id}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="date_debut">Date de début</Label>
                    <Input
                        id="date_debut"
                        type="datetime-local"
                        value={data.date_debut}
                        onChange={(e) => setData('date_debut', e.target.value)}
                        required
                    />
                    {errors.date_debut && <p className="text-sm text-destructive">{errors.date_debut}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="date_fin">Date de fin</Label>
                    <Input
                        id="date_fin"
                        type="datetime-local"
                        value={data.date_fin}
                        onChange={(e) => setData('date_fin', e.target.value)}
                        required
                    />
                    {errors.date_fin && <p className="text-sm text-destructive">{errors.date_fin}</p>}
                </div>

                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="notes">Notes (Optionnel)</Label>
                    <Input
                        id="notes"
                        type="text"
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        placeholder="Instructions particulières..."
                    />
                    {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={processing}>
                    Ajouter l'affectation
                </Button>
            </div>
        </form>
    );
}
