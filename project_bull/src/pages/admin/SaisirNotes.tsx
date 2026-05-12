import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { matiereService, etudiantService } from '../../services';
import { evaluationService } from '../../services/evaluation.service';
import { useAuth } from '../../hooks/useAuth';
import {
  Save, AlertCircle, Loader2, BookOpen, CheckCircle, RefreshCw,
} from 'lucide-react';
import { Matiere } from '../../types';

interface ReleveRow {
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
}

export const SaisirNotes: React.FC = () => {
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

  // Charger le relevé complet de la matière (tous les étudiants + notes existantes)
  const fetchReleve = async () => {
    try {
      setLoadingReleve(true);
      setError('');
      setRows([]);

      const data = await evaluationService.getReleve(selectedMatiere);
      // data = { matiere: {...}, releve: [{ utilisateurId, nom, prenom, matricule, noteCC, noteExamen, noteRattrapage, ... }] }

      if (data?.releve) {
        const mapped: ReleveRow[] = data.releve.map((r: any) => {
          const cc = r.noteCC !== null && r.noteCC !== undefined ? String(r.noteCC) : '';
          const ex = r.noteExamen !== null && r.noteExamen !== undefined ? String(r.noteExamen) : '';
          const ra = r.noteRattrapage !== null && r.noteRattrapage !== undefined ? String(r.noteRattrapage) : '';

          // Calcul prévisualisation moyenne
          const notes = [r.noteCC, r.noteExamen, r.noteRattrapage]
            .filter(n => n !== null && n !== undefined) as number[];
          let moy: number | undefined;
          if (notes.length > 0) {
            const sorted = [...notes].sort((a, b) => b - a).slice(0, 2);
            moy = sorted.reduce((a, b) => a + b, 0) / sorted.length;
          }

          // Rattrapage autorisé si moyenne CC+Examen < 6
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
          };
        });
        setRows(mapped);
      } else {
        // Fallback : charger les étudiants et construire un relevé vide
        const etudiants = await etudiantService.getAll();
        setRows(etudiants.map(e => ({
          utilisateurId: e.id,
          nom: e.utilisateur?.nom ?? '',
          prenom: e.prenom,
          matricule: e.matricule,
          noteCC: '', noteExamen: '', noteRattrapage: '',
        })));
      }
    } catch (err: any) {
      // Fallback si l'endpoint releve n'existe pas encore
      try {
        const etudiants = await etudiantService.getAll();
        setRows(etudiants.map(e => ({
          utilisateurId: e.id,
          nom: e.utilisateur?.nom ?? '',
          prenom: e.prenom,
          matricule: e.matricule,
          noteCC: '', noteExamen: '', noteRattrapage: '',
        })));
      } catch {
        setError('Erreur lors du chargement du relevé');
      }
    } finally {
      setLoadingReleve(false);
    }
  };

  const updateRow = (index: number, field: 'noteCC' | 'noteExamen' | 'noteRattrapage', value: string) => {
    setRows(prev => {
      const updated = [...prev];
      const row = { ...updated[index], [field]: value };

      // Recalcul prévisualisation
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

      // Rattrapage autorisé
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

    // Validation
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
      // Vérifier rattrapage
      if (row.noteRattrapage !== '' && !row.rattrapageAutorise) {
        setError(`Rattrapage non autorisé pour ${row.nom} ${row.prenom} (moyenne initiale ≥ 6/20)`);
        return;
      }
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const notes = rows.map(row => ({
        utilisateurId: row.utilisateurId,
        noteCC: row.noteCC !== '' ? parseFloat(row.noteCC) : null,
        noteExamen: row.noteExamen !== '' ? parseFloat(row.noteExamen) : null,
        noteRattrapage: row.noteRattrapage !== '' ? parseFloat(row.noteRattrapage) : null,
      }));

      await evaluationService.saveReleve(selectedMatiere, user?.id ?? '', notes);
      setSuccess(`Relevé sauvegardé — ${rows.length} étudiants mis à jour`);
      await fetchReleve(); // Recharger pour avoir les IDs et moyennes calculées
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const matiere = matieres.find(m => m.id === selectedMatiere);
  const noteColor = (val: string) => {
    if (!val) return 'text-gray-400';
    const n = parseFloat(val);
    if (isNaN(n)) return 'text-red-500';
    return n >= 10 ? 'text-green-700' : 'text-red-600';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notes & Absences</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Saisie en masse — toute la classe en une seule opération
            </p>
          </div>
          <div className="flex gap-3">
            {selectedMatiere && (
              <button
                onClick={fetchReleve}
                disabled={loadingReleve}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loadingReleve ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !selectedMatiere || rows.length === 0}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all text-sm font-medium"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer tout
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {/* Sélection matière */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <BookOpen className="w-4 h-4 inline mr-1" />
            Matière
          </label>
          <select
            value={selectedMatiere}
            onChange={e => setSelectedMatiere(e.target.value)}
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Sélectionner une matière</option>
            {matieres.map(m => (
              <option key={m.id} value={m.id}>
                {m.libelle} — Coef. {m.coefficient} — {m.credits} crédits
              </option>
            ))}
          </select>
          {matiere && (
            <p className="text-xs text-gray-500 mt-2">
              {rows.length} étudiant(s) dans le relevé
            </p>
          )}
        </div>

        {/* Tableau de saisie */}
        {loadingReleve ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : rows.length > 0 ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Étudiant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Matricule
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-blue-700 uppercase tracking-wide w-28">
                      CC (/20)
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-blue-700 uppercase tracking-wide w-28">
                      Examen (/20)
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-amber-700 uppercase tracking-wide w-28">
                      Rattrapage
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide w-24">
                      Moy. prévis.
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row, i) => (
                    <tr key={row.utilisateurId} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-4 py-2.5">
                        <span className="font-medium text-gray-900 text-sm">
                          {row.nom} {row.prenom}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">{row.matricule}</td>

                      {/* CC */}
                      <td className="px-4 py-2.5">
                        <input
                          type="number" min="0" max="20" step="0.01"
                          value={row.noteCC}
                          onChange={e => updateRow(i, 'noteCC', e.target.value)}
                          placeholder="—"
                          className={`w-full px-2 py-1.5 border rounded-lg text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            row.noteCC ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
                          }`}
                        />
                      </td>

                      {/* Examen */}
                      <td className="px-4 py-2.5">
                        <input
                          type="number" min="0" max="20" step="0.01"
                          value={row.noteExamen}
                          onChange={e => updateRow(i, 'noteExamen', e.target.value)}
                          placeholder="—"
                          className={`w-full px-2 py-1.5 border rounded-lg text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            row.noteExamen ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
                          }`}
                        />
                      </td>

                      {/* Rattrapage */}
                      <td className="px-4 py-2.5">
                        <input
                          type="number" min="0" max="20" step="0.01"
                          value={row.noteRattrapage}
                          onChange={e => updateRow(i, 'noteRattrapage', e.target.value)}
                          placeholder="—"
                          disabled={!row.rattrapageAutorise && !row.noteRattrapage}
                          title={!row.rattrapageAutorise ? 'Rattrapage non autorisé (moyenne ≥ 6)' : ''}
                          className={`w-full px-2 py-1.5 border rounded-lg text-center text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-40 disabled:cursor-not-allowed ${
                            row.noteRattrapage ? 'border-amber-300 bg-amber-50' : 'border-gray-300'
                          }`}
                        />
                      </td>

                      {/* Moyenne prévisualisation */}
                      <td className="px-4 py-2.5 text-center">
                        {row.moyenneCalculee !== undefined ? (
                          <span className={`font-bold text-sm ${
                            row.moyenneCalculee >= 10 ? 'text-green-700' : 'text-red-600'
                          }`}>
                            {row.moyenneCalculee.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer avec bouton save */}
            <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {rows.filter(r => r.noteCC || r.noteExamen).length} / {rows.length} étudiants avec notes
              </p>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all text-sm font-medium"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Enregistrer tout
              </button>
            </div>
          </div>
        ) : selectedMatiere ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Aucun étudiant trouvé pour cette matière</p>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
};
