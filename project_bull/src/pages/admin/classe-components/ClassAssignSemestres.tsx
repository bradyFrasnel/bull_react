import React from 'react';
import { Loader2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Classe, Semestre } from './useClasses';

interface ClassAssignSemestresProps {
  selectedClasse: Classe | null;
  semestres: Semestre[];
  assigning: boolean;
  isAssigned: (semestreId: string) => boolean;
  handleToggleSemestre: (semestreId: string) => void;
  setShowAssignModal: (show: boolean) => void;
}

export const ClassAssignSemestres: React.FC<ClassAssignSemestresProps> = ({
  selectedClasse,
  semestres,
  assigning,
  isAssigned,
  handleToggleSemestre,
  setShowAssignModal,
}) => {
  if (!selectedClasse) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Assigner des Semestres</h2>
            <p className="text-gray-600 mt-1">
              Classe : <span className="font-semibold text-gray-900">{selectedClasse.nom}</span>
            </p>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <LinkIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 items-start mb-6 text-sm text-blue-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-blue-600 mt-0.5" />
          <p>
            Sélectionnez les semestres qui seront enseignés dans cette classe.
            Ils apparaîtront dans la configuration académique de la classe.
          </p>
        </div>

        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
          {semestres.map(semestre => {
            const assigned = isAssigned(semestre.id);
            return (
              <div 
                key={semestre.id} 
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  assigned 
                    ? 'border-emerald-200 bg-emerald-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <h3 className="font-medium text-gray-900">{semestre.libelle}</h3>
                  <p className="text-sm text-gray-500 font-mono mt-0.5">{semestre.code}</p>
                </div>
                
                <button
                  onClick={() => handleToggleSemestre(semestre.id)}
                  disabled={assigning}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 ${
                    assigned
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {assigning && <Loader2 className="w-3 h-3 animate-spin" />}
                  {assigned ? 'Assigné' : 'Assigner'}
                </button>
              </div>
            );
          })}
          
          {semestres.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun semestre disponible dans la base de données.
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6 mt-6 border-t border-gray-100">
          <button
            onClick={() => setShowAssignModal(false)}
            className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
