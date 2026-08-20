import React from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import { BulletinDocument } from '../../../components/BulletinDocument';
import {
  Printer, Download, FileText, AlertCircle, Loader2, ChevronRight,
  ArrowLeft, RefreshCw, CheckCircle, Award, BarChart3, Zap, Upload,
  TrendingUp, Users, Medal, X,
} from 'lucide-react';
import { useBulletins } from './useBulletins';
import { DECISIONS, MENTIONS, mentionColor, decisionColor } from './types';

export const GestionBulletins: React.FC = () => {
  const {
    etudiants, semestres, classes, filieres, mode, bulletinType,
    selectedSemestreId, selectedFiliereId, selectedClasseId,
    selectedEtudiant, bulletinData, promotionRows, recapRows, statsData,
    loading, loadingBulletin, generatingAll, loadingRecap, loadingStats,
    recalculating, importing, searchTerm,
    fileInputRef, filteredEtudiants, doneCount, errorCount,
    setMode, setBulletinType, setSelectedSemestreId, setSelectedFiliereId,
    setSelectedClasseId, setSelectedEtudiant, setBulletinData,
    setSearchTerm,
    handleRecalculerPromotion, handleGenererTous, handleStopGeneration,
    handleArchiver, handleGenererIndividuel, handleGenererRecap,
    handleGenererStats, handleImportExcel, handleExportExcel, resetToAccueil,
  } = useBulletins();

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <div className="flex items-center gap-3">
            {mode !== 'accueil' && (
              <button onClick={resetToAccueil} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bulletins de Notes</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {mode === 'accueil' && 'Choisissez une action'}
                {mode === 'individuel' && (selectedEtudiant ? `${selectedEtudiant.utilisateur?.nom} ${selectedEtudiant.prenom}` : "Sélectionnez un étudiant")}
                {mode === 'promotion' && `Génération en lot — ${doneCount}/${etudiants.length}`}
                {mode === 'recap' && `Récapitulatif — ${recapRows.length} étudiants`}
                {mode === 'stats' && 'Statistiques de Promotion'}
              </p>
            </div>
          </div>
          {(bulletinData || (mode === 'promotion' && doneCount > 0) || (mode === 'recap' && recapRows.length > 0)) && (
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                <Printer className="w-4 h-4" />Imprimer
              </button>
              {mode === 'promotion' && doneCount > 0 && (
                <button onClick={handleArchiver} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />Archiver
                </button>
              )}
              {mode === 'recap' && (
                <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                  <Download className="w-4 h-4" />Excel
                </button>
              )}
            </div>
          )}
        </div>

        {/* ══ ACCUEIL ══ */}
        {mode === 'accueil' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Configuration</h2>
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                  <div className="flex gap-2">
                    {(['semestre', 'annuel'] as const).map(t => (
                      <button key={t} onClick={() => setBulletinType(t)}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${bulletinType === t ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 text-gray-700 hover:border-indigo-400'}`}>
                        {t === 'semestre' ? 'Semestre' : 'Annuel'}
                      </button>
                    ))}
                  </div>
                </div>
                {bulletinType === 'semestre' && (
                  <div className="flex-1 min-w-48">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Semestre</label>
                    <select value={selectedSemestreId} onChange={e => setSelectedSemestreId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-sm">
                      <option value="">Choisir un semestre</option>
                      {semestres.map(s => <option key={s.id} value={s.id}>{s.libelle} — {s.anneeUniversitaire}</option>)}
                    </select>
                  </div>
                )}
                <div className="flex-1 min-w-48">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Filière (Génération en lot)</label>
                  <select value={selectedFiliereId} onChange={e => { setSelectedFiliereId(e.target.value); setSelectedClasseId(''); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-sm">
                    <option value="">Toutes les filières</option>
                    {filieres.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                  </select>
                </div>
                <div className="flex-1 min-w-48">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Classe (Génération en lot)</label>
                  <select value={selectedClasseId} onChange={e => setSelectedClasseId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-sm">
                    <option value="">Toutes les classes</option>
                    {(selectedFiliereId ? classes.filter(c => c.filiereId === selectedFiliereId) : classes).map(c => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 ml-auto w-full md:w-auto mt-4 md:mt-0">
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleImportExcel} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} disabled={importing}
                    className="flex items-center justify-center flex-1 md:flex-none gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm">
                    {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}Import Excel
                  </button>
                  <button onClick={handleExportExcel} disabled={!selectedSemestreId}
                    className="flex items-center justify-center flex-1 md:flex-none gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm">
                    <Download className="w-4 h-4" />Export Excel
                  </button>
                </div>
              </div>
            </div>

            {/* Action cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button onClick={() => setMode('individuel')} className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:shadow-md transition-all text-left group">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-indigo-200"><FileText className="w-6 h-6 text-indigo-600" /></div>
                <h3 className="font-bold text-gray-900">Bulletin Individuel</h3>
                <p className="text-sm text-gray-500 mt-1">Générer le bulletin d'un étudiant spécifique</p>
              </button>
              <button onClick={handleGenererTous} disabled={generatingAll || loading || (bulletinType === 'semestre' && !selectedSemestreId)}
                className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:shadow-md transition-all text-left group disabled:opacity-50">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-200">
                  {generatingAll ? <Loader2 className="w-6 h-6 text-green-600 animate-spin" /> : <Zap className="w-6 h-6 text-green-600" />}
                </div>
                <h3 className="font-bold text-gray-900">Génération en Lot</h3>
                <p className="text-sm text-gray-500 mt-1">Tous les {etudiants.length} étudiants en une fois</p>
              </button>
              <button onClick={handleGenererRecap} disabled={loadingRecap || !selectedSemestreId}
                className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-amber-400 hover:shadow-md transition-all text-left group disabled:opacity-50">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-amber-200">
                  {loadingRecap ? <Loader2 className="w-6 h-6 text-amber-600 animate-spin" /> : <BarChart3 className="w-6 h-6 text-amber-600" />}
                </div>
                <h3 className="font-bold text-gray-900">Récapitulatif Promotion</h3>
                <p className="text-sm text-gray-500 mt-1">Tableau synthétique avec toutes les décisions</p>
              </button>
              <button onClick={handleGenererStats} disabled={loadingStats || !selectedSemestreId}
                className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-md transition-all text-left group disabled:opacity-50">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-200">
                  {loadingStats ? <Loader2 className="w-6 h-6 text-purple-600 animate-spin" /> : <TrendingUp className="w-6 h-6 text-purple-600" />}
                </div>
                <h3 className="font-bold text-gray-900">Statistiques Promotion</h3>
                <p className="text-sm text-gray-500 mt-1">Moyennes, min, max, mentions, taux de réussite</p>
              </button>
              <button onClick={handleRecalculerPromotion} disabled={recalculating || loading}
                className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-red-400 hover:shadow-md transition-all text-left group disabled:opacity-50">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-red-200">
                  {recalculating ? <Loader2 className="w-6 h-6 text-red-600 animate-spin" /> : <RefreshCw className="w-6 h-6 text-red-600" />}
                </div>
                <h3 className="font-bold text-gray-900">Recalcul Global</h3>
                <p className="text-sm text-gray-500 mt-1">Recalculer toutes les moyennes avant génération</p>
              </button>
            </div>
          </div>
        )}

        {/* ══ INDIVIDUEL ══ */}
        {mode === 'individuel' && (
          <>
            {!selectedEtudiant ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden print:hidden">
                <div className="p-4 border-b border-gray-200">
                  <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                {loading ? (
                  <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredEtudiants.map(etudiant => (
                      <button key={etudiant.id} onClick={() => { setSelectedEtudiant(etudiant); setBulletinData(null); }}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-indigo-50 transition-colors text-left">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-indigo-700 font-bold text-xs">{(etudiant.utilisateur?.nom?.[0] ?? '') + (etudiant.prenom?.[0] ?? '')}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{etudiant.utilisateur?.nom} {etudiant.prenom}</p>
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
              <>
                <div className="bg-white rounded-xl shadow-md p-4 mb-5 print:hidden flex flex-wrap items-end gap-4">
                  <button onClick={() => { setSelectedEtudiant(null); setBulletinData(null); }}
                    className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" />Changer d'étudiant
                  </button>
                  <div className="flex-1" />
                  <button onClick={handleGenererIndividuel} disabled={loadingBulletin || (bulletinType === 'semestre' && !selectedSemestreId)}
                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium">
                    {loadingBulletin ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}Générer
                  </button>
                </div>
                {loadingBulletin && <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>}
                {!loadingBulletin && bulletinData && <BulletinDocument data={bulletinData} />}
                {!loadingBulletin && !bulletinData && (
                  <div className="bg-white rounded-xl shadow-md p-12 text-center print:hidden">
                    <FileText className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
                    <p className="text-gray-500">Cliquez sur "Générer"</p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ══ PROMOTION (lot) ══ */}
        {mode === 'promotion' && (
          <>
            <div className="bg-white rounded-xl shadow-md p-5 mb-6 print:hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-900 text-sm">Progression : {doneCount + errorCount}/{promotionRows.length}</span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-3 h-3" />{doneCount} générés</span>
                  {errorCount > 0 && <span className="flex items-center gap-1 text-red-600"><AlertCircle className="w-3 h-3" />{errorCount} erreurs</span>}
                  {generatingAll && (
                    <button onClick={handleStopGeneration}
                      className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors flex items-center gap-1">
                      <X className="w-3 h-3" /> Stopper
                    </button>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${((doneCount + errorCount) / Math.max(promotionRows.length, 1)) * 100}%` }} />
              </div>
              <div className="mt-4 max-h-40 overflow-y-auto space-y-1">
                {promotionRows.map((row, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-gray-100">
                    <span className="text-gray-700">{row.etudiant.utilisateur?.nom} {row.etudiant.prenom}</span>
                    <span className={row.status === 'done' ? 'text-green-600' : row.status === 'error' ? 'text-red-600' : row.status === 'loading' ? 'text-blue-600' : 'text-gray-400'}>
                      {row.status === 'done' && '✓ Généré'}
                      {row.status === 'error' && `✗ ${row.error}`}
                      {row.status === 'loading' && '⟳ En cours...'}
                      {row.status === 'idle' && '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-8">
              {promotionRows.filter(r => r.status === 'done' && r.data).map((row, i) => (
                <div key={i} className="print:break-after-page">
                  <div className="flex items-center justify-between mb-2 print:hidden">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-500" />{row.etudiant.utilisateur?.nom} {row.etudiant.prenom}
                    </span>
                    <button onClick={() => window.print()} className="flex items-center gap-1 px-3 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100">
                      <Printer className="w-3 h-3" />Imprimer
                    </button>
                  </div>
                  <BulletinDocument data={row.data!} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══ RÉCAPITULATIF ══ */}
        {mode === 'recap' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><Users className="w-5 h-5 text-amber-600" />Récapitulatif de Promotion — {recapRows.length} étudiants</h2>
              <span className="text-sm text-gray-500">{semestres.find(s => s.id === selectedSemestreId)?.anneeUniversitaire}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-amber-50 border-b">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Matricule</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nom & Prénom</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Moy. S5</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Moy. S6</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Moy. Annuelle</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Crédits</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Décision</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Mention</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recapRows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs text-gray-600">{row.matricule}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.nom} {row.prenom}</td>
                      <td className={`px-4 py-3 text-center text-sm font-semibold ${row.moyenneS5 !== undefined ? (row.moyenneS5 >= 10 ? 'text-green-700' : 'text-red-600') : 'text-gray-400'}`}>
                        {row.moyenneS5 !== undefined ? row.moyenneS5.toFixed(2) : '—'}
                      </td>
                      <td className={`px-4 py-3 text-center text-sm font-semibold ${row.moyenneS6 !== undefined ? (row.moyenneS6 >= 10 ? 'text-green-700' : 'text-red-600') : 'text-gray-400'}`}>
                        {row.moyenneS6 !== undefined ? row.moyenneS6.toFixed(2) : '—'}
                      </td>
                      <td className={`px-4 py-3 text-center text-sm font-bold ${row.moyenneAnnuelle !== undefined ? (row.moyenneAnnuelle >= 10 ? 'text-green-700' : 'text-red-600') : 'text-gray-400'}`}>
                        {row.moyenneAnnuelle !== undefined ? row.moyenneAnnuelle.toFixed(2) : '—'}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">{row.creditsAcquis}/60</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${decisionColor(row.decision)}`}>
                          {row.decision ? (DECISIONS[row.decision] ?? row.decision) : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${mentionColor(row.mention)}`}>
                          {row.mention ? (MENTIONS[row.mention] ?? row.mention) : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ STATISTIQUES ══ */}
        {mode === 'stats' && statsData && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Étudiants', value: statsData.nombreEtudiants, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Moy. Générale', value: statsData.moyenneGenerale?.toFixed(2) ?? '—', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Note Min', value: statsData.min?.toFixed(2) ?? '—', color: 'text-red-600', bg: 'bg-red-50' },
                { label: 'Note Max', value: statsData.max?.toFixed(2) ?? '—', color: 'text-green-600', bg: 'bg-green-50' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl p-5 text-center`}>
                  <div className={`text-3xl font-bold ${color}`}>{value}</div>
                  <div className="text-sm text-gray-600 mt-1">{label}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-purple-600" />Indicateurs</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Écart-type</span>
                    <span className="font-semibold text-gray-900">{statsData.ecartType?.toFixed(2) ?? '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Taux de réussite</span>
                    <span className={`font-bold ${(statsData.tauxReussite ?? 0) >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                      {statsData.tauxReussite?.toFixed(1) ?? '—'}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Taux d'échec</span>
                    <span className="font-semibold text-gray-900">
                      {statsData.tauxReussite !== undefined ? (100 - statsData.tauxReussite).toFixed(1) : '—'}%
                    </span>
                  </div>
                </div>
              </div>
              {statsData.repartitionMentions && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Medal className="w-5 h-5 text-amber-600" />Répartition des Mentions</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Très Bien (≥16)', value: statsData.repartitionMentions.tresBien, color: 'bg-green-500' },
                      { label: 'Bien (14-16)', value: statsData.repartitionMentions.bien, color: 'bg-blue-500' },
                      { label: 'Assez Bien (12-14)', value: statsData.repartitionMentions.assezBien, color: 'bg-amber-500' },
                      { label: 'Passable (10-12)', value: statsData.repartitionMentions.passable, color: 'bg-orange-500' },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{label}</span><span className="font-semibold">{value} étudiant(s)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full ${color}`} style={{ width: `${statsData.nombreEtudiants > 0 ? (value / statsData.nombreEtudiants) * 100 : 0}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
