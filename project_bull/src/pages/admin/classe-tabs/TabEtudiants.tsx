import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Loader2, Users, Download, Upload, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface TabEtudiantsProps {
  classeId: string;
}

export const TabEtudiants: React.FC<TabEtudiantsProps> = ({ classeId }) => {
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

  // ── Exporter un fichier Excel pré-rempli ou la liste des étudiants ─────────────
  const handleExportExcel = () => {
    let exportData: any[] = [];

    if (etudiants.length > 0) {
      exportData = etudiants.map((e) => ({
        Matricule: e.matricule || '',
        Nom: e.utilisateur?.nom || '',
        Prénom: e.prenom || '',
        Email: e.utilisateur?.email || '',
        'Mot de passe': 'pass1234',
        'Date Naissance (AAAA-MM-JJ)': e.date_naissance ? e.date_naissance.split('T')[0] : '',
        'Lieu Naissance': e.lieu_naissance || '',
        'Type BAC': e.bac_type || '',
        'Année BAC': e.annee_bac || new Date().getFullYear(),
        Provenance: e.provenance || '',
        Statut: e.statut || 'INSCRIT',
      }));
    } else {
      // Données pré-remplies d'exemple pour l'inscription en masse
      exportData = [
        {
          Matricule: '2024ASUR001',
          Nom: 'MBA NSOME',
          Prénom: 'Yannick Lionel',
          Email: 'yannick.mba@asur.ga',
          'Mot de passe': 'pass1234',
          'Date Naissance (AAAA-MM-JJ)': '2001-05-15',
          'Lieu Naissance': 'Libreville',
          'Type BAC': 'C',
          'Année BAC': '2022',
          Provenance: 'Lycée Léon MBA',
          Statut: 'INSCRIT',
        },
        {
          Matricule: '2024ASUR002',
          Nom: 'YESSA FAYE',
          Prénom: 'David Almond',
          Email: 'david.yessa@asur.ga',
          'Mot de passe': 'pass1234',
          'Date Naissance (AAAA-MM-JJ)': '2000-09-13',
          'Lieu Naissance': 'Port-Gentil',
          'Type BAC': 'D',
          'Année BAC': '2021',
          Provenance: 'Lycée National',
          Statut: 'INSCRIT',
        },
      ];
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [
      { wch: 15 }, // Matricule
      { wch: 20 }, // Nom
      { wch: 20 }, // Prénom
      { wch: 28 }, // Email
      { wch: 15 }, // Password
      { wch: 26 }, // Date Naiss
      { wch: 18 }, // Lieu Naiss
      { wch: 12 }, // Type BAC
      { wch: 12 }, // Année BAC
      { wch: 25 }, // Provenance
      { wch: 14 }, // Statut
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Etudiants');
    XLSX.writeFile(wb, 'inscription_etudiants_pre_rempli.xlsx');
  };

  // ── Importer un fichier Excel pour inscription en masse ─────────────────────
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
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          throw new Error('Le fichier Excel est vide.');
        }

        let createdCount = 0;
        let errorsCount = 0;

        for (const row of data) {
          if (!row.Matricule || !row.Nom || !row.Prénom || !row.Email) continue;

          try {
            await api.post('/auth/admin/create-etudiant', {
              matricule: String(row.Matricule).trim(),
              nom: String(row.Nom).trim(),
              prenom: String(row.Prénom).trim(),
              email: String(row.Email).trim(),
              password: String(row['Mot de passe'] || 'pass1234').trim(),
              date_naissance: row['Date Naissance (AAAA-MM-JJ)']
                ? new Date(row['Date Naissance (AAAA-MM-JJ)']).toISOString()
                : new Date().toISOString(),
              lieu_naissance: String(row['Lieu Naissance'] || '-'),
              bac_type: String(row['Type BAC'] || 'C'),
              annee_bac: parseInt(String(row['Année BAC'] || '2023')),
              provenance: String(row.Provenance || '-'),
              statut: String(row.Statut || 'INSCRIT'),
              classeId: classeId,
            });
            createdCount++;
          } catch (err) {
            console.error('Erreur inscription étudiant:', row, err);
            errorsCount++;
          }
        }

        if (createdCount > 0) {
          setSuccess(
            `${createdCount} étudiant(s) inscrit(s) en masse avec succès ! ${
              errorsCount > 0 ? `(${errorsCount} erreur(s))` : ''
            }`
          );
          await fetchEtudiants();
        } else {
          setError(
            `Aucun étudiant n'a pu être inscrit. Vérifiez le format du fichier (erreurs: ${errorsCount}).`
          );
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la lecture du fichier Excel.');
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
            Importez ou exportez les dossiers étudiants sous format Excel.
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
            Téléchargez le fichier Excel pré-rempli, complétez les données de vos étudiants et cliquez sur "Importer Excel" pour les inscrire en masse.
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
