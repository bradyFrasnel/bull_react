import React, { useEffect, useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { api } from "../../services/api";
import { etudiantService, semestreService, calculService, resultatSemestreService, resultatAnnuelService } from "../../services";
import { Plus, Trash2, AlertCircle, Loader2, RefreshCw, Play, CheckCircle, XCircle, Award, TrendingUp, Users } from "lucide-react";
import { Etudiant, ResultatSemestre, ResultatAnnuel } from "../../types";

interface SemesterI { id: string; libelle: string; code: string; anneeUniversitaire: string; }
interface UEI { id: string; code: string; libelle: string; semestreId: string; }
interface SubjectI { id: string; libelle: string; coefficient: number; credits: number; uniteEnseignementId: string; }
type Tab = "semestres" | "ue" | "matieres" | "calculs";

export const GestionAcademique: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("semestres");
  const [semesters, setSemesters] = useState<SemesterI[]>([]);
  const [ues, setUEs] = useState<UEI[]>([]);
  const [subjects, setSubjects] = useState<SubjectI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [semesterForm, setSemesterForm] = useState({ libelle: "", code: "", anneeUniversitaire: "" });
  const [ueForm, setUEForm] = useState({ code: "", libelle: "", semestreId: "" });
  const [subjectForm, setSubjectForm] = useState({ libelle: "", coefficient: 1, credits: 3, uniteEnseignementId: "" });
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [selectedEtudiant, setSelectedEtudiant] = useState("");
  const [selectedSemestre, setSelectedSemestre] = useState("");
  const [resultatSemestre, setResultatSemestre] = useState<ResultatSemestre | null>(null);
  const [resultatAnnuel, setResultatAnnuel] = useState<ResultatAnnuel | null>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => { fetchData(); }, [activeTab]);
  useEffect(() => { if (activeTab === "calculs") fetchEtudiants(); }, [activeTab]);
  useEffect(() => { if (selectedEtudiant && activeTab === "calculs") fetchResultats(); }, [selectedEtudiant, selectedSemestre]);

  const fetchData = async () => {
    try {
      setLoading(true); setError("");
      if (activeTab === "semestres") { const r = await api.get("/semestres"); setSemesters(r.data || []); }
      else if (activeTab === "ue") { const r = await api.get("/unites-enseignement"); setUEs(r.data || []); }
      else if (activeTab === "matieres") { const r = await api.get("/matieres"); setSubjects(r.data || []); }
    } catch { setError("Erreur lors du chargement"); } finally { setLoading(false); }
  };

  const fetchEtudiants = async () => {
    try {
      const [e, s] = await Promise.all([etudiantService.getAll(), semestreService.getAll()]);
      setEtudiants(e); setSemesters(s);
    } catch { /* silencieux */ }
  };

  const fetchResultats = async () => {
    if (!selectedEtudiant) return;
    try {
      if (selectedSemestre) { try { const r = await resultatSemestreService.getByEtudiantAndSemestre(selectedEtudiant, selectedSemestre); setResultatSemestre(r); } catch { setResultatSemestre(null); } }
      try { const a = await resultatAnnuelService.getByEtudiant(selectedEtudiant); setResultatAnnuel(a.length > 0 ? a[0] : null); } catch { setResultatAnnuel(null); }
    } catch { /* silencieux */ }
  };

  const handleCreateSemester = async (e: React.FormEvent) => {
    e.preventDefault(); try { setSubmitting(true); await api.post("/semestres", semesterForm); setSemesterForm({ libelle: "", code: "", anneeUniversitaire: "" }); setShowModal(false); await fetchData(); } catch (err: any) { setError(err.response?.data?.message || "Erreur"); } finally { setSubmitting(false); }
  };
  const handleCreateUE = async (e: React.FormEvent) => {
    e.preventDefault(); try { setSubmitting(true); await api.post("/unites-enseignement", ueForm); setUEForm({ code: "", libelle: "", semestreId: "" }); setShowModal(false); await fetchData(); } catch (err: any) { setError(err.response?.data?.message || "Erreur"); } finally { setSubmitting(false); }
  };
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault(); try { setSubmitting(true); await api.post("/matieres", subjectForm); setSubjectForm({ libelle: "", coefficient: 1, credits: 3, uniteEnseignementId: "" }); setShowModal(false); await fetchData(); } catch (err: any) { setError(err.response?.data?.message || "Erreur"); } finally { setSubmitting(false); }
  };
  const handleDelete = async (endpoint: string, id: string) => {
    if (!window.confirm("Supprimer cet élément ?")) return;
    try { await api.delete(`${endpoint}/${id}`); await fetchData(); } catch { setError("Erreur lors de la suppression"); }
  };
  const handleCalculerSemestre = async () => {
    if (!selectedEtudiant || !selectedSemestre) { setError("Sélectionnez un étudiant et un semestre"); return; }
    try { setCalculating(true); setError(""); const r = await calculService.calculerSemestre(selectedEtudiant, selectedSemestre); setResultatSemestre(r); setSuccess("Calcul effectué"); } catch (err: any) { setError(err.response?.data?.message || "Erreur"); } finally { setCalculating(false); }
  };
  const handleRecalculerTout = async () => {
    if (!selectedEtudiant) { setError("Sélectionnez un étudiant"); return; }
    try { setCalculating(true); setError(""); const r = await calculService.recalculerTout(selectedEtudiant); setResultatAnnuel(r); setSuccess("Recalcul complet effectué"); await fetchResultats(); } catch (err: any) { setError(err.response?.data?.message || "Erreur"); } finally { setCalculating(false); }
  };
  const DECISIONS: Record<string,string> = { DIPLOME: "Diplômé(e)", REPRISE_SOUTENANCE: "Reprise de Soutenance", REDOUBLE: "Redouble la Licence 3" };
  const MENTIONS: Record<string,string> = { TRES_BIEN: "Très Bien", BIEN: "Bien", ASSEZ_BIEN: "Assez Bien", PASSABLE: "Passable" };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Référentiel & Calculs</h1>
            <p className="text-gray-500 text-sm mt-0.5">Semestres, UE, Matières et Validation des moyennes</p>
          </div>
          {activeTab !== "calculs" && (
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium">
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          )}
        </div>

        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          {(["semestres","ue","matieres","calculs"] as const).map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setError(""); setSuccess(""); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? "bg-white shadow text-blue-600" : "text-gray-600 hover:text-gray-900"}`}>
              {tab === "semestres" && "Semestres"}
              {tab === "ue" && "Unités d'Ens."}
              {tab === "matieres" && "Matières"}
              {tab === "calculs" && "Calculs & Validation"}
            </button>
          ))}
        </div>

        {error && <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"><AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" /><p className="text-red-700 text-sm">{error}</p></div>}
        {success && <div className="mb-4 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /><p className="text-green-700 text-sm">{success}</p></div>}

        {activeTab !== "calculs" && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : (
              <div className="overflow-x-auto">
                {activeTab === "semestres" && (
                  <table className="w-full">
                    <thead><tr className="bg-gray-50 border-b">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Libellé</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Année Univ.</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y">
                      {semesters.length === 0 ? <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500 text-sm">Aucun semestre</td></tr>
                      : semesters.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm font-medium text-gray-900">{s.libelle}</td>
                          <td className="px-6 py-3 text-sm text-gray-600">{s.code}</td>
                          <td className="px-6 py-3 text-sm text-gray-600">{s.anneeUniversitaire}</td>
                          <td className="px-6 py-3 text-right"><button onClick={() => handleDelete("/semestres", s.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {activeTab === "ue" && (
                  <table className="w-full">
                    <thead><tr className="bg-gray-50 border-b">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Libellé</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Semestre</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y">
                      {ues.length === 0 ? <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500 text-sm">Aucune UE</td></tr>
                      : ues.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm font-medium text-gray-900">{u.code}</td>
                          <td className="px-6 py-3 text-sm text-gray-600">{u.libelle}</td>
                          <td className="px-6 py-3 text-sm text-gray-600">{u.semestreId}</td>
                          <td className="px-6 py-3 text-right"><button onClick={() => handleDelete("/unites-enseignement", u.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {activeTab === "matieres" && (
                  <table className="w-full">
                    <thead><tr className="bg-gray-50 border-b">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Libellé</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Coef.</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Crédits</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y">
                      {subjects.length === 0 ? <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500 text-sm">Aucune matière</td></tr>
                      : subjects.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm font-medium text-gray-900">{s.libelle}</td>
                          <td className="px-6 py-3 text-sm text-center text-gray-600">{s.coefficient}</td>
                          <td className="px-6 py-3 text-sm text-center text-gray-600">{s.credits}</td>
                          <td className="px-6 py-3 text-right"><button onClick={() => handleDelete("/matieres", s.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}
        {activeTab === "calculs" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-md p-5">
                <h2 className="font-bold text-gray-900 mb-4">Sélection</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1"><Users className="w-3 h-3 inline mr-1" />Étudiant</label>
                    <select value={selectedEtudiant} onChange={e => setSelectedEtudiant(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                      <option value="">Sélectionner</option>
                      {etudiants.map(et => <option key={et.id} value={et.id}>{et.utilisateur?.nom} {et.prenom} ({et.matricule})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Semestre</label>
                    <select value={selectedSemestre} onChange={e => setSelectedSemestre(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                      <option value="">Sélectionner</option>
                      {semesters.map(s => <option key={s.id} value={s.id}>{s.libelle} — {s.anneeUniversitaire}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-5 space-y-3">
                <h2 className="font-bold text-gray-900 mb-2">Actions</h2>
                <button onClick={handleCalculerSemestre} disabled={!selectedEtudiant || !selectedSemestre || calculating} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
                  {calculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Calculer le semestre
                </button>
                <button onClick={handleRecalculerTout} disabled={!selectedEtudiant || calculating} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium">
                  {calculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Recalculer tout
                </button>
                <p className="text-xs text-gray-400 text-center">Le recalcul déclenche la cascade complète matière → UE → semestre → annuel</p>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
              {resultatSemestre && (
                <div className={`bg-white rounded-xl shadow-md p-5 border-l-4 ${resultatSemestre.valide ? "border-green-500" : "border-red-500"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2"><TrendingUp className="w-4 h-4" />Résultat Semestre</h2>
                    {resultatSemestre.valide ? <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium"><CheckCircle className="w-3 h-3" />Validé</span> : <span className="flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs font-medium"><XCircle className="w-3 h-3" />Non validé</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg"><div className="text-2xl font-bold text-blue-600">{resultatSemestre.moyenneSemestre?.toFixed(2)}</div><div className="text-xs text-gray-600 mt-1">Moyenne /20</div></div>
                    <div className="text-center p-3 bg-green-50 rounded-lg"><div className="text-2xl font-bold text-green-600">{resultatSemestre.creditsAcquis}</div><div className="text-xs text-gray-600 mt-1">Crédits acquis</div></div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg"><div className="text-2xl font-bold text-gray-600">{resultatSemestre.creditsTotal}</div><div className="text-xs text-gray-600 mt-1">Crédits total</div></div>
                  </div>
                  <div className="mt-3"><div className="w-full bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full ${resultatSemestre.valide ? "bg-green-500" : "bg-blue-500"}`} style={{width:`${Math.min(100,(resultatSemestre.creditsAcquis/(resultatSemestre.creditsTotal||30))*100)}%`}} /></div></div>
                </div>
              )}
              {resultatAnnuel && (
                <div className={`bg-white rounded-xl shadow-md p-5 border-l-4 ${resultatAnnuel.decisionJury==="DIPLOME"?"border-green-500":resultatAnnuel.decisionJury==="REPRISE_SOUTENANCE"?"border-amber-500":"border-red-500"}`}>
                  <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-3"><Award className="w-4 h-4" />Résultat Annuel</h2>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg"><div className="text-2xl font-bold text-blue-600">{resultatAnnuel.moyenneAnnuelle?.toFixed(2)}</div><div className="text-xs text-gray-600 mt-1">Moyenne annuelle /20</div></div>
                    <div className="text-center p-3 bg-green-50 rounded-lg"><div className="text-2xl font-bold text-green-600">{resultatAnnuel.creditsAcquis}/{resultatAnnuel.creditsTotal}</div><div className="text-xs text-gray-600 mt-1">Crédits</div></div>
                  </div>
                  <div className={`p-3 rounded-lg ${resultatAnnuel.decisionJury==="DIPLOME"?"bg-green-50 border border-green-200":resultatAnnuel.decisionJury==="REPRISE_SOUTENANCE"?"bg-amber-50 border border-amber-200":"bg-red-50 border border-red-200"}`}>
                    <div className="flex items-center justify-between">
                      <div><p className="text-xs text-gray-600">Décision du jury</p><p className={`font-bold text-base mt-0.5 ${resultatAnnuel.decisionJury==="DIPLOME"?"text-green-700":resultatAnnuel.decisionJury==="REPRISE_SOUTENANCE"?"text-amber-700":"text-red-700"}`}>{DECISIONS[resultatAnnuel.decisionJury??'']??'En attente'}</p></div>
                      {resultatAnnuel.mention && <div className="text-right"><p className="text-xs text-gray-600">Mention</p><p className="font-bold text-blue-700">{MENTIONS[resultatAnnuel.mention]??resultatAnnuel.mention}</p></div>}
                    </div>
                  </div>
                </div>
              )}
              {!resultatSemestre && !resultatAnnuel && selectedEtudiant && (
                <div className="bg-white rounded-xl shadow-md p-10 text-center"><TrendingUp className="w-10 h-10 text-gray-400 mx-auto mb-3" /><p className="text-gray-500 text-sm">Aucun résultat — lancez un calcul</p></div>
              )}
              {!selectedEtudiant && (
                <div className="bg-white rounded-xl shadow-md p-10 text-center"><Users className="w-10 h-10 text-gray-400 mx-auto mb-3" /><p className="text-gray-500 text-sm">Sélectionnez un étudiant</p></div>
              )}
            </div>
          </div>
        )}
        {showModal && activeTab !== "calculs" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8">
              {activeTab === "semestres" && (
                <><h2 className="text-xl font-bold text-gray-900 mb-5">Ajouter un semestre</h2>
                <form onSubmit={handleCreateSemester} className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Libellé *</label><input type="text" required value={semesterForm.libelle} onChange={e => setSemesterForm({...semesterForm,libelle:e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Code *</label><input type="text" required value={semesterForm.code} onChange={e => setSemesterForm({...semesterForm,code:e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Année Universitaire *</label><input type="text" required placeholder="2024-2025" value={semesterForm.anneeUniversitaire} onChange={e => setSemesterForm({...semesterForm,anneeUniversitaire:e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                  <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Annuler</button><button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">{submitting && <Loader2 className="w-4 h-4 animate-spin" />}Créer</button></div>
                </form></>
              )}
              {activeTab === "ue" && (
                <><h2 className="text-xl font-bold text-gray-900 mb-5">Ajouter une UE</h2>
                <form onSubmit={handleCreateUE} className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Code *</label><input type="text" required value={ueForm.code} onChange={e => setUEForm({...ueForm,code:e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Libellé *</label><input type="text" required value={ueForm.libelle} onChange={e => setUEForm({...ueForm,libelle:e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Semestre *</label><select required value={ueForm.semestreId} onChange={e => setUEForm({...ueForm,semestreId:e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"><option value="">Sélectionner</option>{semesters.map(s => <option key={s.id} value={s.id}>{s.libelle}</option>)}</select></div>
                  <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Annuler</button><button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">{submitting && <Loader2 className="w-4 h-4 animate-spin" />}Créer</button></div>
                </form></>
              )}
              {activeTab === "matieres" && (
                <><h2 className="text-xl font-bold text-gray-900 mb-5">Ajouter une matière</h2>
                <form onSubmit={handleCreateSubject} className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Libellé *</label><input type="text" required value={subjectForm.libelle} onChange={e => setSubjectForm({...subjectForm,libelle:e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Coefficient *</label><input type="number" step="0.1" required value={subjectForm.coefficient} onChange={e => setSubjectForm({...subjectForm,coefficient:parseFloat(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Crédits *</label><input type="number" required value={subjectForm.credits} onChange={e => setSubjectForm({...subjectForm,credits:parseInt(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">UE *</label><select required value={subjectForm.uniteEnseignementId} onChange={e => setSubjectForm({...subjectForm,uniteEnseignementId:e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"><option value="">Sélectionner</option>{ues.map(u => <option key={u.id} value={u.id}>{u.libelle}</option>)}</select></div>
                  <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Annuler</button><button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">{submitting && <Loader2 className="w-4 h-4 animate-spin" />}Créer</button></div>
                </form></>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

