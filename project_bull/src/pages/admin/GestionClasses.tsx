import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../services/api';
import {
  Plus, Trash2, Edit2, AlertCircle, Loader2,
  CheckCircle, Users, BookOpen, X, Link as LinkIcon, Eye,
} from 'lucide-react';

interface Classe {
  id: string;
  nom: string;
  code: string;
  anneeUniversitaire: string;
  capaciteMax?: number;
  _count?: { etudiants: number; semestres: number };
  semestres?: Array<{ semestre: { id: string; code: string; libelle: string } }>;
}

interface Semestre {
  id: string;
  code: string;
  libelle: string;
  anneeUniversitaire: string;
}

interface Filiere {
  id: string;
  nom: string;
  code: string;
}

interface ClasseForm {
  nom: string;
  code: string;
  anneeUniversitaire: string;
  capaciteMax: string;
  filiereId: string;
}

const EMPTY_FORM: ClasseForm = { nom: '', code: '', anneeUniversitaire: '', capaciteMax: '', filiereId: '' };

export const GestionClasses: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Classe[]>([]);
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal Créer / Modifier
  const [showModal, setShowModal] = useState(false);
  const [editingClasse, setEditingClasse] = useState<Classe | null>(null);
  const [formData, setFormData] = useState<ClasseForm>(EMPTY_FORM);

  // Modal Assigner Semestres
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClasse, setSelectedClasse] = useState<Classe | null>(null);
  const [assigning, setAssigning] = useState(false);

  // Modal Voir Étudiants
  const [viewingClasse, setViewingClasse] = useState<Classe | null>(null);
  const [etudiantsClasse, setEtudiantsClasse] = useState<any[]>([]);
  const [loadingEtudiants, setLoadingEtudiants] = useState(false);

  useEffect(() => { fetchClasses(); fetchSemestres(); fetchFilieres(); }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const r = await api.get('/classes');
      setClasses(r.data || []);
    } catch {
      setError('Erreur lors du chargement des classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchSemestres = async () => {
    try {
      const r = await api.get('/semestres');
      setSemestres(r.data || []);
    } catch { /* silencieux */ }
  };

  const fetchFilieres = async () => {
    try {
      const r = await api.get('/filieres');
      setFilieres(r.data || []);
    } catch { /* silencieux */ }
  };

  // Modal Création
  const handleOpenCreate = () => {
    setEditingClasse(null);
    setFormData(EMPTY_FORM);
    setError('');
    setShowModal(true);
  };

  // Modal Édition
  const handleOpenEdit = (classe: Classe) => {
    setEditingClasse(classe);
    setFormData({
      nom: classe.nom,
      code: classe.code,
      anneeUniversitaire: classe.anneeUniversitaire,
      capaciteMax: classe.capaciteMax ? String(classe.capaciteMax) : '',
      filiereId: (classe as any).filiereId || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClasse(null);
    setFormData(EMPTY_FORM);
    setError('');
  };

  // Soumission du formulaire (create ou update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const payload: any = {
        nom: formData.nom,
        code: formData.code,
        anneeUniversitaire: formData.anneeUniversitaire,
      };
      if (formData.capaciteMax) payload.capaciteMax = parseInt(formData.capaciteMax);
      if (formData.filiereId) payload.filiereId = formData.filiereId;

      if (editingClasse) {
        await api.put(`/classes/${editingClasse.id}`, payload);
        setSuccess('Classe mise à jour avec succès');
      } else {
        await api.post('/classes', payload);
        setSuccess('Classe créée avec succès');
      }
      handleCloseModal();
      await fetchClasses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  // Suppression
  const handleDelete = async (id: string, nom: string) => {
    if (!window.confirm(`Supprimer la classe "${nom}" ? Les étudiants seront détachés de cette classe.`)) return;
    try {
      await api.delete(`/classes/${id}`);
      setSuccess('Classe supprimée');
      await fetchClasses();
    } catch {
      setError('Erreur lors de la suppression');
    }
  };

  // Voir Étudiants
  const handleOpenEtudiants = async (classe: Classe) => {
    setViewingClasse(classe);
    setLoadingEtudiants(true);
    setError('');
    try {
      const res = await api.get(`/classes/${classe.id}/etudiants`);
      setEtudiantsClasse(res.data || []);
    } catch {
      setError('Erreur lors du chargement des étudiants de la classe');
    } finally {
      setLoadingEtudiants(false);
    }
  };

  // Modal Assigner Semestres
  const handleOpenAssign = (classe: Classe) => {
    setSelectedClasse(classe);
    setShowAssignModal(true);
    setError('');
    setSuccess('');
  };

  const isAssigned = (semestreId: string) =>
    selectedClasse?.semestres?.some(s => s.semestre.id === semestreId) ?? false;

  const handleToggleSemestre = async (semestreId: string) => {
    if (!selectedClasse) return;
    try {
      setAssigning(true);
      setError('');
      if (isAssigned(semestreId)) {
        await api.delete(`/classes/${selectedClasse.id}/semestres/${semestreId}`);
        setSelectedClasse(prev => prev ? {
          ...prev,
          semestres: (prev.semestres || []).filter(s => s.semestre.id !== semestreId),
        } : prev);
        setSuccess('Semestre retiré');
      } else {
        await api.post(`/classes/${selectedClasse.id}/semestres/${semestreId}`);
        const sem = semestres.find(s => s.id === semestreId);
        if (sem) {
          setSelectedClasse(prev => prev ? {
            ...prev,
            semestres: [...(prev.semestres || []), { semestre: sem }],
          } : prev);
        }
        setSuccess('Semestre assigné');
      }
      // Rafraîchir la liste principale
      await fetchClasses();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'assignation");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">

        {/* Header*/}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Classes</h1>
            <p className="text-gray-600 mt-1">Gérez les promotions et leurs semestres</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Nouvelle classe
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Tableau*/}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Aucune classe créée</p>
              <p className="text-gray-400 text-sm mt-1">Commencez par créer votre première promotion</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nom</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Code</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Filière</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Année Univ.</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Étudiants</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Semestres</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {classes.map((classe) => (
                    <tr key={classe.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{classe.nom}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-mono font-medium">
                          {classe.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {(classe as any).filiere?.code || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{classe.anneeUniversitaire}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
                          <Users className="w-4 h-4 text-gray-400" />
                          {classe._count?.etudiants ?? 0}
                          {classe.capaciteMax && (
                            <span className="text-gray-400 text-xs">/ {classe.capaciteMax}</span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          {classe._count?.semestres ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {/* Gérer la classe */}
                          <button
                            onClick={() => navigate(`/admin/classes/${classe.id}`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Gérer
                          </button>
                          {/* Assigner semestres */}
                          <button
                            onClick={() => handleOpenAssign(classe)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            <LinkIcon className="w-4 h-4" />
                            Semestres
                          </button>
                          {/* Modifier */}
                          <button
                            onClick={() => handleOpenEdit(classe)}
                            title="Modifier"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {/* Supprimer */}
                          <button
                            onClick={() => handleDelete(classe.id, classe.nom)}
                            title="Supprimer"
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Créer / Modifier*/}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingClasse ? 'Modifier la classe' : 'Ajouter une classe'}
            </h2>

            {error && (
              <div className="mb-4 flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form autoComplete="off" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la classe *
                </label>
                <input type="text" required value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: LP ASUR 2025"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code unique *
                </label>
                <input type="text" required value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="Ex: ASUR-2025"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono" />
                <p className="text-xs text-gray-500 mt-1">Identifiant unique, automatiquement mis en majuscules</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Année Univ. *</label>
                  <input
                    type="text"
                    required
                    value={formData.anneeUniversitaire}
                    onChange={(e) => setFormData({ ...formData, anneeUniversitaire: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="ex: 2025-2026"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacité Max</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capaciteMax}
                    onChange={(e) => setFormData({ ...formData, capaciteMax: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="ex: 30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filière *</label>
                <select
                  value={formData.filiereId}
                  onChange={(e) => setFormData({ ...formData, filiereId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="">Choisir filière</option>
                  {filieres.map(f => (
                    <option key={f.id} value={f.id}>{f.nom} ({f.code})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingClasse ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Assigner Semestres*/}
      {showAssignModal && selectedClasse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Semestres de la classe</h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  {selectedClasse.nom}
                  <span className="ml-2 font-semibold text-indigo-600">
                    {(selectedClasse.semestres || []).length} semestre(s) assigné(s)
                  </span>
                </p>
              </div>
              <button onClick={() => { setShowAssignModal(false); setError(''); setSuccess(''); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="mx-6 mt-4 flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {semestres.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Aucun semestre disponible</p>
                </div>
              ) : (
                semestres.map((semestre) => {
                  const assigned = isAssigned(semestre.id);
                  return (
                    <button
                      key={semestre.id}
                      onClick={() => handleToggleSemestre(semestre.id)}
                      disabled={assigning}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all disabled:opacity-50 ${assigned
                        ? 'border-indigo-400 bg-indigo-50 hover:bg-indigo-100'
                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50'
                        }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${assigned ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                          {semestre.code}
                        </div>
                        <div>
                          <p className={`font-medium text-sm ${assigned ? 'text-indigo-800' : 'text-gray-900'}`}>
                            {semestre.libelle}
                          </p>
                          <p className="text-xs text-gray-500">{semestre.anneeUniversitaire}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${assigned ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {assigned ? '✓ Assigné' : '+ Assigner'}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => { setShowAssignModal(false); setError(''); setSuccess(''); }}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Terminer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Voir Étudiants */}
      {viewingClasse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Étudiants de la classe</h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  {viewingClasse.nom} ({viewingClasse.code})
                  <span className="ml-2 font-semibold text-emerald-600">
                    {etudiantsClasse.length} étudiant(s) inscrit(s)
                  </span>
                </p>
              </div>
              <button onClick={() => setViewingClasse(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingEtudiants ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                </div>
              ) : etudiantsClasse.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Aucun étudiant n'est inscrit dans cette classe</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-4 py-3 font-semibold text-gray-900 text-sm">Matricule</th>
                        <th className="px-4 py-3 font-semibold text-gray-900 text-sm">Nom & Prénom</th>
                        <th className="px-4 py-3 font-semibold text-gray-900 text-sm">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {etudiantsClasse.map(etudiant => (
                        <tr key={etudiant.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-mono text-gray-600">{etudiant.matricule}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {etudiant.utilisateur?.nom} {etudiant.prenom}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{etudiant.utilisateur?.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setViewingClasse(null)}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
