import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { etudiantService, semestreService, calculService } from '../../services';
import { bulletinService } from '../../services/bulletin.service';
import {
  BulletinDocument,
  BulletinData,
  BulletinSemestreData,
  BulletinAnnuelData,
  UEData,
} from '../../components/BulletinDocument';
import {
  Printer, Download, FileText, AlertCircle, Loader2,
  ChevronRight, ArrowLeft, RefreshCw, CheckCircle, Award,
  BarChart3, Zap,
} from 'lucide-react';
import { Etudiant, Semestre } from '../../types';

type Mode = 'accueil' | 'individuel' | 'promotion';
type BulletinType = 'semestre' | 'annuel';

interface PromotionRow {
  etudiant: Etudiant;
  status: 'idle' | 'loading' | 'done' | 'error';
  data?: BulletinData;
  error?: string;
}

export const GestionBulletins: React.FC = () => {
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [mode, setMode] = useState<Mode>('accueil');
  const [bulletinType, setBulletinType] = useState<BulletinType>('semestre');
  const [selectedSemestreId, setSelectedSemestreId] = useState('');
  const [selectedEtudiant, setSelectedEtudiant] = useState<Etudiant | null>(null);
  const [bulletinData, setBulletinData] = useState<BulletinData | null>(null);
  const [promotionRows, setPromotionRows] = useState<PromotionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBulletin, setLoadingBulletin] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [etudiantsData, semestresData] = await Promise.all([
        etudiantService.getAll(),
        semestreService.getAll(),
      ]);
      setEtudiants(etudiantsData);
      setSemestres(semestresData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // ── Recalcul global de toute la promotion ─────────────────────────────────
  const handleRecalculerPromotion = async () => {
    if (!window.confirm(`Recalculer les moyennes pour les ${etudiants.length} étudiants ? Cette opération peut prendre quelques secondes.`)) return;
    try {
      setRecalculating(true);
      setError('');
      await Promise.allSettled(
        etudiants.map(e => calculService.recalculerTout(e.id))
      );
      setError('');
      alert('Recalcul terminé pour toute la promotion.');
    } catch (err: any) {
      setError('Erreur lors du recalcul global');
    } finally {
      setRecalculating(false);
    }
  };

  // ── Générer tous les bulletins d'un semestre ──────────────────────────────
  const handleGenererTous = async () => {
    if (!selectedSemestreId && bulletinType === 'semestre') {
      setError('Sélectionnez un semestre');
      return;
    }
    setGeneratingAll(true);
    setError('');
    const rows: PromotionRow[] = etudiants.map(e => ({ etudiant: e, status: 'loading' }));
    setPromotionRows(rows);
    setMode('promotion');

    for (let i = 0; i < etudiants.length; i++) {
      const etudiant = etudiants[i];
      try {
        let data: BulletinData;
        if (bulletinType === 'semestre') {
          data = await buildSemestreData(etudiant, selectedSemestreId);
        } else {
          data = await buildAnnuelData(etudiant);
        }
        setPromotionRows(prev => prev.map((r, idx) =>
          idx === i ? { ...r, status: 'done', data } : r
        ));
      } catch (err: any) {
        setPromotionRows(prev => prev.map((r, idx) =>
          idx === i ? { ...r, status: 'error', error: 'Données manquantes' } : r
        ));
      }
    }
    setGeneratingAll(false);
  };

  // ── Générer bulletin individuel ───────────────────────────────────────────
  const handleGenererIndividuel = async () => {
    if (!selectedEtudiant) return;
    if (bulletinType === 'semestre' && !selectedSemestreId) {
      setError('Sélectionnez un semestre');
      return;
    }
    try {
      setLoadingBulletin(true);
      setError('');
      setBulletinData(null);
      const data = bulletinType === 'semestre'
        ? await buildSemestreData(selectedEtudiant, selectedSemestreId)
        : await buildAnnuelData(selectedEtudiant);
      setBulletinData(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la génération');
    } finally {
      setLoadingBulletin(false);
    }
  };

  // ── Builders ──────────────────────────────────────────────────────────────
  const buildSemestreData = async (etudiant: Etudiant, semestreId: string): Promise<BulletinSemestreData> => {
    const semestre = semestres.find(s => s.id === semestreId);
    try {
      const raw = await bulletinService.getBulletinSemestre(etudiant.id, semestreId);
      if (raw?.ues) {
        return {
          type: 'semestre',
          etudiant: {
            nom: raw.etudiant?.nom ?? etudiant.utilisateur?.nom ?? '',
            prenom: raw.etudiant?.prenom ?? etudiant.prenom,
            matricule: raw.etudiant?.matricule ?? etudiant.matricule,
            dateNaissance: raw.etudiant?.dateNaissance ?? etudiant.date_naissance,
            lieuNaissance: raw.etudiant?.lieuNaissance ?? etudiant.lieu_naissance,
          },
          semestre: {
            code: raw.semestre?.code ?? semestre?.code ?? '',
            libelle: raw.semestre?.libelle ?? semestre?.libelle ?? '',
            anneeUniversitaire: raw.semestre?.anneeUniversitaire ?? semestre?.anneeUniversitaire ?? '',
          },
          ues: raw.ues.map((ue: any): UEData => ({
            code: ue.code, libelle: ue.libelle,
            matieres: (ue.matieres || []).map((m: any) => ({
              libelle: m.libelle, coefficient: m.coefficient, credits: m.credits,
              cc: m.noteCC, examen: m.noteExamen, rattrapage: m.noteRattrapage,
              moyenne: m.moyenne, absences: m.absences,
            })),
            moyenne: ue.moyenne, creditsTotal: ue.creditsTotal,
            creditsAcquis: ue.creditsAcquis ?? 0, acquise: ue.acquise ?? false,
            compense: ue.compensee ?? false,
          })),
          moyenneSemestre: raw.resultat?.moyenneSemestre,
          creditsTotal: raw.resultat?.creditsTotal ?? 30,
          creditsAcquis: raw.resultat?.creditsAcquis ?? 0,
          valide: raw.resultat?.valide,
          statistiques: raw.statistiques ? {
            moyenneClasse: raw.statistiques.moyenneClasse,
            min: raw.statistiques.noteMin, max: raw.statistiques.noteMax,
            ecartType: raw.statistiques.ecartType, nbEtudiants: raw.statistiques.nbEtudiants,
          } : undefined,
        };
      }
    } catch { /* fallback */ }
    return {
      type: 'semestre',
      etudiant: { nom: etudiant.utilisateur?.nom ?? '', prenom: etudiant.prenom, matricule: etudiant.matricule },
      semestre: { code: semestre?.code ?? '', libelle: semestre?.libelle ?? '', anneeUniversitaire: semestre?.anneeUniversitaire ?? '' },
      ues: [], creditsTotal: 30, creditsAcquis: 0,
    };
  };

  const buildAnnuelData = async (etudiant: Etudiant): Promise<BulletinAnnuelData> => {
    try {
      const raw = await bulletinService.getBulletinAnnuel(etudiant.id);
      if (raw) {
        return {
          type: 'annuel',
          etudiant: {
            nom: raw.etudiant?.nom ?? etudiant.utilisateur?.nom ?? '',
            prenom: raw.etudiant?.prenom ?? etudiant.prenom,
            matricule: raw.etudiant?.matricule ?? etudiant.matricule,
            dateNaissance: raw.etudiant?.dateNaissance ?? etudiant.date_naissance,
            lieuNaissance: raw.etudiant?.lieuNaissance ?? etudiant.lieu_naissance,
            bacType: etudiant.bac_type, anneeBac: etudiant.annee_bac, provenance: etudiant.provenance,
          },
          anneeUniversitaire: raw.anneeUniversitaire ?? '',
          semestre5: raw.semestre5, semestre6: raw.semestre6,
          moyenneAnnuelle: raw.moyenneAnnuelle,
          creditsTotal: raw.creditsTotal ?? 60, creditsAcquis: raw.creditsAcquis ?? 0,
          decisionJury: raw.decisionJury, mention: raw.mention,
          statistiques: raw.statistiques,
        };
      }
    } catch { /* pas de données */ }
    throw new Error('Bulletin annuel non disponible');
  };

  const filteredEtudiants = etudiants.filter(e =>
    `${e.utilisateur?.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const doneCount = promotionRows.filter(r => r.status === 'done').length;
  const errorCount = promotionRows.filter(r => r.status === 'error').length;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <div className="flex items-center gap-3">
            {mode !== 'accueil' && (
              <button
                onClick={() => { setMode('accueil'); setBulletinData(null); setSelectedEtudiant(null); setPromotionRows([]); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bulletins de Notes</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {mode === 'accueil' && 'Choisissez une action'}
                {mode === 'individuel' && (selectedEtudiant
                  ? `${selectedEtudiant.utilisateur?.nom} ${selectedEtudiant.prenom} — ${selectedEtudiant.matricule}`
                  : 'Sélectionnez un étudiant')}
                {mode === 'promotion' && `Génération en lot — ${doneCount}/${etudiants.length} bulletins`}
              </p>
            </div>
          </div>

          {/* Boutons impression */}
          {(bulletinData || (mode === 'promotion' && doneCount > 0)) && (
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                <Printer className="w-4 h-4" />
                Imprimer
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg print:hidden">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* ══ MODE ACCUEIL ══════════════════════════════════════════════════ */}
        {mode === 'accueil' && (
          <div className="space-y-6">
            {/* Options semestre/type */}
            <div className="bg-white rounded-xl shadow-md p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Configuration</h2>
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                  <div className="flex gap-2">
                    {(['semestre', 'annuel'] as const).map(t => (
                      <button key={t}
                        onClick={() => setBulletinType(t)}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          bulletinType === t
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-gray-300 text-gray-700 hover:border-indigo-400'
                        }`}
                      >
                        {t === 'semestre' ? 'Semestre' : 'Annuel'}
                      </button>
                    ))}
                  </div>
                </div>
                {bulletinType === 'semestre' && (
                  <div className="flex-1 min-w-48">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Semestre</label>
                    <select
                      value={selectedSemestreId}
                      onChange={e => setSelectedSemestreId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                    >
                      <option value="">Choisir un semestre</option>
                      {semestres.map(s => (
                        <option key={s.id} value={s.id}>{s.libelle} — {s.anneeUniversitaire}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* 4 actions principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Bulletin individuel */}
              <button
                onClick={() => setMode('individuel')}
                className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:shadow-md transition-all text-left group"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition-colors">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-bold text-gray-900">Bulletin Individuel</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Générer et imprimer le bulletin d'un étudiant spécifique
                </p>
              </button>

              {/* Génération en lot */}
              <button
                onClick={handleGenererTous}
                disabled={generatingAll || loading || (bulletinType === 'semestre' && !selectedSemestreId)}
                className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:shadow-md transition-all text-left group disabled:opacity-50"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                  {generatingAll
                    ? <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                    : <Zap className="w-6 h-6 text-green-600" />
                  }
                </div>
                <h3 className="font-bold text-gray-900">Génération en Lot</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Générer les bulletins de tous les {etudiants.length} étudiants en une fois
                </p>
              </button>

              {/* Récapitulatif promotion */}
              <button
                onClick={() => {
                  if (!selectedSemestreId && bulletinType === 'semestre') {
                    setError('Sélectionnez un semestre pour le récapitulatif');
                    return;
                  }
                  handleGenererTous();
                }}
                disabled={loading}
                className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-amber-400 hover:shadow-md transition-all text-left group disabled:opacity-50"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-colors">
                  <BarChart3 className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-bold text-gray-900">Récapitulatif Promotion</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Tableau synthétique avec toutes les décisions de jury
                </p>
              </button>

              {/* Recalcul global */}
              <button
                onClick={handleRecalculerPromotion}
                disabled={recalculating || loading}
                className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-red-400 hover:shadow-md transition-all text-left group disabled:opacity-50"
              >
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-red-200 transition-colors">
                  {recalculating
                    ? <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
                    : <RefreshCw className="w-6 h-6 text-red-600" />
                  }
                </div>
                <h3 className="font-bold text-gray-900">Recalcul Global</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Recalculer toutes les moyennes avant génération des bulletins
                </p>
              </button>
            </div>
          </div>
        )}

        {/* ══ MODE INDIVIDUEL ═══════════════════════════════════════════════ */}
        {mode === 'individuel' && (
          <>
            {!selectedEtudiant ? (
              /* Liste de sélection */
              <div className="bg-white rounded-xl shadow-md overflow-hidden print:hidden">
                <div className="p-4 border-b border-gray-200">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Rechercher par nom, prénom ou matricule..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                {loading ? (
                  <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredEtudiants.map(etudiant => (
                      <button
                        key={etudiant.id}
                        onClick={() => { setSelectedEtudiant(etudiant); setBulletinData(null); }}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-indigo-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-indigo-700 font-bold text-xs">
                              {(etudiant.utilisateur?.nom?.[0] ?? '') + (etudiant.prenom?.[0] ?? '')}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {etudiant.utilisateur?.nom} {etudiant.prenom}
                            </p>
                            <p className="text-gray-500 text-xs">{etudiant.matricule}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Bulletin individuel */
              <>
                <div className="bg-white rounded-xl shadow-md p-4 mb-5 print:hidden flex flex-wrap items-end gap-4">
                  <button
                    onClick={() => { setSelectedEtudiant(null); setBulletinData(null); }}
                    className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" /> Changer d'étudiant
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={handleGenererIndividuel}
                    disabled={loadingBulletin || (bulletinType === 'semestre' && !selectedSemestreId)}
                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
                  >
                    {loadingBulletin ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    Générer
                  </button>
                </div>

                {loadingBulletin && (
                  <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                )}
                {!loadingBulletin && bulletinData && <BulletinDocument data={bulletinData} />}
                {!loadingBulletin && !bulletinData && (
                  <div className="bg-white rounded-xl shadow-md p-12 text-center print:hidden">
                    <FileText className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
                    <p className="text-gray-500">Cliquez sur "Générer" pour afficher le bulletin</p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ══ MODE PROMOTION ════════════════════════════════════════════════ */}
        {mode === 'promotion' && (
          <>
            {/* Barre de progression */}
            <div className="bg-white rounded-xl shadow-md p-5 mb-6 print:hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-900 text-sm">
                  Progression : {doneCount + errorCount}/{promotionRows.length}
                </span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-3 h-3" /> {doneCount} générés
                  </span>
                  {errorCount > 0 && (
                    <span className="flex items-center gap-1 text-red-600">
                      <AlertCircle className="w-3 h-3" /> {errorCount} erreurs
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${((doneCount + errorCount) / Math.max(promotionRows.length, 1)) * 100}%` }}
                />
              </div>

              {/* Liste statuts */}
              <div className="mt-4 max-h-40 overflow-y-auto space-y-1">
                {promotionRows.map((row, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-gray-100">
                    <span className="text-gray-700">
                      {row.etudiant.utilisateur?.nom} {row.etudiant.prenom}
                    </span>
                    <span className={
                      row.status === 'done' ? 'text-green-600' :
                      row.status === 'error' ? 'text-red-600' :
                      row.status === 'loading' ? 'text-blue-600' : 'text-gray-400'
                    }>
                      {row.status === 'done' && '✓ Généré'}
                      {row.status === 'error' && `✗ ${row.error}`}
                      {row.status === 'loading' && '⟳ En cours...'}
                      {row.status === 'idle' && '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bulletins générés — affichés à l'impression */}
            <div className="space-y-8">
              {promotionRows
                .filter(r => r.status === 'done' && r.data)
                .map((row, i) => (
                  <div key={i} className="print:break-after-page">
                    {/* Bouton individuel (masqué à l'impression) */}
                    <div className="flex items-center justify-between mb-2 print:hidden">
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Award className="w-4 h-4 text-indigo-500" />
                        {row.etudiant.utilisateur?.nom} {row.etudiant.prenom}
                      </span>
                      <button
                        onClick={() => window.print()}
                        className="flex items-center gap-1 px-3 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        <Printer className="w-3 h-3" /> Imprimer ce bulletin
                      </button>
                    </div>
                    <BulletinDocument data={row.data!} />
                  </div>
                ))
              }
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};