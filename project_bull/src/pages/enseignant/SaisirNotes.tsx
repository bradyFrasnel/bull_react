import { EnseignantLayout } from '../../components/EnseignantLayout';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  enseignantService,
  etudiantService,
  evaluationService,
  calculService,
} from '../../services';
import {
  Save,
  AlertCircle,
  Loader2,
  BookOpen,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import { Matiere, Etudiant } from '../../types';

interface LigneReleve {
  etudiant: Etudiant;
  cc: string;
  ccId?: string;
  examen: string;
  examenId?: string;
  rattrapage: string;
  rattrapageId?: string;
}

export const SaisirNotes: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [selectedMatiere, setSelectedMatiere] = useState<string>('');

  const [lignesReleve, setLignesReleve] = useState<LigneReleve[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingGrid, setLoadingGrid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    // Si une matière est passée en paramètre (depuis le dashboard)
    const state = location.state as { matiereId?: string };
    if (state?.matiereId) {
      setSelectedMatiere(state.matiereId);
    }
  }, [location.state]);

  useEffect(() => {
    if (selectedMatiere && etudiants.length > 0) {
      buildGrid();
    } else {
      setLignesReleve([]);
    }
  }, [selectedMatiere, etudiants]);

  const fetchInitialData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');

      // Récupérer l'enseignant et ses matières
      const enseignantData = await enseignantService.getByUserId(user.id);
      const matieresData = await enseignantService.getMatieres(enseignantData.id);
      setMatieres(matieresData);

      if (matieresData.length > 0 && !selectedMatiere && !(location.state as any)?.matiereId) {
        setSelectedMatiere(matieresData[0].id);
      }

      // Récupérer tous les étudiants
      const etudiantsData = await etudiantService.getAll();
      setEtudiants(etudiantsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement initial');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const buildGrid = async () => {
    if (!selectedMatiere) return;

    try {
      setLoadingGrid(true);
      setError('');

      // Récupérer les évaluations de cette matière pour construire la grille
      const evaluationsData = await evaluationService.getByMatiere(selectedMatiere);

      const newLignes: LigneReleve[] = etudiants.map(etud => {
        // On vérifie le `utilisateurId` ou l'`id` selon le format du backend
        const studentId = etud.id || etud.utilisateurId;
        const studentEvals = evaluationsData.filter(e => e.utilisateurId === studentId);

        const cc = studentEvals.find(e => e.type === 'CC');
        const examen = studentEvals.find(e => e.type === 'EXAMEN');
        const ratt = studentEvals.find(e => e.type === 'RATTRAPAGE');

        return {
          etudiant: etud,
          cc: cc ? cc.note.toString() : '',
          ccId: cc?.id,
          examen: examen ? examen.note.toString() : '',
          examenId: examen?.id,
          rattrapage: ratt ? ratt.note.toString() : '',
          rattrapageId: ratt?.id,
        };
      });

      setLignesReleve(newLignes);
    } catch (err: any) {
      console.error('Erreur lors du chargement des évaluations:', err);
      setError('Impossible de charger les notes pour cette matière.');
      setLignesReleve([]);
    } finally {
      setLoadingGrid(false);
    }
  };

  const isRattrapageAllowed = (cc: string, examen: string) => {
    if (!cc || !examen) return false;
    const nCc = parseFloat(cc);
    const nExamen = parseFloat(examen);
    if (isNaN(nCc) || isNaN(nExamen)) return false;

    // Le backend exige CC ET Examen pour autoriser le rattrapage, et moyenne < 6
    const moyenneInitiale = (nCc + nExamen) / 2;
    return moyenneInitiale < 6;
  };

  const handleNoteChange = (index: number, field: 'cc' | 'examen' | 'rattrapage', value: string) => {
    const updated = [...lignesReleve];
    updated[index][field] = value;
    setLignesReleve(updated);
  };

  const handleSubmitAll = async () => {
    if (!selectedMatiere || !user?.id) return;

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      // Validation côté client
      const invalidNotes = lignesReleve.some(ligne => {
        const check = (val: string) => val !== '' && (isNaN(parseFloat(val)) || parseFloat(val) < 0 || parseFloat(val) > 20);
        return check(ligne.cc) || check(ligne.examen) || check(ligne.rattrapage);
      });

      if (invalidNotes) {
        setError("Certaines notes sont invalides. Elles doivent être comprises entre 0 et 20.");
        setSubmitting(false);
        return;
      }

      // Préparer le payload pour saveReleve
      const payloadNotes = lignesReleve.map(ligne => ({
        utilisateurId: ligne.etudiant.id || ligne.etudiant.utilisateurId,
        noteCC: ligne.cc ? parseFloat(ligne.cc) : null,
        noteExamen: ligne.examen ? parseFloat(ligne.examen) : null,
        noteRattrapage: ligne.rattrapage ? parseFloat(ligne.rattrapage) : null,
      }));

      try {
        // Sauvegarder en masse
        await evaluationService.saveReleve(selectedMatiere, user.id, payloadNotes);
      } catch (massErr) {
        console.warn("L'endpoint de sauvegarde en masse a échoué. Fallback sur sauvegarde individuelle.");
        
        const promises: Promise<any>[] = [];
        
        for (const ligne of lignesReleve) {
          const studentId = ligne.etudiant.id || ligne.etudiant.utilisateurId;
          
          // Traitement CC
          if (ligne.cc !== '') {
            const note = parseFloat(ligne.cc);
            if (ligne.ccId) {
              promises.push(evaluationService.update(ligne.ccId, { note }).catch(e => console.error(e)));
            } else {
              promises.push(evaluationService.create({
                utilisateurId: studentId,
                matiereId: selectedMatiere,
                type: 'CC',
                note,
                saisiePar: user.id
              }).catch(e => console.error(e)));
            }
          }
          
          // Traitement Examen
          if (ligne.examen !== '') {
            const note = parseFloat(ligne.examen);
            if (ligne.examenId) {
              promises.push(evaluationService.update(ligne.examenId, { note }).catch(e => console.error(e)));
            } else {
              promises.push(evaluationService.create({
                utilisateurId: studentId,
                matiereId: selectedMatiere,
                type: 'EXAMEN',
                note,
                saisiePar: user.id
              }).catch(e => console.error(e)));
            }
          }

          // Traitement Rattrapage
          if (ligne.rattrapage !== '') {
            const note = parseFloat(ligne.rattrapage);
            if (ligne.rattrapageId) {
              promises.push(evaluationService.update(ligne.rattrapageId, { note }).catch(e => console.error(e)));
            } else {
              promises.push(evaluationService.create({
                utilisateurId: studentId,
                matiereId: selectedMatiere,
                type: 'RATTRAPAGE',
                note,
                saisiePar: user.id
              }).catch(e => console.error(e)));
            }
          }
        }
        
        await Promise.all(promises);
      }

      // Recalculer les moyennes pour chaque étudiant de la matière
      // On lance le calcul en parallèle pour tous les étudiants du relevé
      await Promise.all(
        lignesReleve.map(ligne => {
          const studentId = ligne.etudiant.id || ligne.etudiant.utilisateurId;
          return calculService.calculerMatiere(studentId, selectedMatiere).catch(() => null);
        })
      );

      setSuccess('Le relevé de notes a été enregistré avec succès !');

      // Recharger pour être sûr d'avoir les données à jour
      await buildGrid();

    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde du relevé');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <EnseignantLayout>
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/enseignant/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Saisir des Notes (Relevé)</h1>
              <p className="text-gray-600 mt-1">
                Saisissez les notes de tous les étudiants simultanément
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="w-full sm:w-1/3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <BookOpen className="w-4 h-4 inline mr-2 text-blue-600" />
                Sélectionner la Matière
              </label>
              <select
                value={selectedMatiere}
                onChange={(e) => setSelectedMatiere(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">-- Choisir une matière --</option>
                {matieres.map((matiere) => (
                  <option key={matiere.id} value={matiere.id}>
                    {matiere.libelle} (Coef. {matiere.coefficient})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSubmitAll}
                disabled={submitting || !selectedMatiere || loadingGrid || lignesReleve.length === 0}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Enregistrer
              </button>
            </div>
          </div>

          <div className="p-0 overflow-x-auto">
            {loadingGrid ? (
              <div className="p-12 flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                <p>Chargement du relevé de notes...</p>
              </div>
            ) : !selectedMatiere ? (
              <div className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Sélectionnez une matière pour afficher la liste des étudiants.</p>
              </div>
            ) : lignesReleve.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 text-lg">Aucun étudiant trouvé pour cette matière.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Étudiant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Matricule
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Contrôle
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Examen
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Rattrapage
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Moyenne
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lignesReleve.map((ligne, index) => {
                    const rattrapageAllowed = isRattrapageAllowed(ligne.cc, ligne.examen);

                    return (
                      <tr key={ligne.etudiant.id || index} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {ligne.etudiant.utilisateur?.nom} {ligne.etudiant.prenom}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{ligne.etudiant.matricule}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.01"
                            value={ligne.cc}
                            onChange={(e) => handleNoteChange(index, 'cc', e.target.value)}
                            className="w-24 px-3 py-1.5 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="-"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.01"
                            value={ligne.examen}
                            onChange={(e) => handleNoteChange(index, 'examen', e.target.value)}
                            className="w-24 px-3 py-1.5 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="-"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.01"
                            value={ligne.rattrapage}
                            onChange={(e) => handleNoteChange(index, 'rattrapage', e.target.value)}
                            disabled={!rattrapageAllowed && !ligne.rattrapage}
                            title={!rattrapageAllowed ? "Le rattrapage nécessite CC + Examen avec une moyenne < 6" : ""}
                            className={`w-24 px-3 py-1.5 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!rattrapageAllowed && !ligne.rattrapage ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                            placeholder="-"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </EnseignantLayout>
  );
};
