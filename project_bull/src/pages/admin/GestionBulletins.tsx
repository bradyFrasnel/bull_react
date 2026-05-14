import React, { useEffect, useState, useRef } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { etudiantService, semestreService, calculService } from "../../services";
import { bulletinService } from "../../services/bulletin.service";
import { statistiquesService } from "../../services/results.service";
import { importExportService } from "../../services/bulletin.service";
import { BulletinDocument, BulletinData, BulletinSemestreData, BulletinAnnuelData, UEData } from "../../components/BulletinDocument";
import { Printer, Download, FileText, AlertCircle, Loader2, ChevronRight, ArrowLeft, RefreshCw, CheckCircle, Award, BarChart3, Zap, Upload, TrendingUp, Users, Medal } from "lucide-react";
import { Etudiant, Semestre } from "../../types";

type Mode = "accueil" | "individuel" | "promotion" | "recap" | "stats";
type BulletinType = "semestre" | "annuel";

interface PromotionRow { etudiant: Etudiant; status: "idle"|"loading"|"done"|"error"; data?: BulletinData; error?: string; }
interface RecapRow { matricule: string; nom: string; prenom: string; moyenneS5?: number; moyenneS6?: number; moyenneAnnuelle?: number; creditsAcquis: number; decision?: string; mention?: string; }
interface StatsData { nombreEtudiants: number; moyenneGenerale?: number; min?: number; max?: number; ecartType?: number; tauxReussite?: number; repartitionMentions?: { passable:number; assezBien:number; bien:number; tresBien:number; }; }

const DECISIONS: Record<string,string> = { DIPLOME:"Diplômé(e)", REPRISE_SOUTENANCE:"Reprise Soutenance", REDOUBLE:"Redouble" };
const MENTIONS: Record<string,string> = { TRES_BIEN:"Très Bien", BIEN:"Bien", ASSEZ_BIEN:"Assez Bien", PASSABLE:"Passable" };
const mentionColor = (m?: string) => { switch(m) { case "TRES_BIEN": return "text-green-700 bg-green-100"; case "BIEN": return "text-blue-700 bg-blue-100"; case "ASSEZ_BIEN": return "text-amber-700 bg-amber-100"; case "PASSABLE": return "text-orange-700 bg-orange-100"; default: return "text-gray-600 bg-gray-100"; } };
const decisionColor = (d?: string) => { switch(d) { case "DIPLOME": return "text-green-700 bg-green-100"; case "REPRISE_SOUTENANCE": return "text-amber-700 bg-amber-100"; case "REDOUBLE": return "text-red-700 bg-red-100"; default: return "text-gray-600 bg-gray-100"; } };

export const GestionBulletins: React.FC = () => {
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [mode, setMode] = useState<Mode>("accueil");
  const [bulletinType, setBulletinType] = useState<BulletinType>("semestre");
  const [selectedSemestreId, setSelectedSemestreId] = useState("");
  const [selectedEtudiant, setSelectedEtudiant] = useState<Etudiant | null>(null);
  const [bulletinData, setBulletinData] = useState<BulletinData | null>(null);
  const [promotionRows, setPromotionRows] = useState<PromotionRow[]>([]);
  const [recapRows, setRecapRows] = useState<RecapRow[]>([]);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingBulletin, setLoadingBulletin] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [loadingRecap, setLoadingRecap] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    try { setLoading(true); const [e,s] = await Promise.all([etudiantService.getAll(), semestreService.getAll()]); setEtudiants(e); setSemestres(s); }
    catch (err: any) { setError(err.response?.data?.message || "Erreur lors du chargement"); }
    finally { setLoading(false); }
  };

  const handleRecalculerPromotion = async () => {
    if (!window.confirm(`Recalculer les moyennes pour ${etudiants.length} étudiants ?`)) return;
    try { setRecalculating(true); setError(""); await Promise.allSettled(etudiants.map(e => calculService.recalculerTout(e.id))); setSuccess("Recalcul terminé pour toute la promotion."); }
    catch { setError("Erreur lors du recalcul global"); } finally { setRecalculating(false); }
  };

  const handleGenererTous = async () => {
    if (!selectedSemestreId && bulletinType === "semestre") { setError("Sélectionnez un semestre"); return; }
    setGeneratingAll(true); setError("");
    const rows: PromotionRow[] = etudiants.map(e => ({ etudiant: e, status: "loading" }));
    setPromotionRows(rows); setMode("promotion");
    for (let i = 0; i < etudiants.length; i++) {
      try { const data = bulletinType === "semestre" ? await buildSemestreData(etudiants[i], selectedSemestreId) : await buildAnnuelData(etudiants[i]); setPromotionRows(prev => prev.map((r,idx) => idx===i ? {...r,status:"done",data} : r)); }
      catch { setPromotionRows(prev => prev.map((r,idx) => idx===i ? {...r,status:"error",error:"Données manquantes"} : r)); }
    }
    setGeneratingAll(false);
  };

  const handleGenererIndividuel = async () => {
    if (!selectedEtudiant) return;
    if (bulletinType === "semestre" && !selectedSemestreId) { setError("Sélectionnez un semestre"); return; }
    try { setLoadingBulletin(true); setError(""); setBulletinData(null);
      const data = bulletinType === "semestre" ? await buildSemestreData(selectedEtudiant, selectedSemestreId) : await buildAnnuelData(selectedEtudiant);
      setBulletinData(data);
    } catch (err: any) { setError(err.message || "Erreur"); } finally { setLoadingBulletin(false); }
  };

  const handleGenererRecap = async () => {
    if (!selectedSemestreId) { setError("Sélectionnez un semestre"); return; }
    try {
      setLoadingRecap(true); setError(""); setRecapRows([]);
      try {
        const raw = await bulletinService.getRecapPromotion(selectedSemestreId);
        if (raw?.etudiants) { setRecapRows(raw.etudiants); setMode("recap"); return; }
      } catch { /* fallback */ }
      const rows: RecapRow[] = [];
      for (const etudiant of etudiants) {
        try {
          const raw = await bulletinService.getBulletinAnnuel(etudiant.id);
          rows.push({ matricule: etudiant.matricule, nom: etudiant.utilisateur?.nom??'', prenom: etudiant.prenom, moyenneS5: raw?.semestre5?.moyenne, moyenneS6: raw?.semestre6?.moyenne, moyenneAnnuelle: raw?.moyenneAnnuelle, creditsAcquis: raw?.creditsAcquis??0, decision: raw?.decisionJury, mention: raw?.mention });
        } catch { rows.push({ matricule: etudiant.matricule, nom: etudiant.utilisateur?.nom??'', prenom: etudiant.prenom, creditsAcquis: 0 }); }
      }
      setRecapRows(rows); setMode("recap");
    } catch { setError("Erreur lors du chargement du récapitulatif"); } finally { setLoadingRecap(false); }
  };

  const handleGenererStats = async () => {
    if (!selectedSemestreId) { setError("Sélectionnez un semestre"); return; }
    try {
      setLoadingStats(true); setError(""); setStatsData(null);
      try {
        const raw = await statistiquesService.getStatistiquesSemestre(selectedSemestreId);
        if (raw) { setStatsData({ nombreEtudiants: raw.nombreEtudiants??etudiants.length, moyenneGenerale: raw.moyenne, min: raw.min, max: raw.max, ecartType: raw.ecartType, tauxReussite: raw.tauxReussite }); setMode("stats"); return; }
      } catch { /* fallback calcul local */ }
      const moyennes: number[] = [];
      let diplomes = 0;
      for (const etudiant of etudiants) {
        try { const raw = await bulletinService.getBulletinAnnuel(etudiant.id); if (raw?.moyenneAnnuelle) { moyennes.push(raw.moyenneAnnuelle); if (raw.decisionJury === "DIPLOME") diplomes++; } } catch { /* skip */ }
      }
      if (moyennes.length > 0) {
        const moy = moyennes.reduce((a,b)=>a+b,0)/moyennes.length;
        const variance = moyennes.reduce((acc,n)=>acc+Math.pow(n-moy,2),0)/moyennes.length;
        const passable = moyennes.filter(m=>m>=10&&m<12).length;
        const assezBien = moyennes.filter(m=>m>=12&&m<14).length;
        const bien = moyennes.filter(m=>m>=14&&m<16).length;
        const tresBien = moyennes.filter(m=>m>=16).length;
        setStatsData({ nombreEtudiants: etudiants.length, moyenneGenerale: moy, min: Math.min(...moyennes), max: Math.max(...moyennes), ecartType: Math.sqrt(variance), tauxReussite: (moyennes.filter(m=>m>=10).length/moyennes.length)*100, repartitionMentions: { passable, assezBien, bien, tresBien } });
      } else { setStatsData({ nombreEtudiants: etudiants.length }); }
      setMode("stats");
    } catch { setError("Erreur lors du calcul des statistiques"); } finally { setLoadingStats(false); }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !selectedSemestreId) return;
    try { setImporting(true); setError(""); await importExportService.importerNotesExcel(file, selectedSemestreId); setSuccess(`Import réussi : ${file.name}`); }
    catch (err: any) { setError(err.response?.data?.message || "Erreur lors de l'import Excel"); }
    finally { setImporting(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const handleExportExcel = async () => {
    if (!selectedSemestreId) { setError("Sélectionnez un semestre"); return; }
    try { const blob = await importExportService.exporterNotesExcel(selectedSemestreId); importExportService.downloadFile(blob, `Notes_${semestres.find(s=>s.id===selectedSemestreId)?.code??'export'}.xlsx`); }
    catch { setError("Erreur lors de l'export Excel"); }
  };

  const buildSemestreData = async (etudiant: Etudiant, semestreId: string): Promise<BulletinSemestreData> => {
    const semestre = semestres.find(s => s.id === semestreId);
    try {
      const raw = await bulletinService.getBulletinSemestre(etudiant.id, semestreId);
      if (raw?.ues) return { type:"semestre", etudiant:{nom:raw.etudiant?.nom??etudiant.utilisateur?.nom??"",prenom:raw.etudiant?.prenom??etudiant.prenom,matricule:raw.etudiant?.matricule??etudiant.matricule,dateNaissance:raw.etudiant?.dateNaissance??etudiant.date_naissance,lieuNaissance:raw.etudiant?.lieuNaissance??etudiant.lieu_naissance}, semestre:{code:raw.semestre?.code??semestre?.code??"",libelle:raw.semestre?.libelle??semestre?.libelle??"",anneeUniversitaire:raw.semestre?.anneeUniversitaire??semestre?.anneeUniversitaire??""}, ues:raw.ues.map((ue:any):UEData=>({code:ue.code,libelle:ue.libelle,matieres:(ue.matieres||[]).map((m:any)=>({libelle:m.libelle,coefficient:m.coefficient,credits:m.credits,cc:m.noteCC,examen:m.noteExamen,rattrapage:m.noteRattrapage,moyenne:m.moyenne,absences:m.absences})),moyenne:ue.moyenne,creditsTotal:ue.creditsTotal,creditsAcquis:ue.creditsAcquis??0,acquise:ue.acquise??false,compense:ue.compensee??false})), moyenneSemestre:raw.resultat?.moyenneSemestre,creditsTotal:raw.resultat?.creditsTotal??30,creditsAcquis:raw.resultat?.creditsAcquis??0,valide:raw.resultat?.valide,statistiques:raw.statistiques?{moyenneClasse:raw.statistiques.moyenneClasse,min:raw.statistiques.noteMin,max:raw.statistiques.noteMax,ecartType:raw.statistiques.ecartType,nbEtudiants:raw.statistiques.nbEtudiants}:undefined };
    } catch { /* fallback */ }
    return { type:"semestre", etudiant:{nom:etudiant.utilisateur?.nom??"",prenom:etudiant.prenom,matricule:etudiant.matricule}, semestre:{code:semestre?.code??"",libelle:semestre?.libelle??"",anneeUniversitaire:semestre?.anneeUniversitaire??""}, ues:[],creditsTotal:30,creditsAcquis:0 };
  };

  const buildAnnuelData = async (etudiant: Etudiant): Promise<BulletinAnnuelData> => {
    try {
      const raw = await bulletinService.getBulletinAnnuel(etudiant.id);
      if (raw) return { type:"annuel", etudiant:{nom:raw.etudiant?.nom??etudiant.utilisateur?.nom??"",prenom:raw.etudiant?.prenom??etudiant.prenom,matricule:raw.etudiant?.matricule??etudiant.matricule,dateNaissance:raw.etudiant?.dateNaissance??etudiant.date_naissance,lieuNaissance:raw.etudiant?.lieuNaissance??etudiant.lieu_naissance,bacType:etudiant.bac_type,anneeBac:etudiant.annee_bac,provenance:etudiant.provenance}, anneeUniversitaire:raw.anneeUniversitaire??"",semestre5:raw.semestre5,semestre6:raw.semestre6,moyenneAnnuelle:raw.moyenneAnnuelle,creditsTotal:raw.creditsTotal??60,creditsAcquis:raw.creditsAcquis??0,decisionJury:raw.decisionJury,mention:raw.mention,statistiques:raw.statistiques };
    } catch { /* pas de données */ }
    throw new Error("Bulletin annuel non disponible");
  };

  const filteredEtudiants = etudiants.filter(e => `${e.utilisateur?.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(searchTerm.toLowerCase()));
  const doneCount = promotionRows.filter(r => r.status === "done").length;
  const errorCount = promotionRows.filter(r => r.status === "error").length;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <div className="flex items-center gap-3">
            {mode !== "accueil" && <button onClick={() => { setMode("accueil"); setBulletinData(null); setSelectedEtudiant(null); setPromotionRows([]); setRecapRows([]); setStatsData(null); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bulletins de Notes</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {mode==="accueil"&&"Choisissez une action"}{mode==="individuel"&&(selectedEtudiant?`${selectedEtudiant.utilisateur?.nom} ${selectedEtudiant.prenom}`:"Sélectionnez un étudiant")}{mode==="promotion"&&`Génération en lot — ${doneCount}/${etudiants.length}`}{mode==="recap"&&`Récapitulatif — ${recapRows.length} étudiants`}{mode==="stats"&&"Statistiques de Promotion"}
              </p>
            </div>
          </div>
          {(bulletinData||(mode==="promotion"&&doneCount>0)||(mode==="recap"&&recapRows.length>0)) && (
            <div className="flex gap-2">
              <button onClick={()=>window.print()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"><Printer className="w-4 h-4" />Imprimer</button>
              {mode==="recap" && <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"><Download className="w-4 h-4" />Excel</button>}
            </div>
          )}
        </div>

        {error && <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg print:hidden"><AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" /><p className="text-red-700 text-sm">{error}</p></div>}
        {success && <div className="mb-4 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg print:hidden"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /><p className="text-green-700 text-sm">{success}</p></div>}

        {/* ══ ACCUEIL ══ */}
        {mode==="accueil" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Configuration</h2>
              <div className="flex flex-wrap gap-4 items-end">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                  <div className="flex gap-2">
                    {(["semestre","annuel"] as const).map(t=><button key={t} onClick={()=>setBulletinType(t)} className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${bulletinType===t?"border-indigo-600 bg-indigo-600 text-white":"border-gray-300 text-gray-700 hover:border-indigo-400"}`}>{t==="semestre"?"Semestre":"Annuel"}</button>)}
                  </div>
                </div>
                {bulletinType==="semestre" && <div className="flex-1 min-w-48"><label className="block text-xs font-medium text-gray-700 mb-1">Semestre</label>
                  <select value={selectedSemestreId} onChange={e=>setSelectedSemestreId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-sm">
                    <option value="">Choisir un semestre</option>
                    {semestres.map(s=><option key={s.id} value={s.id}>{s.libelle} — {s.anneeUniversitaire}</option>)}
                  </select>
                </div>}
                <div className="flex gap-2 ml-auto">
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleImportExcel} className="hidden" />
                  <button onClick={()=>fileInputRef.current?.click()} disabled={importing||!selectedSemestreId} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm">
                    {importing?<Loader2 className="w-4 h-4 animate-spin"/>:<Upload className="w-4 h-4"/>}Import Excel
                  </button>
                  <button onClick={handleExportExcel} disabled={!selectedSemestreId} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"><Download className="w-4 h-4"/>Export Excel</button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button onClick={()=>setMode("individuel")} className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:shadow-md transition-all text-left group">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-indigo-200"><FileText className="w-6 h-6 text-indigo-600"/></div>
                <h3 className="font-bold text-gray-900">Bulletin Individuel</h3>
                <p className="text-sm text-gray-500 mt-1">Générer le bulletin d'un étudiant spécifique</p>
              </button>
              <button onClick={handleGenererTous} disabled={generatingAll||loading||(bulletinType==="semestre"&&!selectedSemestreId)} className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:shadow-md transition-all text-left group disabled:opacity-50">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-200">{generatingAll?<Loader2 className="w-6 h-6 text-green-600 animate-spin"/>:<Zap className="w-6 h-6 text-green-600"/>}</div>
                <h3 className="font-bold text-gray-900">Génération en Lot</h3>
                <p className="text-sm text-gray-500 mt-1">Tous les {etudiants.length} étudiants en une fois</p>
              </button>
              <button onClick={handleGenererRecap} disabled={loadingRecap||!selectedSemestreId} className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-amber-400 hover:shadow-md transition-all text-left group disabled:opacity-50">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-amber-200">{loadingRecap?<Loader2 className="w-6 h-6 text-amber-600 animate-spin"/>:<BarChart3 className="w-6 h-6 text-amber-600"/>}</div>
                <h3 className="font-bold text-gray-900">Récapitulatif Promotion</h3>
                <p className="text-sm text-gray-500 mt-1">Tableau synthétique avec toutes les décisions</p>
              </button>
              <button onClick={handleGenererStats} disabled={loadingStats||!selectedSemestreId} className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-md transition-all text-left group disabled:opacity-50">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-200">{loadingStats?<Loader2 className="w-6 h-6 text-purple-600 animate-spin"/>:<TrendingUp className="w-6 h-6 text-purple-600"/>}</div>
                <h3 className="font-bold text-gray-900">Statistiques Promotion</h3>
                <p className="text-sm text-gray-500 mt-1">Moyennes, min, max, mentions, taux de réussite</p>
              </button>
              <button onClick={handleRecalculerPromotion} disabled={recalculating||loading} className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-red-400 hover:shadow-md transition-all text-left group disabled:opacity-50">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-red-200">{recalculating?<Loader2 className="w-6 h-6 text-red-600 animate-spin"/>:<RefreshCw className="w-6 h-6 text-red-600"/>}</div>
                <h3 className="font-bold text-gray-900">Recalcul Global</h3>
                <p className="text-sm text-gray-500 mt-1">Recalculer toutes les moyennes avant génération</p>
              </button>
            </div>
          </div>
        )}

        {/* ══ INDIVIDUEL ══ */}
        {mode==="individuel" && (
          <>
            {!selectedEtudiant ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden print:hidden">
                <div className="p-4 border-b border-gray-200"><input type="text" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Rechercher..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"/></div>
                {loading?<div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin text-indigo-600"/></div>:(
                  <div className="divide-y divide-gray-100">
                    {filteredEtudiants.map(etudiant=>(
                      <button key={etudiant.id} onClick={()=>{setSelectedEtudiant(etudiant);setBulletinData(null);}} className="w-full flex items-center justify-between px-6 py-4 hover:bg-indigo-50 transition-colors text-left">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0"><span className="text-indigo-700 font-bold text-xs">{(etudiant.utilisateur?.nom?.[0]??'')+(etudiant.prenom?.[0]??'')}</span></div>
                          <div><p className="font-semibold text-gray-900 text-sm">{etudiant.utilisateur?.nom} {etudiant.prenom}</p><p className="text-gray-500 text-xs">{etudiant.matricule}</p></div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400"/>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-md p-4 mb-5 print:hidden flex flex-wrap items-end gap-4">
                  <button onClick={()=>{setSelectedEtudiant(null);setBulletinData(null);}} className="text-sm text-indigo-600 hover:underline flex items-center gap-1"><ArrowLeft className="w-3 h-3"/>Changer d'étudiant</button>
                  <div className="flex-1"/>
                  <button onClick={handleGenererIndividuel} disabled={loadingBulletin||(bulletinType==="semestre"&&!selectedSemestreId)} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium">
                    {loadingBulletin?<Loader2 className="w-4 h-4 animate-spin"/>:<FileText className="w-4 h-4"/>}Générer
                  </button>
                </div>
                {loadingBulletin&&<div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin text-indigo-600"/></div>}
                {!loadingBulletin&&bulletinData&&<BulletinDocument data={bulletinData}/>}
                {!loadingBulletin&&!bulletinData&&<div className="bg-white rounded-xl shadow-md p-12 text-center print:hidden"><FileText className="w-12 h-12 text-indigo-300 mx-auto mb-3"/><p className="text-gray-500">Cliquez sur "Générer"</p></div>}
              </>
            )}
          </>
        )}

        {/* ══ PROMOTION (lot) ══ */}
        {mode==="promotion" && (
          <>
            <div className="bg-white rounded-xl shadow-md p-5 mb-6 print:hidden">
              <div className="flex items-center justify-between mb-3"><span className="font-semibold text-gray-900 text-sm">Progression : {doneCount+errorCount}/{promotionRows.length}</span>
                <div className="flex items-center gap-3 text-xs"><span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-3 h-3"/>{doneCount} générés</span>{errorCount>0&&<span className="flex items-center gap-1 text-red-600"><AlertCircle className="w-3 h-3"/>{errorCount} erreurs</span>}</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2"><div className="h-2 rounded-full bg-indigo-500 transition-all" style={{width:`${((doneCount+errorCount)/Math.max(promotionRows.length,1))*100}%`}}/></div>
              <div className="mt-4 max-h-40 overflow-y-auto space-y-1">
                {promotionRows.map((row,i)=><div key={i} className="flex items-center justify-between text-xs py-1 border-b border-gray-100"><span className="text-gray-700">{row.etudiant.utilisateur?.nom} {row.etudiant.prenom}</span><span className={row.status==="done"?"text-green-600":row.status==="error"?"text-red-600":row.status==="loading"?"text-blue-600":"text-gray-400"}>{row.status==="done"&&"✓ Généré"}{row.status==="error"&&`✗ ${row.error}`}{row.status==="loading"&&"⟳ En cours..."}{row.status==="idle"&&"—"}</span></div>)}
              </div>
            </div>
            <div className="space-y-8">{promotionRows.filter(r=>r.status==="done"&&r.data).map((row,i)=><div key={i} className="print:break-after-page"><div className="flex items-center justify-between mb-2 print:hidden"><span className="text-sm font-medium text-gray-700 flex items-center gap-2"><Award className="w-4 h-4 text-indigo-500"/>{row.etudiant.utilisateur?.nom} {row.etudiant.prenom}</span><button onClick={()=>window.print()} className="flex items-center gap-1 px-3 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100"><Printer className="w-3 h-3"/>Imprimer</button></div><BulletinDocument data={row.data!}/></div>)}</div>
          </>
        )}

        {/* ══ RÉCAPITULATIF ══ */}
        {mode==="recap" && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><Users className="w-5 h-5 text-amber-600"/>Récapitulatif de Promotion — {recapRows.length} étudiants</h2>
              <span className="text-sm text-gray-500">{semestres.find(s=>s.id===selectedSemestreId)?.anneeUniversitaire}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-amber-50 border-b">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Matricule</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nom & Prénom</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Moy. S5</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Moy. S6</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Moy. Annuelle</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Crédits</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Décision</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Mention</th>
                </tr></thead>
                <tbody className="divide-y">
                  {recapRows.map((row,i)=>(
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs text-gray-600">{row.matricule}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.nom} {row.prenom}</td>
                      <td className={`px-4 py-3 text-center text-sm font-semibold ${row.moyenneS5!==undefined?(row.moyenneS5>=10?"text-green-700":"text-red-600"):"text-gray-400"}`}>{row.moyenneS5!==undefined?row.moyenneS5.toFixed(2):"—"}</td>
                      <td className={`px-4 py-3 text-center text-sm font-semibold ${row.moyenneS6!==undefined?(row.moyenneS6>=10?"text-green-700":"text-red-600"):"text-gray-400"}`}>{row.moyenneS6!==undefined?row.moyenneS6.toFixed(2):"—"}</td>
                      <td className={`px-4 py-3 text-center text-sm font-bold ${row.moyenneAnnuelle!==undefined?(row.moyenneAnnuelle>=10?"text-green-700":"text-red-600"):"text-gray-400"}`}>{row.moyenneAnnuelle!==undefined?row.moyenneAnnuelle.toFixed(2):"—"}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">{row.creditsAcquis}/60</td>
                      <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${decisionColor(row.decision)}`}>{row.decision?(DECISIONS[row.decision]??row.decision):"—"}</span></td>
                      <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${mentionColor(row.mention)}`}>{row.mention?(MENTIONS[row.mention]??row.mention):"—"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ STATISTIQUES ══ */}
        {mode==="stats" && statsData && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[{label:"Étudiants",value:statsData.nombreEtudiants,color:"text-blue-600",bg:"bg-blue-50"},{label:"Moy. Générale",value:statsData.moyenneGenerale?.toFixed(2)??"—",color:"text-indigo-600",bg:"bg-indigo-50"},{label:"Note Min",value:statsData.min?.toFixed(2)??"—",color:"text-red-600",bg:"bg-red-50"},{label:"Note Max",value:statsData.max?.toFixed(2)??"—",color:"text-green-600",bg:"bg-green-50"}].map(({label,value,color,bg})=>(
                <div key={label} className={`${bg} rounded-xl p-5 text-center`}><div className={`text-3xl font-bold ${color}`}>{value}</div><div className="text-sm text-gray-600 mt-1">{label}</div></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-purple-600"/>Indicateurs</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100"><span className="text-sm text-gray-600">Écart-type</span><span className="font-semibold text-gray-900">{statsData.ecartType?.toFixed(2)??"—"}</span></div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100"><span className="text-sm text-gray-600">Taux de réussite</span><span className={`font-bold ${(statsData.tauxReussite??0)>=50?"text-green-600":"text-red-600"}`}>{statsData.tauxReussite?.toFixed(1)??"—"}%</span></div>
                  <div className="flex justify-between items-center py-2"><span className="text-sm text-gray-600">Taux d'échec</span><span className="font-semibold text-gray-900">{statsData.tauxReussite!==undefined?(100-statsData.tauxReussite).toFixed(1):"—"}%</span></div>
                </div>
              </div>
              {statsData.repartitionMentions && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Medal className="w-5 h-5 text-amber-600"/>Répartition des Mentions</h3>
                  <div className="space-y-3">
                    {[{label:"Très Bien (≥16)",value:statsData.repartitionMentions.tresBien,color:"bg-green-500"},{label:"Bien (14-16)",value:statsData.repartitionMentions.bien,color:"bg-blue-500"},{label:"Assez Bien (12-14)",value:statsData.repartitionMentions.assezBien,color:"bg-amber-500"},{label:"Passable (10-12)",value:statsData.repartitionMentions.passable,color:"bg-orange-500"}].map(({label,value,color})=>(
                      <div key={label}>
                        <div className="flex justify-between text-xs text-gray-600 mb-1"><span>{label}</span><span className="font-semibold">{value} étudiant(s)</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full ${color}`} style={{width:`${statsData.nombreEtudiants>0?(value/statsData.nombreEtudiants)*100:0}%`}}/></div>
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
