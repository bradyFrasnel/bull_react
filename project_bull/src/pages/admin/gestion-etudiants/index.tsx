import React from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import { Plus, Trash2, CreditCard as Edit2, AlertCircle, Loader2, CheckCircle, Download, Search, Filter } from 'lucide-react';
import { useEtudiants } from './useEtudiants';
import { Student, EMPTY_FORM, BAC_TYPES } from './types';
import { ConfirmModal } from '../../../components/ConfirmModal';

export const GestionEtudiants: React.FC = () => {
  const {
    students, loading, error, success, showModal, editingStudent, formData,
    submitting, classes, filieres, createdCredentials,
    searchTerm, selectedFiliereId, selectedClasseId, studentToDelete,
    setSearchTerm, setSelectedFiliereId, setSelectedClasseId, setStudentToDelete,
    setShowModal, setEditingStudent, setFormData, setCreatedCredentials,
    handleCreate, handleUpdate, handleDelete, confirmDelete
  } = useEtudiants();

  const filteredClasses = selectedFiliereId 
    ? classes.filter(c => c.filiereId === selectedFiliereId)
    : classes;

  const filteredStudents = students.filter(s => {
    const matchSearch = `${s.utilisateur?.nom} ${s.prenom} ${s.matricule} ${s.utilisateur?.email}`
      .toLowerCase().includes(searchTerm.toLowerCase());
    const matchClasse = !selectedClasseId || s.classeId === selectedClasseId;
    const matchFiliere = !selectedFiliereId || (s.classeId && filteredClasses.some(c => c.id === s.classeId));
    return matchSearch && matchClasse && matchFiliere;
  }).sort((a, b) => {
    const nomA = a.utilisateur?.nom || '';
    const nomB = b.utilisateur?.nom || '';
    return nomA.localeCompare(nomB);
  });

  const handleExportExcel = () => {
    // Simple export using XLSX
    const data = filteredStudents.map((s, i) => ({
      'N°': i + 1,
      'Matricule': s.matricule,
      'Nom': s.utilisateur?.nom || '',
      'Prénom': s.prenom,
      'Email': s.utilisateur?.email || '',
      'Classe': s.classe?.nom || 'Non assigné',
      'Statut': s.statut,
    }));
    import('xlsx').then(XLSX => {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Etudiants');
      XLSX.writeFile(wb, 'Liste_Etudiants.xlsx');
    });
  };

  const handleOpenCreate = () => {
    setEditingStudent(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nom: student.utilisateur?.nom || '',
      prenom: student.prenom,
      email: student.utilisateur?.email || '',
      matricule: student.matricule,
      password: '',
      date_naissance: student.date_naissance ? student.date_naissance.split('T')[0] : '',
      lieu_naissance: student.lieu_naissance || '',
      bac_type: student.bac_type || '',
      annee_bac: student.annee_bac ?? new Date().getFullYear(),
      provenance: student.provenance || '',
      classeId: student.classeId || '',
      statut: student.statut || 'INSCRIT',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setFormData(EMPTY_FORM);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Étudiants</h1>
            <p className="text-gray-600 mt-1">
              Inscription individuelle ou import via le classeur de notes (dans la page d'une classe)
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {filteredStudents.length > 0 && (
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm"
                title="Exporter la liste des étudiants"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                Exporter la liste
              </button>
            )}
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all active:scale-95 text-sm font-medium shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Inscription
            </button>
          </div>
        </div>


        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={selectedFiliereId}
                onChange={(e) => {
                  setSelectedFiliereId(e.target.value);
                  setSelectedClasseId('');
                }}
                className="pl-10 pr-8 py-2 w-full md:w-48 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="">Toutes les filières</option>
                {filieres.map(f => (
                  <option key={f.id} value={f.id}>{f.nom}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <select
                value={selectedClasseId}
                onChange={(e) => setSelectedClasseId(e.target.value)}
                className="px-4 py-2 w-full md:w-48 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                disabled={selectedFiliereId !== '' && filteredClasses.length === 0}
              >
                <option value="">Toutes les classes</option>
                {filteredClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher (nom, matricule...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        
        <div className="mb-4 text-sm text-gray-600 font-medium">
          {filteredStudents.length} étudiant(s) affiché(s) sur {students.length} au total
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun étudiant trouvé</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nom</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Prénom</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Matricule</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Classe</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Statut</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.utilisateur?.nom}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.prenom}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.utilisateur?.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.matricule}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.classe?.nom ? (
                          <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium border border-indigo-100">
                            {student.classe.nom}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic text-xs">Non assigné</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${student.statut === 'INSCRIT' ? 'bg-green-100 text-green-800' :
                          student.statut === 'REDOUBLANT' ? 'bg-orange-100 text-orange-800' :
                            student.statut === 'DIPLOME' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          {student.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(student)}
                            title="Modifier"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmDelete(student)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
            </>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingStudent ? "Modifier l'étudiant" : "Ajouter un étudiant"}
            </h2>

            <form autoComplete="off" onSubmit={editingStudent ? handleUpdate : handleCreate} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input type="text" required value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input type="text" required value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-gray-400 font-normal">(auto-généré si vide)</span>
                </label>
                <input type="email" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Matricule <span className="text-gray-400 font-normal">(auto-généré si vide)</span>
                </label>
                <input type="text" value={formData.matricule}
                  onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
                <select value={formData.classeId}
                  onChange={(e) => setFormData({ ...formData, classeId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="">Aucune classe</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="INSCRIT">INSCRIT</option>
                  <option value="REDOUBLANT">REDOUBLANT</option>
                  <option value="DIPLOME">DIPLOME</option>
                  <option value="ABANDONNE">ABANDONNE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe {editingStudent ? '(laisser vide = inchangé)' : '(défaut: pass1234)'}
                </label>
                <input type="password" autoComplete="new-password" value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance *</label>
                <input type="date" required value={formData.date_naissance}
                  onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lieu de naissance <span className="text-gray-400 font-normal">(facultatif)</span>
                </label>
                <input type="text" value={formData.lieu_naissance}
                  onChange={(e) => setFormData({ ...formData, lieu_naissance: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de BAC <span className="text-gray-400 font-normal">(facultatif)</span>
                </label>
                <select value={formData.bac_type}
                  onChange={(e) => setFormData({ ...formData, bac_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  <option value="">Sélectionner un type</option>
                  {BAC_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Année BAC</label>
                <input type="number" value={formData.annee_bac}
                  onChange={(e) => setFormData({ ...formData, annee_bac: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Classe d'affectation</label>
                <select value={formData.classeId}
                  onChange={(e) => setFormData({ ...formData, classeId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  <option value="">Aucune classe (Non affecté)</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provenance (établissement d'origine)
                </label>
                <input type="text" value={formData.provenance}
                  onChange={(e) => setFormData({ ...formData, provenance: e.target.value })}
                  placeholder="Ex: Lycée Omar Bongo, Libreville"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>

              <div className="col-span-2 flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingStudent ? 'Enregistrer les modifications' : 'Créer'}
                </button>
              </div>
            </form>
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
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                J'ai compris
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!studentToDelete}
        title="Supprimer l'étudiant"
        message={`Êtes-vous sûr de vouloir supprimer l'étudiant ${studentToDelete?.prenom} ${studentToDelete?.utilisateur?.nom} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
        loading={submitting}
        onConfirm={handleDelete}
        onCancel={() => setStudentToDelete(null)}
      />
    </AdminLayout>
  );
};
