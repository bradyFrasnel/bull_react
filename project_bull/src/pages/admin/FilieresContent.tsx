import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { filiereService } from '../../services';
import { Plus, Trash2, Edit2, AlertCircle, Loader2, CheckCircle, BookOpen, Search } from 'lucide-react';
import { Filiere, CreateFiliereForm } from '../../types';

const EMPTY_FORM: CreateFiliereForm = { nom: '', code: '' };

export const FilieresContent: React.FC<{ onSelectFiliere?: (filiereId: string) => void }> = ({ onSelectFiliere }) => {
  const navigate = useNavigate();
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSelectFiliere = (id: string) => {
    if (onSelectFiliere) {
      onSelectFiliere(id);
    } else {
      navigate(`/admin/academique?tab=classes&filiereId=${id}`);
    }
  };

  // Modals state
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Forms state
  const [form, setForm] = useState<CreateFiliereForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFilieres();
  }, []);

  const fetchFilieres = async () => {
    try {
      setLoading(true);
      const data = await filiereService.getAll();
      setFilieres(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des filières');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setForm(EMPTY_FORM);
    setError('');
    setShowCreate(true);
  };

  const handleOpenEdit = (filiere: Filiere) => {
    setForm({
      nom: filiere.nom,
      code: filiere.code,
    });
    setEditingId(filiere.id);
    setError('');
    setShowEdit(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      await filiereService.create(form);
      setSuccess('Filière créée avec succès');
      setShowCreate(false);
      fetchFilieres();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      setSubmitting(true);
      setError('');
      await filiereService.update(editingId, form);
      setSuccess('Filière mise à jour avec succès');
      setShowEdit(false);
      fetchFilieres();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette filière ?')) return;
    try {
      await filiereService.delete(id);
      setSuccess('Filière supprimée avec succès');
      fetchFilieres();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Filières</h1>
          <p className="text-gray-600 mt-1">Gérez les différents domaines d'étude</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all active:scale-95 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Nouvelle filière
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

      {/* Barre de recherche */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom de filière ou code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Résumé du nombre */}
      <div className="mb-4 text-sm text-gray-600 font-medium">
        {filieres.filter(f => `${f.nom} ${f.code}`.toLowerCase().includes(searchTerm.toLowerCase())).length} filière(s) affichée(s)
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : filieres.filter(f => `${f.nom} ${f.code}`.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Aucune filière trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nom</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Code</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Classes Associées</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filieres.filter(f => `${f.nom} ${f.code}`.toLowerCase().includes(searchTerm.toLowerCase())).map((filiere: any) => (
                  <tr key={filiere.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => handleSelectFiliere(filiere.id)}
                        className="text-left font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                      >
                        {filiere.nom}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-mono font-medium">
                        {filiere.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleSelectFiliere(filiere.id)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full transition-colors cursor-pointer"
                      >
                        {filiere._count?.classes ?? 0} classes
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => handleSelectFiliere(filiere.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                          title="Voir les classes de cette filière"
                        >
                          <BookOpen className="w-4 h-4" />
                          Voir classes
                        </button>
                        <button
                          onClick={() => handleOpenEdit(filiere)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(filiere.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
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

      {/* Modal Création/Édition */}
      {(showCreate || showEdit) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {showCreate ? 'Nouvelle Filière' : 'Modifier la Filière'}
              </h2>
            </div>

            <form onSubmit={showCreate ? handleCreateSubmit : handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom Complet de la filière *</label>
                <input
                  type="text"
                  required
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="ex: Génie Informatique"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono uppercase"
                  placeholder="ex: GI"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    setShowEdit(false);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={submitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {showCreate ? 'Créer' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
