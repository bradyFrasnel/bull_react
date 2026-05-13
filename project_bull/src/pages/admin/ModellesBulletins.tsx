import React, { useEffect, useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { semestreService } from "../../services";
import { BulletinDocument, BulletinSemestreData, UEData } from "../../components/BulletinDocument";
import { Semestre } from "../../types";
import { Loader2, AlertCircle, Printer, Eye } from "lucide-react";

export const ModellesBulletins: React.FC = () => {
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [selectedSemestreId, setSelectedSemestreId] = useState("");
  const [modele, setModele] = useState<BulletinSemestreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingModele, setLoadingModele] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchSemestres(); }, []);
  useEffect(() => { if (selectedSemestreId) buildModele(); }, [selectedSemestreId]);

  const fetchSemestres = async () => {
    try {
      setLoading(true);
      const data = await semestreService.getAll();
      setSemestres(data);
      if (data.length > 0) setSelectedSemestreId(data[0].id);
    } catch { setError("Erreur lors du chargement des semestres"); }
    finally { setLoading(false); }
  };

  const buildModele = async () => {
    const semestre = semestres.find(s => s.id === selectedSemestreId);
    if (!semestre) return;
    try {
      setLoadingModele(true);
      setError("");
      const detail = await semestreService.getById(selectedSemestreId);
      const ues: UEData[] = (detail.ues || []).map(ue => ({
        code: ue.code,
        libelle: ue.libelle,
        matieres: (ue.matieres || []).map(m => ({
          libelle: m.libelle,
          coefficient: m.coefficient,
          credits: m.credits,
          cc: undefined,
          examen: undefined,
          rattrapage: undefined,
          moyenne: undefined,
          absences: undefined,
        })),
        moyenne: undefined,
        creditsTotal: (ue.matieres || []).reduce((acc, m) => acc + m.credits, 0),
        creditsAcquis: 0,
        acquise: false,
      }));
      const data: BulletinSemestreData = {
        type: "semestre",
        etudiant: {
          nom: "NOM",
          prenom: "Prénom",
          matricule: "MATRICULE",
          dateNaissance: undefined,
          lieuNaissance: undefined,
        },
        semestre: {
          code: semestre.code,
          libelle: semestre.libelle,
          anneeUniversitaire: semestre.anneeUniversitaire,
        },
        ues,
        moyenneSemestre: undefined,
        creditsTotal: ues.reduce((acc, u) => acc + u.creditsTotal, 0),
        creditsAcquis: 0,
        valide: undefined,
      };
      setModele(data);
    } catch { setError("Erreur lors de la génération du modèle"); }
    finally { setLoadingModele(false); }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 print:hidden">
          <h1 className="text-2xl font-bold text-gray-900">Modèle de Bulletin</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Structure du bulletin générée depuis le référentiel académique — champs vides, sans données étudiant.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg print:hidden">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Sélecteur + actions */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-6 print:hidden">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Semestre
              </label>
              {loading ? (
                <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-500">Chargement...</span>
                </div>
              ) : (
                <select
                  value={selectedSemestreId}
                  onChange={e => setSelectedSemestreId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                >
                  <option value="">Choisir un semestre</option>
                  {semestres.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.libelle} — {s.anneeUniversitaire}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {modele && (
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer le modèle
                </button>
              </div>
            )}
          </div>

          {/* Info */}
          {modele && (
            <div className="mt-4 flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Eye className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              
            </div>
          )}
        </div>

        {/* Modèle rendu */}
        {loadingModele ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : modele ? (
          <BulletinDocument data={modele} />
        ) : !loading && semestres.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">Aucun semestre configuré</p>
            <p className="text-gray-500 text-sm mt-2">
              Créez d'abord des semestres, UE et matières dans <strong>Référentiel & Calculs</strong>.
            </p>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
};
