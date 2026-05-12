import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { EtudiantLayout } from '../../components/EtudiantLayout';
import {
  etudiantService,
  semestreService,
  evaluationService,
  resultatSemestreService,
  resultatAnnuelService,
} from '../../services';
import { bulletinService } from '../../services/bulletin.service';
import { AlertCircle, Loader2, Printer, Download } from 'lucide-react';
import { Etudiant, Semestre } from '../../types';
import {
  BulletinDocument,
  BulletinData,
  BulletinSemestreData,
  BulletinAnnuelData,
  UEData,
} from '../../components/BulletinDocument';

type BulletinType = 'semestre' | 'annuel';

export const Bulletins: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const [etudiant, setEtudiant] = useState<Etudiant | null>(null);
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [selectedSemestre, setSelectedSemestre] = useState('');
  const [bulletinType, setBulletinType] = useState<BulletinType>('semestre');
  const [bulletinData, setBulletinData] = useState<BulletinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingBulletin, setLoadingBulletin] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchInitialData(); }, [user]);

  useEffect(() => {
    const state = location.state as { semestreId?: string };
    if (state?.semestreId) setSelectedSemestre(state.semestreId);
  }, [location.state]);

  useEffect(() => {
    if (selectedSemestre && etudiant && bulletinType === 'semestre') {
      buildBulletinSemestre();
    }
  }, [selectedSemestre, etudiant, bulletinType]);

  useEffect(() => {
    if (etudiant && bulletinType === 'annuel') {
      buildBulletinAnnuel();
    }
  }, [etudiant, bulletinType]);

  const fetchInitialData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [etudiantData, semestresData] = await Promise.all([
        etudiantService.getByUserId(user.id),
        semestreService.getAll(),
      ]);
      setEtudiant(etudiantData);
      setSemestres(semestresData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // ── Construire le bulletin semestre ──────────────────────────────────────────
  const buildBulletinSemestre = async () => {
    if (!etudiant || !selectedSemestre) return;
    try {
      setLoadingBulletin(true);
      setError('');
      setBulletinData(null);

      const semestre = semestres.find(s => s.id === selectedSemestre);

      // 1. Essayer l'endpoint agrégé du backend
      try {
        const raw = await bulletinService.getBulletinSemestre(etudiant.id, selectedSemestre);
        if (raw?.ues) {
          const data: BulletinSemestreData = {
            type: 'semestre',
            etudiant: {
              nom: raw.etudiant?.nom ?? etudiant.utilisateur?.nom ?? '',
              prenom: raw.etudiant?.prenom ?? etudiant.prenom,
              matricule: raw.etudiant?.matricule ?? etudiant.matricule,
              dateNaissance: raw.etudiant?.dateNaissance ?? etudiant.date_naissance,
              lieuNaissance: raw.etudiant?.lieuNaissance ?? etudiant.lieu_naissance,
            },
            semestre: {
              code: raw.semestre?.code ?? semestre?.code ?? '',
              libelle: raw.semestre?.libelle ?? semestre?.libelle ?? '',
              anneeUniversitaire: raw.semestre?.anneeUniversitaire ?? semestre?.anneeUniversitaire ?? '',
            },
            ues: raw.ues.map((ue: any): UEData => ({
              code: ue.code,
              libelle: ue.libelle,
              matieres: (ue.matieres || []).map((m: any) => ({
                libelle: m.libelle,
                coefficient: m.coefficient,
                credits: m.credits,
                cc: m.noteCC,
                examen: m.noteExamen,
                rattrapage: m.noteRattrapage,
                moyenne: m.moyenne,
                absences: m.absences,
              })),
              moyenne: ue.moyenne,
              creditsTotal: ue.creditsTotal,
              creditsAcquis: ue.creditsAcquis ?? 0,
              acquise: ue.acquise ?? false,
              compense: ue.compensee ?? false,
            })),
            moyenneSemestre: raw.resultat?.moyenneSemestre,
            creditsTotal: raw.resultat?.creditsTotal ?? 30,
            creditsAcquis: raw.resultat?.creditsAcquis ?? 0,
            valide: raw.resultat?.valide,
            statistiques: raw.statistiques ? {
              moyenneClasse: raw.statistiques.moyenneClasse,
              min: raw.statistiques.noteMin,
              max: raw.statistiques.noteMax,
              ecartType: raw.statistiques.ecartType,
              nbEtudiants: raw.statistiques.nbEtudiants,
            } : undefined,
          };
          setBulletinData(data);
          return;
        }
      } catch { /* fallback */ }

      // 2. Fallback : construire depuis les évaluations brutes
      const semestreDetail = await semestreService.getById(selectedSemestre);
      const evaluations = await evaluationService.getByEtudiant(etudiant.id);

      let resultat = null;
      try {
        resultat = await resultatSemestreService.getByEtudiantAndSemestre(etudiant.id, selectedSemestre);
      } catch { /* pas de résultat calculé */ }

      const ues: UEData[] = (semestreDetail.ues || []).map((ue) => {
        const matieres = (ue.matieres || []).map((matiere) => {
          const evals = evaluations.filter(e => e.matiereId === matiere.id);
          const cc = evals.find(e => e.type === 'CC')?.note;
          const examen = evals.find(e => e.type === 'EXAMEN')?.note;
          const rattrapage = evals.find(e => e.type === 'RATTRAPAGE')?.note;
          const notes = [cc, examen, rattrapage].filter(n => n !== undefined) as number[];
          let moyenne: number | undefined;
          if (notes.length > 0) {
            const sorted = [...notes].sort((a, b) => b - a).slice(0, 2);
            moyenne = sorted.reduce((a, b) => a + b, 0) / sorted.length;
          }
          return { libelle: matiere.libelle, coefficient: matiere.coefficient, credits: matiere.credits, cc, examen, rattrapage, moyenne };
        });

        const matAvecMoy = matieres.filter(m => m.moyenne !== undefined);
        let moyenneUE: number | undefined;
        if (matAvecMoy.length > 0) {
          const somme = matAvecMoy.reduce((acc, m) => acc + m.moyenne! * m.coefficient, 0);
          const coef = matAvecMoy.reduce((acc, m) => acc + m.coefficient, 0);
          moyenneUE = somme / coef;
        }
        const creditsTotal = matieres.reduce((acc, m) => acc + m.credits, 0);
        const acquise = moyenneUE !== undefined && moyenneUE >= 10;

        return { code: ue.code, libelle: ue.libelle, matieres, moyenne: moyenneUE, creditsTotal, creditsAcquis: acquise ? creditsTotal : 0, acquise };
      });

      const data: BulletinSemestreData = {
        type: 'semestre',
        etudiant: {
          nom: etudiant.utilisateur?.nom ?? '',
          prenom: etudiant.prenom,
          matricule: etudiant.matricule,
          dateNaissance: etudiant.date_naissance,
          lieuNaissance: etudiant.lieu_naissance,
        },
        semestre: {
          code: semestreDetail.code,
          libelle: semestreDetail.libelle,
          anneeUniversitaire: semestreDetail.anneeUniversitaire,
        },
        ues,
        moyenneSemestre: resultat?.moyenneSemestre,
        creditsTotal: resultat?.creditsTotal ?? 30,
        creditsAcquis: resultat?.creditsAcquis ?? 0,
        valide: resultat?.valide,
      };
      setBulletinData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement du bulletin');
    } finally {
      setLoadingBulletin(false);
    }
  };

  // ── Construire le bulletin annuel ─────────────────────────────────────────────
  const buildBulletinAnnuel = async () => {
    if (!etudiant) return;
    try {
      setLoadingBulletin(true);
      setError('');
      setBulletinData(null);

      // 1. Essayer l'endpoint agrégé
      try {
        const raw = await bulletinService.getBulletinAnnuel(etudiant.id);
        if (raw) {
          const data: BulletinAnnuelData = {
            type: 'annuel',
            etudiant: {
              nom: raw.etudiant?.nom ?? etudiant.utilisateur?.nom ?? '',
              prenom: raw.etudiant?.prenom ?? etudiant.prenom,
              matricule: raw.etudiant?.matricule ?? etudiant.matricule,
              dateNaissance: raw.etudiant?.dateNaissance ?? etudiant.date_naissance,
              lieuNaissance: raw.etudiant?.lieuNaissance ?? etudiant.lieu_naissance,
              bacType: etudiant.bac_type,
              anneeBac: etudiant.annee_bac,
              provenance: etudiant.provenance,
            },
            anneeUniversitaire: raw.anneeUniversitaire ?? '',
            semestre5: raw.semestre5,
            semestre6: raw.semestre6,
            moyenneAnnuelle: raw.moyenneAnnuelle,
            creditsTotal: raw.creditsTotal ?? 60,
            creditsAcquis: raw.creditsAcquis ?? 0,
            decisionJury: raw.decisionJury,
            mention: raw.mention,
            statistiques: raw.statistiques,
          };
          setBulletinData(data);
          return;
        }
      } catch { /* fallback */ }

      // 2. Fallback : résultats annuels
      const annuels = await resultatAnnuelService.getByEtudiant(etudiant.id);
      if (annuels.length > 0) {
        const r = annuels[0];
        const data: BulletinAnnuelData = {
          type: 'annuel',
          etudiant: {
            nom: etudiant.utilisateur?.nom ?? '',
            prenom: etudiant.prenom,
            matricule: etudiant.matricule,
            dateNaissance: etudiant.date_naissance,
            lieuNaissance: etudiant.lieu_naissance,
            bacType: etudiant.bac_type,
            anneeBac: etudiant.annee_bac,
            provenance: etudiant.provenance,
          },
          anneeUniversitaire: r.anneeUniversitaire ?? '',
          semestre5: r.resultatS5 ? {
            libelle: r.resultatS5.semestre?.libelle ?? 'Semestre 5',
            moyenne: r.resultatS5.moyenneSemestre,
            creditsAcquis: r.resultatS5.creditsAcquis ?? 0,
            creditsTotal: r.resultatS5.creditsTotal ?? 30,
            valide: r.resultatS5.valide ?? false,
          } : undefined,
          semestre6: r.resultatS6 ? {
            libelle: r.resultatS6.semestre?.libelle ?? 'Semestre 6',
            moyenne: r.resultatS6.moyenneSemestre,
            creditsAcquis: r.resultatS6.creditsAcquis ?? 0,
            creditsTotal: r.resultatS6.creditsTotal ?? 30,
            valide: r.resultatS6.valide ?? false,
          } : undefined,
          moyenneAnnuelle: r.moyenneAnnuelle,
          creditsTotal: r.creditsTotal ?? 60,
          creditsAcquis: r.creditsAcquis ?? 0,
          decisionJury: r.decisionJury,
          mention: r.mention,
        };
        setBulletinData(data);
      }
    } catch {
      setBulletinData(null);
    } finally {
      setLoadingBulletin(false);
    }
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <EtudiantLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </EtudiantLayout>
    );
  }

  return (
    <EtudiantLayout>
      <div className="max-w-5xl mx-auto">

        {/* Contrôles — masqués à l'impression */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 print:hidden">
          <div className="flex flex-wrap items-end gap-4">
            {/* Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Type de bulletin
              </label>
              <div className="flex gap-2">
                {(['semestre', 'annuel'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setBulletinType(t); setBulletinData(null); }}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-all text-sm ${
                      bulletinType === t
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-indigo-400'
                    }`}
                  >
                    {t === 'semestre' ? 'Semestre' : 'Annuel'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sélection semestre */}
            {bulletinType === 'semestre' && (
              <div className="flex-1 min-w-48">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Semestre
                </label>
                <select
                  value={selectedSemestre}
                  onChange={(e) => setSelectedSemestre(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm"
                >
                  <option value="">Choisir un semestre</option>
                  {semestres.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.libelle} — {s.anneeUniversitaire}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Boutons d'action */}
            {bulletinData && (
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg print:hidden">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Chargement */}
        {loadingBulletin && (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        )}

        {/* Bulletin */}
        {!loadingBulletin && bulletinData && (
          <BulletinDocument data={bulletinData} />
        )}

        {/* État vide */}
        {!loadingBulletin && !bulletinData && !error && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center print:hidden">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Printer className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-gray-600 font-medium">
              {bulletinType === 'semestre'
                ? 'Sélectionnez un semestre pour afficher le bulletin'
                : 'Chargement du bulletin annuel...'}
            </p>
          </div>
        )}
      </div>
    </EtudiantLayout>
  );
};
