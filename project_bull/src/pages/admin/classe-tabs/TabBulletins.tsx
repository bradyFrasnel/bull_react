import React, { useState, useRef, useEffect } from 'react';
import { calculService, bulletinService, semestreService } from '../../../services';
import { statistiquesService } from '../../../services/results.service';
import { importExportService } from '../../../services/bulletin.service';
import { AlertCircle, Loader2, CheckCircle, RefreshCw, BarChart3, Users, FileText, Download, Upload } from 'lucide-react';
import { BulletinDocument, BulletinData, BulletinAnnuelData } from '../../../components/BulletinDocument';
import { createPortal } from 'react-dom';

interface TabBulletinsProps {
  classeId: string;
  classe: any;
}

export const TabBulletins: React.FC<TabBulletinsProps> = ({ classeId, classe }) => {
  const [selectedSemestreId, setSelectedSemestreId] = useState('');
  const [loading, setLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // States pour afficher des données
  const [statsData, setStatsData] = useState<any>(null);
  const [recapRows, setRecapRows] = useState<any[]>([]);
  const [bulletinsToPrint, setBulletinsToPrint] = useState<any[]>([]);
  const [printing, setPrinting] = useState(false);
  const [bulletinType, setBulletinType] = useState<'semestre' | 'annuel'>('semestre');
  const [semestres, setSemestres] = useState<any[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const etudiants = classe?.etudiants || [];

  useEffect(() => {
    const loadSemestres = async () => {
      try {
        let list = [];
        if (classe?.anneeUniversitaire) {
          list = await semestreService.getByAnnee(classe.anneeUniversitaire);
        }
        if (!list || list.length === 0) {
          list = await semestreService.getAll();
        }
        setSemestres(list);
      } catch (err) {
        console.error("Erreur chargement semestres BDD:", err);
      }
    };
    loadSemestres();
  }, [classe?.anneeUniversitaire]);

  const handleRecalculerPromotion = async () => {
    if (!window.confirm(`Recalculer les moyennes pour les ${etudiants.length} étudiants de la classe ?`)) return;
    try {
      setRecalculating(true);
      setError("");
      setSuccess("");
      await Promise.allSettled(etudiants.map((e: any) => calculService.recalculerTout(e.utilisateurId)));
      setSuccess("Recalcul terminé pour toute la classe.");
    } catch {
      setError("Erreur lors du recalcul global");
    } finally {
      setRecalculating(false);
    }
  };

  const handleGenererRecap = async () => {
    if (bulletinType === 'semestre' && !selectedSemestreId) { setError("Sélectionnez un semestre"); return; }
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      setStatsData(null);
      setRecapRows([]);

      if (bulletinType === 'semestre') {
        const raw = await bulletinService.getRecapPromotion(selectedSemestreId);
        if (raw?.etudiants) {
          setRecapRows(raw.etudiants);
        }
      } else {
        const rows: any[] = [];
        for (const etudiant of etudiants) {
          try {
            const raw = await bulletinService.getBulletinAnnuel(etudiant.utilisateurId);
            rows.push({
              etudiantId: etudiant.utilisateurId,
              matricule: etudiant.matricule,
              nom: etudiant.utilisateur?.nom ?? '',
              prenom: etudiant.prenom,
              moyenneS5: raw?.semestre5?.moyenne,
              moyenneS6: raw?.semestre6?.moyenne,
              moyenneAnnuelle: raw?.moyenneAnnuelle,
              creditsAcquis: raw?.creditsAcquis ?? 0,
              decision: raw?.decisionJury,
              mention: raw?.mention
            });
          } catch (e) {
            console.error("Erreur récup bulletin annuel étudiant:", etudiant.utilisateurId, e);
          }
        }
        setRecapRows(rows);
      }
    } catch {
      setError("Erreur lors du chargement du récapitulatif. Assurez-vous d'avoir recalculé les notes.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenererStats = async () => {
    if (!selectedSemestreId) { setError("Sélectionnez un semestre"); return; }
    try {
      setLoading(true);
      setError("");
      setRecapRows([]);

      const raw = await statistiquesService.getStatistiquesSemestre(selectedSemestreId);
      if (raw) {
        setStatsData({
          nombreEtudiants: raw.nombreEtudiants ?? etudiants.length,
          moyenneGenerale: raw.moyenne,
          min: raw.min,
          max: raw.max,
          ecartType: raw.ecartType,
          tauxReussite: raw.tauxReussite
        });
      }
    } catch {
      setError("Erreur lors du calcul des statistiques");
    } finally {
      setLoading(false);
    }
  };

  const printBulletinIndividuel = async (etudiantId: string) => {
    if (bulletinType === 'semestre' && !selectedSemestreId) { setError("Sélectionnez un semestre"); return; }
    try {
      setPrinting(true);
      let raw;
      if (bulletinType === 'semestre') {
        raw = await bulletinService.getBulletinSemestre(etudiantId, selectedSemestreId);
      } else {
        const res = await bulletinService.getBulletinAnnuel(etudiantId);
        raw = {
          type: "annuel",
          etudiant: {
            nom: res.etudiant?.nom ?? "",
            prenom: res.etudiant?.prenom ?? "",
            matricule: res.etudiant?.matricule ?? "",
            dateNaissance: res.etudiant?.dateNaissance,
            lieuNaissance: res.etudiant?.lieuNaissance,
          },
          anneeUniversitaire: res.anneeUniversitaire ?? "",
          semestre5: res.semestre5,
          semestre6: res.semestre6,
          moyenneAnnuelle: res.moyenneAnnuelle,
          creditsTotal: res.creditsTotal ?? 60,
          creditsAcquis: res.creditsAcquis ?? 0,
          decisionJury: res.decisionJury,
          mention: res.mention,
          statistiques: res.statistiques
        };
      }
      setBulletinsToPrint([raw]);
      setTimeout(() => {
        window.print();
        setBulletinsToPrint([]);
        setPrinting(false);
      }, 500);
    } catch (e) {
      setError("Impossible de générer le bulletin pour cet étudiant.");
      setPrinting(false);
    }
  };

  const printClasseBulletins = async () => {
    if (bulletinType === 'semestre' && !selectedSemestreId) { setError("Sélectionnez un semestre"); return; }
    if (recapRows.length === 0) { setError("Générez d'abord le récapitulatif pour avoir la liste des étudiants."); return; }
    
    try {
      setPrinting(true);
      const bulls = await Promise.all(
        recapRows.map(row => {
          const id = row.etudiantId || row.id || row.matricule;
          if (bulletinType === 'semestre') {
            return bulletinService.getBulletinSemestre(id, selectedSemestreId).catch(() => null);
          } else {
            return bulletinService.getBulletinAnnuel(id).then(res => ({
              type: "annuel",
              etudiant: {
                nom: res.etudiant?.nom ?? "",
                prenom: res.etudiant?.prenom ?? "",
                matricule: res.etudiant?.matricule ?? "",
                dateNaissance: res.etudiant?.dateNaissance,
                lieuNaissance: res.etudiant?.lieuNaissance,
              },
              anneeUniversitaire: res.anneeUniversitaire ?? "",
              semestre5: res.semestre5,
              semestre6: res.semestre6,
              moyenneAnnuelle: res.moyenneAnnuelle,
              creditsTotal: res.creditsTotal ?? 60,
              creditsAcquis: res.creditsAcquis ?? 0,
              decisionJury: res.decisionJury,
              mention: res.mention,
              statistiques: res.statistiques
            })).catch(() => null);
          }
        })
      );
      const validBulls = bulls.filter(b => b !== null);
      if (validBulls.length === 0) throw new Error("Aucun bulletin valide");
      
      setBulletinsToPrint(validBulls);
      setTimeout(() => {
        window.print();
        setBulletinsToPrint([]);
        setPrinting(false);
      }, 1000); // laisser le temps au DOM de render toutes les images
    } catch (e) {
      setError("Erreur lors de la génération des bulletins de la classe.");
      setPrinting(false);
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImporting(true);
      setError("");
      setSuccess("");
      await importExportService.importerNotesExcel(file, classeId);
      setSuccess(`Importation réussie : ${file.name}. Les notes, matières et étudiants ont été mis à jour.`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'importation Excel");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleExportExcel = async () => {
    if (!selectedSemestreId) { setError("Sélectionnez un semestre"); return; }
    try {
      setError("");
      const blob = await importExportService.exporterNotesExcel(selectedSemestreId);
      importExportService.downloadFile(blob, `Notes_${semestres.find((s: any) => s.id === selectedSemestreId)?.code ?? 'export'}.xlsx`);
    } catch {
      setError("Erreur lors de l'export Excel");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions globales */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Résultats & Bulletins</h2>
          <p className="text-sm text-gray-500">Générez les bulletins et observez les résultats de la classe.</p>
        </div>

        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleImportExcel} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm font-medium bg-white"
          >
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Importer Excel
          </button>

          <button
            onClick={handleRecalculerPromotion}
            disabled={recalculating}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {recalculating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            Recalculer les moyennes
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Sélection du Semestre et Actions */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-auto">
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de Bulletin</label>
          <div className="flex gap-2">
            {(["semestre", "annuel"] as const).map(t => (
              <button
                key={t}
                onClick={() => {
                  setBulletinType(t);
                  setRecapRows([]);
                  setStatsData(null);
                }}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  bulletinType === t
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-gray-300 text-gray-700 hover:border-indigo-400 bg-white"
                }`}
              >
                {t === "semestre" ? "Semestriel" : "Annuel"}
              </button>
            ))}
          </div>
        </div>

        {bulletinType === "semestre" && (
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Semestre cible</label>
            <select
              value={selectedSemestreId}
              onChange={(e) => setSelectedSemestreId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Choisir un semestre</option>
              {semestres.map((s: any) => (
                <option key={s.id} value={s.id}>{s.libelle} ({s.anneeUniversitaire})</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-2 w-full md:w-auto">
          {bulletinType === "semestre" && (
            <button
              onClick={handleExportExcel}
              disabled={!selectedSemestreId}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 bg-white text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Exporter Excel
            </button>
          )}
          <button
            onClick={handleGenererRecap}
            disabled={(bulletinType === "semestre" && !selectedSemestreId) || loading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 disabled:opacity-50 text-sm font-medium"
          >
            <Users className="w-4 h-4" />
            Récapitulatif
          </button>
          {bulletinType === "semestre" && (
            <button
              onClick={handleGenererStats}
              disabled={!selectedSemestreId || loading}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 disabled:opacity-50 text-sm font-medium"
            >
              <BarChart3 className="w-4 h-4" />
              Statistiques
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}

      {/* Affichage des Statistiques */}
      {!loading && statsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
            <p className="text-sm font-medium text-gray-500 uppercase">Moyenne Générale</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{statsData.moyenneGenerale ? statsData.moyenneGenerale.toFixed(2) : '-'}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
            <p className="text-sm font-medium text-gray-500 uppercase">Note Max</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{statsData.max ? statsData.max.toFixed(2) : '-'}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
            <p className="text-sm font-medium text-gray-500 uppercase">Note Min</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{statsData.min ? statsData.min.toFixed(2) : '-'}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
            <p className="text-sm font-medium text-gray-500 uppercase">Taux réussite</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{statsData.tauxReussite ? `${statsData.tauxReussite.toFixed(1)}%` : '-'}</p>
          </div>
        </div>
      )}

      {/* Affichage du Récapitulatif avec Actions Bulletins */}
      {!loading && recapRows.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Récapitulatif de la classe</h3>
            <button
              onClick={printClasseBulletins}
              disabled={printing}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {printing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Imprimer la classe
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                {bulletinType === 'semestre' ? (
                  <tr>
                    <th className="px-4 py-3 font-semibold">Matricule</th>
                    <th className="px-4 py-3 font-semibold">Nom & Prénom</th>
                    <th className="px-4 py-3 font-semibold text-center">Moy. Semestre</th>
                    <th className="px-4 py-3 font-semibold text-center">Crédits Acquis</th>
                    <th className="px-4 py-3 font-semibold text-right">Bulletin</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-4 py-3 font-semibold">Matricule</th>
                    <th className="px-4 py-3 font-semibold">Nom & Prénom</th>
                    <th className="px-4 py-3 font-semibold text-center">Moy. S5</th>
                    <th className="px-4 py-3 font-semibold text-center">Moy. S6</th>
                    <th className="px-4 py-3 font-semibold text-center">Moy. Annuelle</th>
                    <th className="px-4 py-3 font-semibold text-center">Crédits</th>
                    <th className="px-4 py-3 font-semibold text-center">Décision</th>
                    <th className="px-4 py-3 font-semibold text-center">Mention</th>
                    <th className="px-4 py-3 font-semibold text-right">Bulletin</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recapRows.map((row: any) => (
                  <tr key={row.matricule} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-500">{row.matricule}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.nom} {row.prenom}</td>
                    {bulletinType === 'semestre' ? (
                      <>
                        <td className="px-4 py-3 text-center font-bold">
                          {row.moyenneSemestre || '-'}
                        </td>
                        <td className="px-4 py-3 text-center">{row.creditsAcquis ?? '-'}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-center">{row.moyenneS5 != null ? row.moyenneS5.toFixed(2) : '-'}</td>
                        <td className="px-4 py-3 text-center">{row.moyenneS6 != null ? row.moyenneS6.toFixed(2) : '-'}</td>
                        <td className="px-4 py-3 text-center font-bold">{row.moyenneAnnuelle != null ? row.moyenneAnnuelle.toFixed(2) : '-'}</td>
                        <td className="px-4 py-3 text-center">{row.creditsAcquis ?? '0'}/60</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100`}>
                            {row.decision === 'DIPLOME' ? 'Diplômé(e)' : row.decision === 'REPRISE_SOUTENANCE' ? 'Reprise Soutenance' : row.decision === 'REDOUBLE' ? 'Redouble' : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs font-medium">
                            {row.mention === 'TRES_BIEN' ? 'Très Bien' : row.mention === 'BIEN' ? 'Bien' : row.mention === 'ASSEZ_BIEN' ? 'Assez Bien' : row.mention === 'PASSABLE' ? 'Passable' : '—'}
                          </span>
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => printBulletinIndividuel(row.etudiantId || row.id)}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded"
                      >
                        <FileText className="w-4 h-4 inline mr-1" /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rendu pour impression (Portaled to document.body) */}
      {bulletinsToPrint.length > 0 && createPortal(
        <div id="print-root" className="bg-white">
          {bulletinsToPrint.map((data, index) => (
            <div key={index} className="print-page" style={{ pageBreakAfter: index < bulletinsToPrint.length - 1 ? 'always' : 'auto' }}>
              <BulletinDocument data={data} />
            </div>
          ))}
        </div>,
        document.body
      )}

    </div>
  );
};
