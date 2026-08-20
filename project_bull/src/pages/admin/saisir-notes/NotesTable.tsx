import React from 'react';
import { Loader2, BookOpen, Save } from 'lucide-react';
import { ReleveRow } from './useSaisirNotes';

interface NotesTableProps {
  rows: ReleveRow[];
  loadingReleve: boolean;
  selectedMatiere: string;
  saving: boolean;
  updateRow: (index: number, field: 'noteCC' | 'noteExamen' | 'noteRattrapage' | 'heuresAbsence', value: string) => void;
  handleSave: () => void;
}

export const NotesTable: React.FC<NotesTableProps> = ({
  rows,
  loadingReleve,
  selectedMatiere,
  saving,
  updateRow,
  handleSave
}) => {
  if (loadingReleve) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (rows.length === 0) {
    if (selectedMatiere) {
      return (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Aucun étudiant trouvé pour cette matière</p>
        </div>
      );
    }
    return null;
  }

  return (
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
              <th className="px-4 py-3 text-center text-xs font-semibold text-red-700 uppercase tracking-wide w-24">
                Absences
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
                    className={`w-full px-2 py-1.5 border rounded-lg text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${row.noteCC ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
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
                    className={`w-full px-2 py-1.5 border rounded-lg text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${row.noteExamen ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
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
                    className={`w-full px-2 py-1.5 border rounded-lg text-center text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-40 disabled:cursor-not-allowed ${row.noteRattrapage ? 'border-amber-300 bg-amber-50' : 'border-gray-300'
                      }`}
                  />
                </td>

                {/* Absences */}
                <td className="px-4 py-2.5">
                  <input
                    type="number" min="0" step="1"
                    value={row.heuresAbsence}
                    onChange={e => updateRow(i, 'heuresAbsence', e.target.value)}
                    placeholder="0"
                    className={`w-full px-2 py-1.5 border rounded-lg text-center text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent ${row.heuresAbsence ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                  />
                </td>

                {/* Moyenne prévisualisation */}
                <td className="px-4 py-2.5 text-center">
                  {row.moyenneCalculee !== undefined ? (
                    <span className={`font-bold text-sm ${row.moyenneCalculee >= 10 ? 'text-green-700' : 'text-red-600'
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
  );
};
