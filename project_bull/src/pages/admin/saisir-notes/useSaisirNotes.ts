import { useState, useEffect } from 'react';
import { matiereService, etudiantService, absenceService, calculService, evaluationService } from '../../../services';
import { useAuth } from '../../../hooks/useAuth';
import { Matiere } from '../../../types';

export interface ReleveRow {
  utilisateurId: string;
  nom: string;
  prenom: string;
  matricule: string;
  noteCC: string;
  noteExamen: string;
  noteRattrapage: string;
  evalIdCC?: string;
  evalIdExamen?: string;
  evalIdRattrapage?: string;
  moyenneCalculee?: number;
  rattrapageAutorise?: boolean;
  heuresAbsence: string;
  absenceId?: string;
}

export const useSaisirNotes = () => {
  const { user } = useAuth();
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [rows, setRows] = useState<ReleveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReleve, setLoadingReleve] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchMatieres(); }, []);
  useEffect(() => { if (selectedMatiere) fetchReleve(); }, [selectedMatiere]);

  const fetchMatieres = async () => {
    try {
      setLoading(true);
      const data = await matiereService.getAll();
      setMatieres(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const fetchReleve = async () => {
    try {
      setLoadingReleve(true);
      setError('');
      setRows([]);

      const [data, absences] = await Promise.all([
        evaluationService.getReleve(selectedMatiere).catch(() => null),
        absenceService.getByMatiere(selectedMatiere).catch(() => [])
      ]);

      if (data?.releve) {
        const mapped: ReleveRow[] = data.releve.map((r: any) => {
          const studentAbsence = absences.find((a: any) => a.etudiantId === r.utilisateurId);
          const cc = r.noteCC !== null && r.noteCC !== undefined ? String(r.noteCC) : '';
          const ex = r.noteExamen !== null && r.noteExamen !== undefined ? String(r.noteExamen) : '';
          const ra = r.noteRattrapage !== null && r.noteRattrapage !== undefined ? String(r.noteRattrapage) : '';

          const notes = [r.noteCC, r.noteExamen, r.noteRattrapage].filter(n => n !== null && n !== undefined) as number[];
          let moy: number | undefined;
          if (notes.length > 0) {
            const sorted = [...notes].sort((a, b) => b - a).slice(0, 2);
            moy = sorted.reduce((a, b) => a + b, 0) / sorted.length;
          }

          let rattrapageAutorise = false;
          if (r.noteCC !== null && r.noteExamen !== null) {
            const moyInit = [r.noteCC, r.noteExamen].sort((a, b) => b - a).slice(0, 2)
              .reduce((a: number, b: number) => a + b, 0) / 2;
            rattrapageAutorise = moyInit < 6;
          }

          return {
            utilisateurId: r.utilisateurId,
            nom: r.nom,
            prenom: r.prenom,
            matricule: r.matricule,
            noteCC: cc,
            noteExamen: ex,
            noteRattrapage: ra,
            evalIdCC: r.evalIdCC,
            evalIdExamen: r.evalIdExamen,
            evalIdRattrapage: r.evalIdRattrapage,
            moyenneCalculee: moy,
            rattrapageAutorise,
            heuresAbsence: studentAbsence ? String(studentAbsence.heures) : '',
            absenceId: studentAbsence?.id,
          };
        });
        setRows(mapped);
      } else {
        const etudiants = await etudiantService.getAll();
        setRows(etudiants.map(e => {
          const studentAbsence = absences.find((a: any) => a.etudiantId === e.id);
          return {
            utilisateurId: e.id,
            nom: e.utilisateur?.nom ?? '',
            prenom: e.prenom,
            matricule: e.matricule,
            noteCC: '', noteExamen: '', noteRattrapage: '',
            heuresAbsence: studentAbsence ? String(studentAbsence.heures) : '',
            absenceId: studentAbsence?.id,
          };
        }));
      }
    } catch (err: any) {
      try {
        const [etudiants, absences] = await Promise.all([
          etudiantService.getAll(),
          absenceService.getByMatiere(selectedMatiere).catch(() => [])
        ]);
        setRows(etudiants.map(e => {
          const studentAbsence = absences.find((a: any) => a.etudiantId === e.id);
          return {
            utilisateurId: e.id,
            nom: e.utilisateur?.nom ?? '',
            prenom: e.prenom,
            matricule: e.matricule,
            noteCC: '', noteExamen: '', noteRattrapage: '',
            heuresAbsence: studentAbsence ? String(studentAbsence.heures) : '',
            absenceId: studentAbsence?.id,
          };
        }));
      } catch {
        setError('Erreur lors du chargement du relevé');
      }
    } finally {
      setLoadingReleve(false);
    }
  };

  const updateRow = (index: number, field: 'noteCC' | 'noteExamen' | 'noteRattrapage' | 'heuresAbsence', value: string) => {
    setRows(prev => {
      const updated = [...prev];
      const row = { ...updated[index], [field]: value };

      const cc = parseFloat(row.noteCC);
      const ex = parseFloat(row.noteExamen);
      const ra = parseFloat(row.noteRattrapage);
      const notes = [cc, ex, ra].filter(n => !isNaN(n));
      if (notes.length > 0) {
        const sorted = [...notes].sort((a, b) => b - a).slice(0, 2);
        row.moyenneCalculee = sorted.reduce((a, b) => a + b, 0) / sorted.length;
      } else {
        row.moyenneCalculee = undefined;
      }

      if (!isNaN(cc) && !isNaN(ex)) {
        const moyInit = [cc, ex].sort((a, b) => b - a).slice(0, 2)
          .reduce((a, b) => a + b, 0) / 2;
        row.rattrapageAutorise = moyInit < 6;
      }

      updated[index] = row;
      return updated;
    });
  };

  const handleSave = async () => {
    if (!selectedMatiere) return;

    for (const row of rows) {
      for (const field of ['noteCC', 'noteExamen', 'noteRattrapage'] as const) {
        const val = row[field];
        if (val !== '' && val !== undefined) {
          const n = parseFloat(val);
          if (isNaN(n) || n < 0 || n > 20) {
            setError(`Note invalide pour ${row.nom} ${row.prenom} : "${val}" (doit être entre 0 et 20)`);
            return;
          }
        }
      }
      if (row.heuresAbsence !== '') {
        const n = parseInt(row.heuresAbsence, 10);
        if (isNaN(n) || n < 0) {
          setError(`Heures d'absence invalides pour ${row.nom} ${row.prenom}`);
          return;
        }
      }
      if (row.noteRattrapage !== '' && !row.rattrapageAutorise) {
        setError(`Rattrapage non autorisé pour ${row.nom} ${row.prenom} (moyenne initiale ≥ 6/20)`);
        return;
      }
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const notesPayload = rows
        .filter(row => row.noteCC !== '' || row.noteExamen !== '' || row.noteRattrapage !== '')
        .map(row => ({
          utilisateurId: row.utilisateurId,
          noteCC: row.noteCC !== '' ? parseFloat(row.noteCC) : null,
          noteExamen: row.noteExamen !== '' ? parseFloat(row.noteExamen) : null,
          noteRattrapage: row.noteRattrapage !== '' ? parseFloat(row.noteRattrapage) : null,
        }));

      if (notesPayload.length > 0) {
        try {
          await evaluationService.saveReleve(selectedMatiere, user?.id ?? '', notesPayload);
        } catch (saveErr: any) {
          console.error('[saveReleve] Erreur:', saveErr.response?.data || saveErr.message);
          throw saveErr;
        }
      }

      const absencePromises = rows.map(async row => {
        const heures = row.heuresAbsence !== '' ? parseInt(row.heuresAbsence, 10) : NaN;
        if (!isNaN(heures)) {
          if (row.absenceId) {
            if (heures === 0) {
              await absenceService.delete(row.absenceId).catch(console.error);
            } else {
              await absenceService.update(row.absenceId, { heures }).catch(console.error);
            }
          } else if (heures > 0) {
            await absenceService.create({
              etudiantId: row.utilisateurId,
              matiereId: selectedMatiere,
              heures,
              justifiee: false,
              motif: ''
            }).catch(console.error);
          }
        } else if (row.absenceId) {
          await absenceService.delete(row.absenceId).catch(console.error);
        }
      });
      await Promise.all(absencePromises);

      await Promise.all(
        rows.map(row =>
          calculService.calculerMatiere(row.utilisateurId, selectedMatiere).catch(() => null)
        )
      );

      setSuccess(`Relevé sauvegardé — ${rows.length} étudiants mis à jour`);
      await fetchReleve();
    } catch (err: any) {
      console.error('[handleSave] Erreur complète:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Erreur lors de la sauvegarde';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const matiere = matieres.find(m => m.id === selectedMatiere);

  return {
    matieres, selectedMatiere, setSelectedMatiere,
    rows, loading, loadingReleve, saving, error, success,
    updateRow, handleSave, matiere, fetchReleve
  };
};
