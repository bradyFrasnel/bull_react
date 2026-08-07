import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../services/api';
import { Plus, Trash2, CreditCard as Edit2, AlertCircle, Loader2, CheckCircle, Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Student {
  id: string;
  utilisateurId: string;
  prenom: string;
  matricule: string;
  date_naissance?: string;
  lieu_naissance?: string;
  bac_type?: string;
  annee_bac?: number;
  provenance?: string;
  classeId?: string;
  statut?: string;
  utilisateur?: { email: string; nom: string };
  classe?: { id: string; nom: string; code: string };
}

interface StudentForm {
  nom: string;
  prenom: string;
  email: string;
  matricule: string;
  password: string;
  date_naissance: string;
  lieu_naissance: string;
  bac_type: string;
  annee_bac: number;
  provenance: string;
  classeId: string;
  statut: string;
}

const EMPTY_FORM: StudentForm = {
  nom: '', prenom: '', email: '', matricule: '', password: '',
  date_naissance: '', lieu_naissance: '', bac_type: '',
  annee_bac: new Date().getFullYear(), provenance: '',
  classeId: '', statut: 'INSCRIT'
};

const BAC_TYPES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'STT', 'SMS', 'STI'];

export const GestionEtudiants: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<StudentForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [classes, setClasses] = useState<{ id: string, nom: string }[]>([]);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch {
      console.error('Erreur classes');
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/etudiants');
      const data = (response.data || []).map((s: any) => ({
        ...s,
        id: s.utilisateurId ?? s.id,
      }));
      setStudents(data);
    } catch {
      setError('Erreur lors du chargement des étudiants');
    } finally {
      setLoading(false);
    }
  };

  // ── Exporter un fichier Excel pré-rempli ou la liste des étudiants ─────────────
  const handleExportExcel = () => {
    let exportData: any[] = [];

    if (students.length > 0) {
      exportData = students.map((s) => ({
        Matricule: s.matricule || '',
        Nom: s.utilisateur?.nom || '',
        Prénom: s.prenom || '',
        Email: s.utilisateur?.email || '',
        'Mot de passe': 'pass1234',
        'Date Naissance (AAAA-MM-JJ)': s.date_naissance ? s.date_naissance.split('T')[0] : '',
        'Lieu Naissance': s.lieu_naissance || '',
        'Type BAC': s.bac_type || '',
        'Année BAC': s.annee_bac || new Date().getFullYear(),
        Provenance: s.provenance || '',
        Statut: s.statut || 'INSCRIT',
        'Code Classe': s.classe?.code || '',
      }));
    } else {
      // Modèle pré-rempli d'exemple pour inscription en masse
      exportData = [
        {
          Matricule: '2024ASUR001',
          Nom: 'MBA NSOME',
          Prénom: 'Yannick Lionel',
          Email: 'yannick.mba@asur.ga',
          'Mot de passe': 'pass1234',
          'Date Naissance (AAAA-MM-JJ)': '2001-05-15',
          'Lieu Naissance': 'Libreville',
          'Type BAC': 'C',
          'Année BAC': '2022',
          Provenance: 'Lycée Léon MBA',
          Statut: 'INSCRIT',
          'Code Classe': 'ASUR-2025',
        },
        {
          Matricule: '2024ASUR002',
          Nom: 'YESSA FAYE',
          Prénom: 'David Almond',
          Email: 'david.yessa@asur.ga',
          'Mot de passe': 'pass1234',
          'Date Naissance (AAAA-MM-JJ)': '2000-09-13',
          'Lieu Naissance': 'Port-Gentil',
          'Type BAC': 'D',
          'Année BAC': '2021',
          Provenance: 'Lycée National',
          Statut: 'INSCRIT',
          'Code Classe': 'ASUR-2025',
        },
      ];
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 28 },
      { wch: 15 },
      { wch: 26 },
      { wch: 18 },
      { wch: 12 },
      { wch: 12 },
      { wch: 25 },
      { wch: 14 },
      { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Etudiants');
    XLSX.writeFile(wb, 'inscription_etudiants_pre_rempli.xlsx');
  };

  // ── Importer un fichier Excel pour inscription en masse ─────────────────────
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError('');
    setSuccess('');

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          throw new Error('Le fichier Excel est vide.');
        }

        let createdCount = 0;
        let errorsCount = 0;

        for (const row of data) {
          if (!row.Matricule || !row.Nom || !row.Prénom || !row.Email) continue;

          // Trouver l'ID de la classe si un Code Classe est renseigné
          let matchedClasseId: string | null = null;
          if (row['Code Classe']) {
            const foundClasse = classes.find(
              (c: any) => c.code === String(row['Code Classe']).trim() || c.nom === String(row['Code Classe']).trim()
            );
            if (foundClasse) matchedClasseId = foundClasse.id;
          }

          try {
            await api.post('/auth/admin/create-etudiant', {
              matricule: String(row.Matricule).trim(),
              nom: String(row.Nom).trim(),
              prenom: String(row.Prénom).trim(),
              email: String(row.Email).trim(),
              password: String(row['Mot de passe'] || 'pass1234').trim(),
              date_naissance: row['Date Naissance (AAAA-MM-JJ)']
                ? new Date(row['Date Naissance (AAAA-MM-JJ)']).toISOString()
                : new Date().toISOString(),
              lieu_naissance: String(row['Lieu Naissance'] || '-'),
              bac_type: String(row['Type BAC'] || 'C'),
              annee_bac: parseInt(String(row['Année BAC'] || '2023')),
              provenance: String(row.Provenance || '-'),
              statut: String(row.Statut || 'INSCRIT'),
              classeId: matchedClasseId,
            });
            createdCount++;
          } catch (err) {
            console.error('Erreur inscription étudiant:', row, err);
            errorsCount++;
          }
        }

        if (createdCount > 0) {
          setSuccess(
            `${createdCount} étudiant(s) inscrit(s) en masse avec succès ! ${
              errorsCount > 0 ? `(${errorsCount} erreur(s))` : ''
            }`
          );
          await fetchStudents();
        } else {
          setError(
            `Aucun étudiant n'a pu être inscrit. Vérifiez le format du fichier (erreurs: ${errorsCount}).`
          );
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la lecture du fichier Excel.');
      } finally {
        setImporting(false);
        e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  // ── Ouvrir le modal en mode création ──────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditingStudent(null);
    setFormData(EMPTY_FORM);
    setError('');
    setShowModal(true);
  };

  // ── Ouvrir le modal en mode édition, pré-rempli avec les données existantes ──
  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nom: student.utilisateur?.nom || '',
      prenom: student.prenom,
      email: student.utilisateur?.email || '',
      matricule: student.matricule,
      password: '', // on ne re-saisit le mot de passe que si on veut le changer
      date_naissance: student.date_naissance ? student.date_naissance.split('T')[0] : '',
      lieu_naissance: student.lieu_naissance || '',
      bac_type: student.bac_type || '',
      annee_bac: student.annee_bac ?? new Date().getFullYear(),
      provenance: student.provenance || '',
      classeId: student.classeId || '',
      statut: student.statut || 'INSCRIT',
    });
    setError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setFormData(EMPTY_FORM);
    setError('');
  };

  // ── Création ──────────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const payload = { ...formData, classeId: formData.classeId || null };
      await api.post('/auth/admin/create-etudiant', payload);
      setSuccess('Étudiant créé avec succès');
      handleCloseModal();
      await fetchStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Mise à jour ───────────────────────────────────────────────────────────────
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      setSubmitting(true);
      setError('');

      // Construire le payload : on n'envoie le mot de passe que s'il est renseigné
      const payload: any = {
        prenom: formData.prenom,
        matricule: formData.matricule,
        date_naissance: formData.date_naissance || undefined,
        lieu_naissance: formData.lieu_naissance || undefined,
        bac_type: formData.bac_type || undefined,
        annee_bac: formData.annee_bac,
        provenance: formData.provenance || undefined,
        // Champs de l'utilisateur parent transmis par le backend
        nom: formData.nom,
        email: formData.email,
        classeId: formData.classeId || null,
        statut: formData.statut,
      };
      if (formData.password) payload.password = formData.password;

      await api.put(`/etudiants/${editingStudent.id}`, payload);
      setSuccess('Étudiant mis à jour avec succès');
      handleCloseModal();
      await fetchStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cet étudiant ? Cette action est irréversible.')) return;
    try {
      await api.delete(`/etudiants/${id}`);
      setSuccess('Étudiant supprimé');
      await fetchStudents();
    } catch {
      setError('Erreur lors de la suppression');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Étudiants</h1>
            <p className="text-gray-600 mt-1">Inscription individuelle ou en masse via fichier Excel pré-rempli</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm"
              title="Exporter ou télécharger le fichier modèle pré-rempli"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              {students.length > 0 ? 'Exporter la liste' : 'Modèle pré-rempli'}
            </button>
            <label className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors cursor-pointer shadow-sm">
              {importing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Importer Excel
              <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleImportExcel}
                disabled={importing}
              />
            </label>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all active:scale-95 text-sm font-medium shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Inscription
            </button>
          </div>
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

        {/*  Tableau */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun étudiant trouvé</p>
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
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Classe</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Statut</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map((student) => (
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
                          {/* Bouton Modifier — maintenant actif */}
                          <button
                            onClick={() => handleOpenEdit(student)}
                            title="Modifier"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
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

      {/* Modal Créer / Modifier Étudiant */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingStudent ? 'Modifier l\'étudiant' : 'Ajouter un étudiant'}
            </h2>

            {error && (
              <div className="mb-4 flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form autoComplete="off" onSubmit={editingStudent ? handleUpdate : handleCreate} className="grid grid-cols-2 gap-4">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input type="text" required value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>

              {/* Prénom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input type="text" required value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>

              {/* Email */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" required value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>

              {/* Matricule */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matricule *</label>
                <input type="text" required value={formData.matricule}
                  onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>

              {/* Classe */}
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

              {/* Statut */}
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

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe {editingStudent ? '(laisser vide = inchangé)' : '*'}
                </label>
                <input type="password" autoComplete="new-password" required={!editingStudent} value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>

              {/* Date de naissance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                <input type="date" value={formData.date_naissance}
                  onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>

              {/* Lieu de naissance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de naissance</label>
                <input type="text" value={formData.lieu_naissance}
                  onChange={(e) => setFormData({ ...formData, lieu_naissance: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>

              {/* Type BAC */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de BAC</label>
                <select value={formData.bac_type}
                  onChange={(e) => setFormData({ ...formData, bac_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  <option value="">Sélectionner un type</option>
                  {BAC_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              {/* Année BAC */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Année BAC</label>
                <input type="number" value={formData.annee_bac}
                  onChange={(e) => setFormData({ ...formData, annee_bac: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>

              {/* Classe */}
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

              {/* Provenance */}
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
    </AdminLayout>
  );
};
