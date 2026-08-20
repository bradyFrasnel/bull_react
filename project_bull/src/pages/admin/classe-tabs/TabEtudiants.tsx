import React, { useEffect, useState } from 'react';
import { api, apiBulk } from '../../../services/api';
import { Loader2, Users, Download, Upload, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  buildCreatePayloadFromExcelRow,
  exportEtudiantsToInstitutionalExcel,
  extractStudentsFromWorksheet,
} from '../../../utils/etudiantExcel';

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
      setEtudiants(res.data || []);
    } catch (err) {
      console.error("Erreur chargement étudiants:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    exportEtudiantsToInstitutionalExcel(etudiants, {
      classeNom: classe?.nom,
      classeCode: classe?.code,
      anneeUniversitaire: classe?.anneeUniversitaire,
    });
  };

  // ── Importer un fichier Excel (modèle DAR_A ou classeur multi-onglets ASUR) ───
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError('');
    setSuccess('');

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        // ── Détection automatique du type de classeur ──────────────────────
        // Si le classeur a plusieurs onglets avec des noms de matières → format ASUR multi-onglets
        const ONGLETS_IGNORES = ['absence', 'absences', 'bulletin', 'tabnot', 'tabnotss',
          'resultat', 'recap', 'jury', 'raz', 'lan', 'envwin', 'envlinx',
          'interop', 'crypt', 'prev', 'contrl', 'ccna'];

        const ongletsNotes = wb.SheetNames.filter(
          (n) => !ONGLETS_IGNORES.some((k) => n.toLowerCase().includes(k))
        );

        const premierSheet = wb.Sheets[wb.SheetNames[0]];
        const rows2D: unknown[][] = XLSX.utils.sheet_to_json(premierSheet, { header: 1, defval: '' });
        const texteDebut = rows2D.slice(0, 15).flat().map((v) => String(v).toLowerCase()).join(' ');
        const estFormatASUR = texteDebut.includes('mati') || texteDebut.includes('coefficient') ||
          texteDebut.includes('semestre') || wb.SheetNames.length > 3;

        if (estFormatASUR && ongletsNotes.length > 1) {
          // ── FORMAT ASUR MULTI-ONGLETS → envoyer au backend /import/excel ──
          const formData = new FormData();
          formData.append('file', file);
          formData.append('classeId', classeId); // rattacher à la classe courante
          const res = await apiBulk.post('/import/excel', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 300000, // 5 minutes pour les gros classeurs
          });
          const data = res.data;
          setSuccess(
            `Import réussi ! ${data.nbOngletstraites} matière(s) traitée(s) | ` +
            `${data.totalEtudiantsCreees} étudiant(s) créé(s) | ` +
            `${data.totalNotesImportees} note(s) importée(s)` +
            (data.totalErreurs > 0 ? ` | ${data.totalErreurs} erreur(s) ignorée(s)` : '')
          );
          await fetchEtudiants();
          return;
        }

        // ── FORMAT DAR_A (liste étudiants simple) → traitement frontend ────
        const ws = wb.Sheets[wb.SheetNames[0]];
        const { validRows, errors } = extractStudentsFromWorksheet(ws);

        if (validRows.length === 0) {
          const detail = errors.length
            ? errors.slice(0, 5).map((e) => `Ligne ${e.rowNumber}: ${e.message}`).join(' | ')
            : "Aucune donnée d'étudiant valide n'a été trouvée. Si c'est un classeur multi-onglets ASUR, vérifiez que les onglets contiennent Classe, Matière et Coefficient.";
          throw new Error(detail);
        }

        let createdCount = 0;
        let errorsCount = errors.length;
        let lastErrorMsg = '';

        for (let i = 0; i < validRows.length; i++) {
          const payload = buildCreatePayloadFromExcelRow(validRows[i], i, { classeId });
          try {
            await api.post('/auth/admin/create-etudiant', payload);
            createdCount++;
          } catch (err: any) {
            console.error('Erreur inscription étudiant:', validRows[i], err);
            errorsCount++;
            lastErrorMsg = err.response?.data?.message || err.message || 'Erreur API';
          }
        }

        const skippedMsg = errors.length
          ? ` ${errors.length} ligne(s) ignorée(s) (champs obligatoires manquants).`
          : '';

        if (createdCount > 0) {
          setSuccess(
            `${createdCount} étudiant(s) inscrit(s) avec succès !${
              errorsCount > 0 ? ` (${errorsCount} erreur(s))` : ''
            }${skippedMsg}`
          );
          await fetchEtudiants();
        } else {
          setError(
            `Aucun étudiant n'a pu être inscrit.${skippedMsg} ${lastErrorMsg ? `(Erreur: ${lastErrorMsg})` : ''}`
          );
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Erreur lors de la lecture du fichier Excel.');
      } finally {
        setImporting(false);
        e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
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
            Colonnes obligatoires : Nom, Prénom, Date et Lieu de naissance, Sexe (modèle DAR_A) — ou classeur multi-onglets ASUR (relevés de notes).
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportExcel}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium transition-colors shadow-sm"
            title="Télécharger le fichier Excel avec données pré-remplies"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            {etudiants.length > 0 ? 'Exporter la liste Excel' : 'Fichier modèle pré-rempli'}
          </button>
          <label className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors cursor-pointer shadow-sm">
            {importing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Importer Excel
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
            Importez le classeur multi-onglets ASUR (relevés de notes par matière) ou le fichier modèle DAR_A (liste étudiants).
          </p>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> Télécharger le modèle pré-rempli
          </button>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Matricule</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Nom & Prénom</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Email</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Date & Lieu de Naissance</th>
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
                    {etudiant.utilisateur?.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {etudiant.date_naissance ? new Date(etudiant.date_naissance).toLocaleDateString('fr-FR') : '—'} {etudiant.lieu_naissance ? `à ${etudiant.lieu_naissance}` : ''}
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
