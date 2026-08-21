import React, { useEffect, useState } from 'react';
import { api, apiBulk } from '../../../services/api';
import { Loader2, Users, Download, Upload, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface TabEtudiantsProps {
  classeId: string;
  classe?: { nom?: string; code?: string; anneeUniversitaire?: string };
}

export const TabEtudiants: React.FC<TabEtudiantsProps> = ({ classeId, classe }) => {
  const [etudiants, setEtudiants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEtudiants();
  }, [classeId]);

  const fetchEtudiants = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/classes/${classeId}/etudiants`);
      const sortedData = (res.data || []).sort((a: any, b: any) => (a.utilisateur?.nom || '').localeCompare(b.utilisateur?.nom || ''));
      setEtudiants(sortedData);
    } catch (err) {
      console.error("Erreur chargement étudiants:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (etudiants.length === 0) return;

    const data = etudiants.map((e: any, index: number) => ({
      'N°': index + 1,
      'Matricule': e.matricule || '',
      'Nom': e.utilisateur?.nom || '',
      'Prénom': e.prenom || '',
      'Statut': e.statut || 'INSCRIT',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 6 }, { wch: 18 }, { wch: 30 }, { wch: 25 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Etudiants');
    XLSX.writeFile(wb, `Etudiants_${classe?.code || 'classe'}.xlsx`);
  };

  // ── Importer un classeur de notes complet (envoyé au backend /import/excel) ───
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('classeId', classeId);

      const res = await apiBulk.post('/import/excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000, // 5 minutes pour les gros classeurs
      });

      const data = res.data;
      setSuccess(
        `Import réussi ! ${data.nbOngletsTraites || 0} matière(s) traitée(s) | ` +
        `${data.nbEtudiantsCreees || 0} étudiant(s) créé(s) | ` +
        `${data.nbNotesImportees || 0} note(s) importée(s)` +
        (data.erreurs?.length > 0 ? ` | ${data.erreurs.length} avertissement(s)` : '')
      );
      await fetchEtudiants();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Erreur lors de l'import du classeur Excel.");
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      {/* Barre d'action supérieure */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Liste des étudiants inscrits ({etudiants.length})
          </h2>
          <p className="text-xs text-gray-500">
            Importez un classeur Excel complet (relevés de notes par matière) pour créer automatiquement les étudiants, notes et structure académique.
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {etudiants.length > 0 && (
            <button
              onClick={handleExportExcel}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium transition-colors shadow-sm"
              title="Exporter la liste des étudiants en Excel"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Exporter la liste Excel
            </button>
          )}
          <label className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors cursor-pointer shadow-sm">
            {importing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Importer Classeur de Notes
            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              onChange={handleImportExcel}
              disabled={importing}
            />
          </label>
        </div>
      </div>

      {/* Rendu du Tableau */}
      {etudiants.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <FileSpreadsheet className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900">Aucun étudiant inscrit dans cette classe</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-4">
            Importez le classeur Excel complet (relevés de notes par matière) pour créer automatiquement les étudiants, matières, UE et notes.
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Matricule</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Nom & Prénom</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Email</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {etudiants.map((etudiant) => (
                <tr key={etudiant.utilisateurId || etudiant.matricule} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono font-semibold text-indigo-600">
                    {etudiant.matricule}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    {etudiant.utilisateur?.nom} {etudiant.prenom}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {etudiant.utilisateur?.email || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                      {etudiant.statut || 'INSCRIT'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
