import React from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import { Plus, Trash2, CreditCard as Edit2, AlertCircle, Loader2, BookOpen, BookMarked, X, CheckCircle, Search } from 'lucide-react';
import { useEnseignants } from './useEnseignants';
import { Teacher, EMPTY_FORM } from './types';
import { enseignantService } from '../../../services';

export const GestionEnseignants: React.FC = () => {
  const {
    teachers, matieres, loading, loadingMatieres, error, success, showModal,
    editingTeacher, createdCredentials, showAssignModal, selectedTeacher,
    teacherMatieres, formData, submitting, assigning, searchTerm,
    setSearchTerm, setShowModal, setEditingTeacher, setFormData, setError,
    setSuccess, setCreatedCredentials, setShowAssignModal, setSelectedTeacher,
    setTeacherMatieres, loadMatieres, handleCreate, handleUpdate, handleDelete,
    isAssigned, handleToggleMatiere
  } = useEnseignants();

  const handleOpenCreate = async () => {
    setEditingTeacher(null);
    setFormData(EMPTY_FORM);
    setError('');
    setShowModal(true);
    await loadMatieres();
  };

  const handleOpenEdit = async (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      nom: teacher.utilisateur?.nom || '',
      prenom: teacher.prenom,
      email: teacher.utilisateur?.email || '',
      matricule: teacher.matricule,
      specialite: teacher.specialite || '',
      password: '',
    });
    setError('');
    setShowModal(true);
    await loadMatieres();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTeacher(null);
    setFormData(EMPTY_FORM);
    setError('');
  };

  const handleOpenAssign = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowAssignModal(true);
    setError('');
    setSuccess('');
    await loadMatieres();
    try {
      const assigned = await enseignantService.getMatieres(teacher.id);
      setTeacherMatieres(assigned);
    } catch {
      setTeacherMatieres([]);
    }
  };

  const filteredTeachers = teachers.filter(t => 
    `${t.utilisateur?.nom} ${t.prenom} ${t.matricule} ${t.utilisateur?.email} ${t.specialite}`
    .toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const nomA = a.utilisateur?.nom || '';
    const nomB = b.utilisateur?.nom || '';
    return nomA.localeCompare(nomB);
  });

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Enseignants</h1>
            <p className="text-gray-600 mt-1">Gérez les enseignants et leurs matières</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Inscription
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

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, matricule, email ou spécialité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="mb-4 text-sm text-gray-600 font-medium">
          {filteredTeachers.length} enseignant(s) affiché(s) sur {teachers.length} au total
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun enseignant trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nom</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Prénom</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Matricule</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Spécialité</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{teacher.utilisateur?.nom}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{teacher.prenom}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{teacher.utilisateur?.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{teacher.matricule}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {teacher.specialite ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                            <BookOpen className="w-3 h-3" />
                            {teacher.specialite}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => handleOpenAssign(teacher)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            <BookMarked className="w-4 h-4" />
                            Matières
                          </button>
                          <button
                            onClick={() => handleOpenEdit(teacher)}
                            title="Modifier"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(teacher.id)}
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingTeacher ? "Modifier l'enseignant" : 'Ajouter un enseignant'}
            </h2>

            {error && (
              <div className="mb-4 flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form autoComplete="off" onSubmit={editingTeacher ? handleUpdate : handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input type="text" required value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input type="text" required value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" required value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matricule *</label>
                <input type="text" required value={formData.matricule}
                  onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spécialité</label>
                {loadingMatieres ? (
                  <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-500">Chargement...</span>
                  </div>
                ) : (
                  <select
                    value={formData.specialite}
                    onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Sélectionner une matière</option>
                    {matieres.map((m) => (
                      <option key={m.id} value={m.libelle}>{m.libelle}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe {editingTeacher ? '(laisser vide = inchangé)' : '*'}
                </label>
                <input type="password" autoComplete="new-password" required={!editingTeacher} value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingTeacher ? 'Enregistrer les modifications' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Matières assignées</h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  {selectedTeacher.utilisateur?.nom} {selectedTeacher.prenom}
                  <span className="ml-2 font-semibold text-blue-600">
                    {teacherMatieres.length} matière(s)
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
              {matieres.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Aucune matière disponible</p>
                </div>
              ) : (
                matieres.map((matiere) => {
                  const assigned = isAssigned(matiere.id);
                  return (
                    <button
                      key={matiere.id}
                      onClick={() => handleToggleMatiere(matiere.id)}
                      disabled={assigning}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all disabled:opacity-50 ${assigned
                        ? 'border-green-400 bg-green-50 hover:bg-green-100'
                        : 'border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50'
                        }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${assigned ? 'bg-green-500' : 'bg-gray-200'}`}>
                          <BookOpen className={`w-4 h-4 ${assigned ? 'text-white' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <p className={`font-medium text-sm ${assigned ? 'text-green-800' : 'text-gray-900'}`}>
                            {matiere.libelle}
                          </p>
                          <p className="text-xs text-gray-500">
                            Coef. {matiere.coefficient} — {matiere.credits} crédits
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${assigned ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {assigned ? '✓ Assignée' : '+ Assigner'}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => { setShowAssignModal(false); setError(''); setSuccess(''); }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Terminer
              </button>
            </div>
          </div>
        </div>
      )}

      {createdCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4 text-green-600">
              <CheckCircle className="w-8 h-8" />
              <h2 className="text-xl font-bold text-gray-900">Compte Créé !</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Le compte {createdCredentials.role} pour <strong>{createdCredentials.nom}</strong> a été créé avec succès. Un email contenant ces identifiants vient d'être envoyé.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
              <div className="mb-3">
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-1">Email / Identifiant</span>
                <div className="text-gray-900 font-medium break-all">{createdCredentials.email}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-1">Mot de passe temporaire</span>
                <div className="text-gray-900 font-medium font-mono bg-white px-2 py-1 border border-gray-200 rounded">{createdCredentials.password}</div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setCreatedCredentials(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                J'ai compris
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
