import React from 'react';
import { Loader2, Users, X } from 'lucide-react';
import { Classe } from './useClasses';

interface ClassViewEtudiantsProps {
  viewingClasse: Classe | null;
  etudiantsClasse: any[];
  loadingEtudiants: boolean;
  setViewingClasse: (classe: Classe | null) => void;
}

export const ClassViewEtudiants: React.FC<ClassViewEtudiantsProps> = ({
  viewingClasse,
  etudiantsClasse,
  loadingEtudiants,
  setViewingClasse,
}) => {
  if (!viewingClasse) return null;

  return (
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
  );
};
