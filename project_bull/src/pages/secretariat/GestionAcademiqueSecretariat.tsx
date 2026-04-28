import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../services/api';
import { Plus, Trash2, AlertCircle, Loader2 } from 'lucide-react';

interface Semester {
  id: string;
  libelle: string;
  code: string;
  anneeUniversitaire: string;
}

interface UE {
  id: string;
  code: string;
  libelle: string;
  semestreId: string;
}

interface Subject {
  id: string;
  libelle: string;
  coefficient: number;
  credits: number;
  uniteEnseignementId: string;
}

type Tab = 'semestres' | 'ue' | 'matieres';

export const GestionAcademiqueSecretariat: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('semestres');
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [ues, setUEs] = useState<UE[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [semesterForm, setSemesterForm] = useState({ libelle: '', code: '', anneeUniversitaire: '' });
  const [ueForm, setUEForm] = useState({ code: '', libelle: '', semestreId: '' });
  const [subjectForm, setSubjectForm] = useState({
    libelle: '',
    coefficient: 1,
    credits: 3,
    uniteEnseignementId: '',
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeTab === 'semestres') {
        const response = await api.get('/semestres');
        setSemesters(response.data || []);
      } else if (activeTab === 'ue') {
        const response = await api.get('/unites-enseignement');
        setUEs(response.data || []);
      } else if (activeTab === 'matieres') {
        const response = await api.get('/matieres');
        setSubjects(response.data || []);
      }
    } catch (err: any) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/semestres', semesterForm);
      setSemesterForm({ libelle: '', code: '', anneeUniversitaire: '' });
      setShowModal(false);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateUE = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/unites-enseignement', ueForm);
      setUEForm({ code: '', libelle: '', semestreId: '' });
      setShowModal(false);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/matieres', subjectForm);
      setSubjectForm({ libelle: '', coefficient: 1, credits: 3, uniteEnseignementId: '' });
      setShowModal(false);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (endpoint: string, id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      try {
        await api.delete(`${endpoint}/${id}`);
        await fetchData();
      } catch (err: any) {
        setError('Erreur lors de la suppression');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion Académique</h1>
            <p className="text-gray-600 mt-1">Gérez les semestres, UE et matières</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Ajouter
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          {(['semestres', 'ue', 'matieres'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium border-b-2 transition-all ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'semestres' && 'Semestres'}
              {tab === 'ue' && 'Unités d\'Enseignement'}
              {tab === 'matieres' && 'Matières'}
            </button>
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              {activeTab === 'semestres' && (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Libellé
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Code
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Année Universitaire
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {semesters.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                          Aucun semestre trouvé
                        </td>
                      </tr>
                    ) : (
                      semesters.map((semester) => (
                        <tr key={semester.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {semester.libelle}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{semester.code}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {semester.anneeUniversitaire}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDelete('/semestres', semester.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {activeTab === 'ue' && (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Code
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Libellé
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Semestre
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ues.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                          Aucune UE trouvée
                        </td>
                      </tr>
                    ) : (
                      ues.map((ue) => (
                        <tr key={ue.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{ue.code}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{ue.libelle}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{ue.semestreId}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDelete('/unites-enseignement', ue.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {activeTab === 'matieres' && (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Libellé
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Coefficient
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Crédits
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {subjects.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                          Aucune matière trouvée
                        </td>
                      </tr>
                    ) : (
                      subjects.map((subject) => (
                        <tr key={subject.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {subject.libelle}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{subject.coefficient}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{subject.credits}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDelete('/matieres', subject.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8">
              {activeTab === 'semestres' && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Ajouter un semestre</h2>
                  <form onSubmit={handleCreateSemester} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Libellé
                      </label>
                      <input
                        type="text"
                        required
                        value={semesterForm.libelle}
                        onChange={(e) =>
                          setSemesterForm({ ...semesterForm, libelle: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                      <input
                        type="text"
                        required
                        value={semesterForm.code}
                        onChange={(e) =>
                          setSemesterForm({ ...semesterForm, code: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Année Universitaire
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="2024-2025"
                        value={semesterForm.anneeUniversitaire}
                        onChange={(e) =>
                          setSemesterForm({ ...semesterForm, anneeUniversitaire: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Créer
                      </button>
                    </div>
                  </form>
                </>
              )}

              {activeTab === 'ue' && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Ajouter une Unité d'Enseignement
                  </h2>
                  <form onSubmit={handleCreateUE} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                      <input
                        type="text"
                        required
                        value={ueForm.code}
                        onChange={(e) => setUEForm({ ...ueForm, code: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Libellé
                      </label>
                      <input
                        type="text"
                        required
                        value={ueForm.libelle}
                        onChange={(e) => setUEForm({ ...ueForm, libelle: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID Semestre
                      </label>
                      <select
                        required
                        value={ueForm.semestreId}
                        onChange={(e) => setUEForm({ ...ueForm, semestreId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Sélectionner un semestre</option>
                        {semesters.map((sem) => (
                          <option key={sem.id} value={sem.id}>
                            {sem.libelle}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Créer
                      </button>
                    </div>
                  </form>
                </>
              )}

              {activeTab === 'matieres' && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Ajouter une matière</h2>
                  <form onSubmit={handleCreateSubject} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Libellé
                      </label>
                      <input
                        type="text"
                        required
                        value={subjectForm.libelle}
                        onChange={(e) =>
                          setSubjectForm({ ...subjectForm, libelle: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Coefficient
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={subjectForm.coefficient}
                        onChange={(e) =>
                          setSubjectForm({
                            ...subjectForm,
                            coefficient: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Crédits
                      </label>
                      <input
                        type="number"
                        required
                        value={subjectForm.credits}
                        onChange={(e) =>
                          setSubjectForm({ ...subjectForm, credits: parseInt(e.target.value) })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID UE
                      </label>
                      <select
                        required
                        value={subjectForm.uniteEnseignementId}
                        onChange={(e) =>
                          setSubjectForm({
                            ...subjectForm,
                            uniteEnseignementId: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Sélectionner une UE</option>
                        {ues.map((ue) => (
                          <option key={ue.id} value={ue.id}>
                            {ue.libelle}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Créer
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
