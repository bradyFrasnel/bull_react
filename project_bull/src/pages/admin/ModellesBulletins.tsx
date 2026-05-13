import React, { useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { X, ZoomIn, Download, FileText } from "lucide-react";
import exS5 from "../../../assets/images/Ex_BulletinS5.png";
import exS6 from "../../../assets/images/Ex_BulletinS6.png";
import exAnnuel from "../../../assets/images/Ex_BullAnnuel.png";

interface Modele {
  id: string;
  titre: string;
  description: string;
  image: string;
  badge: string;
  badgeColor: string;
}

const MODELES: Modele[] = [
  {
    id: "s5",
    titre: "Bulletin Semestre 5",
    description: "Modèle officiel du bulletin de notes du Semestre 5 — LP ASUR. Inclut les UE, matières, coefficients, crédits, absences, statistiques et signatures.",
    image: exS5,
    badge: "S5",
    badgeColor: "bg-blue-600",
  },
  {
    id: "s6",
    titre: "Bulletin Semestre 6",
    description: "Modèle officiel du bulletin de notes du Semestre 6 — LP ASUR. Même structure que le S5 avec les matières spécifiques au second semestre.",
    image: exS6,
    badge: "S6",
    badgeColor: "bg-indigo-600",
  },
  {
    id: "annuel",
    titre: "Bulletin Annuel",
    description: "Modèle officiel du bulletin annuel — LP ASUR. Récapitulatif des deux semestres avec décision du jury, mention et statistiques de promotion.",
    image: exAnnuel,
    badge: "Annuel",
    badgeColor: "bg-gray-800",
  },
];

export const ModellesBulletins: React.FC = () => {
  const [selected, setSelected] = useState<Modele | null>(null);

  const handleDownload = (modele: Modele) => {
    const link = document.createElement("a");
    link.href = modele.image;
    link.download = `Modele_${modele.id}_INPTIC_ASUR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Modèles des Bulletins</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Modèles officiels INPTIC — LP ASUR. Cliquez sur un modèle pour l'agrandir.
          </p>
        </div>

        {/* Grille des modèles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MODELES.map((modele) => (
            <div
              key={modele.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Badge */}
              <div className="relative">
                <span className={`absolute top-3 left-3 z-10 px-2 py-1 rounded-full text-white text-xs font-bold ${modele.badgeColor}`}>
                  {modele.badge}
                </span>
                {/* Aperçu image */}
                <div
                  className="relative cursor-pointer group overflow-hidden bg-gray-100"
                  style={{ height: "420px" }}
                  onClick={() => setSelected(modele)}
                >
                  <img
                    src={modele.image}
                    alt={modele.titre}
                    className="w-full h-full object-contain object-top transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Overlay hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-3 shadow-lg">
                      <ZoomIn className="w-6 h-6 text-gray-700" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Infos */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1">{modele.titre}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                  {modele.description}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelected(modele)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs font-medium"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    Agrandir
                  </button>
                  <button
                    onClick={() => handleDownload(modele)}
                    className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
                    title="Télécharger le modèle"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Note informative */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-4">
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 text-sm">À propos des modèles</h3>
            <p className="text-blue-700 text-xs mt-1 leading-relaxed">
              Ces modèles sont les références officielles pour la génération des bulletins de la LP ASUR — INPTIC.
              Les bulletins générés dans la section <strong>Bulletins de Notes</strong> respectent fidèlement ces modèles :
              en-tête institutionnel, tableau des notes par UE, statistiques de promotion, et signatures.
            </p>
          </div>
        </div>
      </div>

      {/* Modal plein écran */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header modal */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-white text-xs font-bold ${selected.badgeColor}`}>
                  {selected.badge}
                </span>
                <h2 className="font-bold text-gray-900">{selected.titre}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(selected)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  Télécharger
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Image plein écran */}
            <div className="overflow-auto" style={{ maxHeight: "calc(95vh - 60px)" }}>
              <img
                src={selected.image}
                alt={selected.titre}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
