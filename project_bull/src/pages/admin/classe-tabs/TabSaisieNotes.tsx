import React, { useEffect, useState, useRef } from 'react';
import { evaluationService } from '../../../services/evaluation.service';
import { Save, AlertCircle, Loader2, RefreshCw, Edit, Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Matiere } from '../../../types';

interface TabSaisieNotesProps {
  classeId: string;
  classe: any;
}

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

export const TabSaisieNotes: React.FC<TabSaisieNotesProps> = ({ classeId: _classeId, classe }) => {
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [rows, setRows] = useState<ReleveRow[]>([]);
  const [loadingReleve, setLoadingReleve] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extraire toutes les matières des semestres de la classe
  useEffect(() => {
    const extractedMatieres: Matiere[] = [];
    if (classe?.semestres) {
      classe.semestres.forEach((sa: any) => {
        if (sa.semestre?.ues) {
          sa.semestre.ues.forEach((ue: any) => {
            if (ue.matieres) {
              extractedMatieres.push(...ue.matieres);
            }
          });
        }
      });
    }
    setMatieres(extractedMatieres);
  }, [classe]);

  useEffect(() => {
    if (selectedMatiere) {
      fetchReleve();
    } else {
      setRows([]);
    }
  }, [selectedMatiere]);

  const fetchReleve = async () => {
    try {
      setLoadingReleve(true);
      setError('');
      setRows([]);

      const data = await evaluationService.getReleve(selectedMatiere);

      if (data?.releve) {
        const mapped: ReleveRow[] = data.releve.map((r: any) => {
          const cc = r.noteCC !== null && r.noteCC !== undefined ? String(r.noteCC) : '';
          const ex = r.noteExamen !== null && r.noteExamen !== undefined ? String(r.noteExamen) : '';
          const ra = r.noteRattrapage !== null && r.noteRattrapage !== undefined ? String(r.noteRattrapage) : '';

          let moy: number | undefined;
          const notes = [r.noteCC, r.noteExamen, r.noteRattrapage].filter(n => n !== null && n !== undefined) as number[];
          if (notes.length > 0) {
            const sorted = [...notes].sort((a, b) => b - a).slice(0, 2);
            moy = sorted.reduce((a, b) => a + b, 0) / sorted.length;
          }

          let rattrapageAutorise = false;
          if (r.noteCC !== null && r.noteExamen !== null) {
            const moyInit = [r.noteCC, r.noteExamen].sort((a, b) => b - a).slice(0, 2).reduce((a, b) => a + b, 0) / 2;
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
            rattrapageAutorise
          };
        });
        // Ne garder que les étudiants de cette classe (normalement le backend devrait le faire, mais on sécurise)
        const classeEtudiantsIds = classe?.etudiants?.map((e: any) => e.utilisateurId) || [];
        setRows(mapped.filter(r => classeEtudiantsIds.includes(r.utilisateurId)));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement du relevé');
    } finally {
      setLoadingReleve(false);
    }
  };

  const handleChangeNote = (etudiantId: string, type: 'CC' | 'Examen' | 'Rattrapage', value: string) => {
    if (value && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 20)) return;
    setRows(prev => prev.map(r => r.utilisateurId === etudiantId ? { ...r, [`note${type}`]: value } : r));
  };

  const handleSaveAll = async () => {
    if (!selectedMatiere) return;
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const notesToSave = rows.map(row => ({
        utilisateurId: row.utilisateurId,
        noteCC: row.noteCC !== '' ? Number(row.noteCC) : null,
        noteExamen: row.noteExamen !== '' ? Number(row.noteExamen) : null,
        noteRattrapage: row.noteRattrapage !== '' ? Number(row.noteRattrapage) : null,
      }));

      await evaluationService.saveReleve(selectedMatiere, 'Système', notesToSave);

      setSuccess('Toutes les notes ont été enregistrées avec succès.');
      await fetchReleve();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error(err);
      setError('Erreur lors de la sauvegarde des notes.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportExcel = () => {
    if (!selectedMatiere || rows.length === 0) return;

    const matiereObj = matieres.find(m => m.id === selectedMatiere);
    const matiereName = matiereObj?.libelle || 'Matiere';
    const coef = matiereObj?.coefficient ?? 1;

    // Retrouver le semestre associé à cette matière dans la classe
    let semestreNum = '1';
    let semestreLibelle = 'Semestre 1';
    if (classe?.semestres) {
      for (const sa of classe.semestres) {
        const sem = sa.semestre;
        if (sem?.ues?.some((ue: any) => ue.matieres?.some((m: any) => m.id === selectedMatiere))) {
          semestreLibelle = sem.libelle || sem.code || 'Semestre 1';
          const mNum = String(sem.code || sem.libelle || '1').match(/(\d+)/);
          if (mNum) semestreNum = mNum[1];
          break;
        }
      }
    }

    const classeNom = classe?.nom || classe?.code || 'LP ASUR';
    const annee = classe?.anneeUniversitaire || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

    // En-tête institutionnel conforme au modèle attendu par ImportService
    const aoa: any[][] = [
      ['INPTIC — RELEVÉ DE NOTES PAR MATIÈRE'],
      [''],
      ['Classe', classeNom, '', 'Année universitaire', annee],
      ['Semestre', semestreNum, semestreLibelle, 'Coefficient', coef],
      ['Matière', matiereName],
      [''],
      ['N°', 'Matricule', 'Élève', 'Nom', 'Prénom', 'Note CC (/20)', 'Note Examen (/20)', 'Rattrapage (/20)'],
    ];

    rows.forEach((r, idx) => {
      aoa.push([
        idx + 1,
        r.matricule || '',
        `${r.nom} ${r.prenom}`.trim(),
        r.nom || '',
        r.prenom || '',
        r.noteCC !== '' ? Number(r.noteCC) : '',
        r.noteExamen !== '' ? Number(r.noteExamen) : '',
        r.noteRattrapage !== '' ? Number(r.noteRattrapage) : '',
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = [
      { wch: 6 },  // N°
      { wch: 16 }, // Matricule
      { wch: 30 }, // Élève
      { wch: 20 }, // Nom
      { wch: 20 }, // Prénom
      { wch: 15 }, // Note CC
      { wch: 18 }, // Note Examen
      { wch: 16 }, // Rattrapage
    ];

    const wb = XLSX.utils.book_new();
    const safeSheetName = matiereName.replace(/[\\/?*[\]:]/g, '').substring(0, 28) || 'Notes';
    XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
    XLSX.writeFile(wb, `Releve_Notes_${classe?.code || 'Classe'}_${matiereName.replace(/\s+/g, '_')}.xlsx`);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        // Détecter automatiquement la ligne d'en-tête du tableau (compatible avec ou sans en-tête institutionnel)
        const rows2D: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        let headerRowIndex = 0;
        for (let r = 0; r < Math.min(20, rows2D.length); r++) {
          const cells = (rows2D[r] || []).map((c) => String(c ?? '').trim().toLowerCase());
          if (cells.includes('matricule') || cells.some((c) => c.includes('note cc') || c.includes('élève') || c.includes('eleve'))) {
            headerRowIndex = r;
            break;
          }
        }
        const data = XLSX.utils.sheet_to_json(ws, { range: headerRowIndex, defval: '' }) as any[];

        let updatedCount = 0;
        let ignoredCount = 0;

        // Mettre a jour les rows existantes (par matricule ou par couple Nom + Prénom)
        setRows(prevRows => {
          const newRows = [...prevRows];
          data.forEach(row => {
            const matricule = String(row['Matricule'] || row['matricule'] || '').trim();
            const nom = String(row['Nom'] || row['nom'] || '').trim().toLowerCase();
            const prenom = String(row['Prénom'] || row['Prenom'] || row['prenom'] || '').trim().toLowerCase();
            const eleve = String(row['Élève'] || row['Eleve'] || '').trim().toLowerCase();
            if (!matricule && !nom && !eleve) return;

            let rowIndex = matricule ? newRows.findIndex(r => r.matricule === matricule) : -1;
            if (rowIndex === -1 && nom) {
              rowIndex = newRows.findIndex(
                r => r.nom.trim().toLowerCase() === nom && (!prenom || r.prenom.trim().toLowerCase() === prenom),
              );
            }
            if (rowIndex === -1 && eleve) {
              rowIndex = newRows.findIndex(
                r => `${r.nom} ${r.prenom}`.trim().toLowerCase() === eleve,
              );
            }

            if (rowIndex !== -1) {
              const parseNote = (val: any) => {
                if (val === undefined || val === null || val === '') return '';
                const num = Number(String(val).replace(',', '.'));
                return isNaN(num) || num < 0 || num > 20 ? '' : String(num);
              };

              const ccVal = row['Note CC (/20)'] ?? row['CC'] ?? row['Note CC'];
              const exVal = row['Note Examen (/20)'] ?? row['Examen'] ?? row['Note Examen'];
              const raVal = row['Rattrapage (/20)'] ?? row['Rattrapage'];

              newRows[rowIndex] = {
                ...newRows[rowIndex],
                noteCC: parseNote(ccVal),
                noteExamen: parseNote(exVal),
                noteRattrapage: parseNote(raVal)
              };
              updatedCount++;
            } else {
              ignoredCount++;
            }
          });
          return newRows;
        });

        if (ignoredCount > 0) {
          setSuccess(`Attention: ${ignoredCount} ligne(s) ignorée(s) le matricule n'existe pas dans cette classe.`);
        } else {
          setSuccess(`Notes importées avec succès pour ${updatedCount} étudiant(s). Vérifiez le tableau puis enregistrez.`);
        }
        setTimeout(() => setSuccess(''), 7000);
      } catch (error) {
        setError("Erreur lors de la lecture du fichier Excel. Assurez-vous d'utiliser le modèle exporté.");
      }
    };
    reader.readAsBinaryString(file);

    // Reset l'input pour permettre de reselectionner le meme fichier
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (matieres.length === 0) {
    return (
      <div className="text-center py-12">
        <Edit className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Aucune matière</h3>
        <p className="text-gray-500">Ajoutez d'abord des matières au programme de cette classe.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Relever des notes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sélectionnez une matière
            </label>
            <select
              value={selectedMatiere}
              onChange={(e) => setSelectedMatiere(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Choisir une matière</option>
              {matieres.map((m) => (
                <option key={m.id} value={m.id}>{m.libelle} (Coef: {m.coefficient})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg">
          {success}
        </div>
      )}

      {loadingReleve ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : selectedMatiere && rows.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Relevé de la matière</h3>
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportExcel}
                accept=".xlsx, .xls"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                title="Importer depuis Excel"
              >
                <Upload className="w-4 h-4" /> Importer
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                title="Exporter le modèle Excel"
              >
                <Download className="w-4 h-4" /> Exporter
              </button>
              <button
                onClick={fetchReleve}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4" /> Actualiser
              </button>
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Enregistrer toutes les notes
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Étudiant</th>
                  <th className="px-4 py-3 font-semibold">Matricule</th>
                  <th className="px-4 py-3 font-semibold text-center">Note CC (/20)</th>
                  <th className="px-4 py-3 font-semibold text-center">Note Examen (/20)</th>
                  <th className="px-4 py-3 font-semibold text-center">Rattrapage (/20)</th>
                  <th className="px-4 py-3 font-semibold text-center">Moyenne (Aperçu)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map((row) => (
                  <tr key={row.utilisateurId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{row.nom} {row.prenom}</td>
                    <td className="px-4 py-3 font-mono text-gray-500">{row.matricule}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0" max="20" step="0.5"
                        value={row.noteCC}
                        onChange={(e) => handleChangeNote(row.utilisateurId, 'CC', e.target.value)}
                        className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0" max="20" step="0.5"
                        value={row.noteExamen}
                        onChange={(e) => handleChangeNote(row.utilisateurId, 'Examen', e.target.value)}
                        className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0" max="20" step="0.5"
                        value={row.noteRattrapage}
                        disabled={!row.rattrapageAutorise && !row.noteRattrapage}
                        onChange={(e) => handleChangeNote(row.utilisateurId, 'Rattrapage', e.target.value)}
                        className={`w-full px-2 py-1 text-center border rounded focus:ring-1 focus:ring-indigo-500 ${!row.rattrapageAutorise && !row.noteRattrapage ? 'bg-gray-100 border-gray-200 text-gray-400' : 'border-gray-300'}`}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${row.moyenneCalculee && row.moyenneCalculee < 10 ? 'text-red-600' : 'text-green-600'}`}>
                        {row.moyenneCalculee ? row.moyenneCalculee.toFixed(2) : '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : selectedMatiere ? (
        <div className="text-center py-8 text-gray-500">Aucun étudiant inscrit à cette matière (ou aucun étudiant dans la classe).</div>
      ) : null}
    </div>
  );
};
