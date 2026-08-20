import React from 'react';
import { BookOpen, Layers, AlertCircle } from 'lucide-react';

interface TabAcademiqueProps {
  classeId: string;
  classe: any; // On passe l'objet classe qui contient les semestres, UEs, matières
}

export const TabAcademique: React.FC<TabAcademiqueProps> = ({ classe }) => {
  const semestresAssocies = classe?.semestres || [];

  if (semestresAssocies.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Aucun programme académique</h3>
        <p className="text-gray-500">Aucun semestre n'a encore été assigné à cette classe.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">Programme Académique</h2>
        <p className="text-gray-600">Semestres, Unités d'Enseignement et Matières enseignés dans cette classe.</p>
      </div>

      {semestresAssocies.map((sa: any) => {
        const semestre = sa.semestre;
        const totalSemestreCredits = semestre.ues?.reduce((sumUe: number, ue: any) => {
          const ueCredits = ue.matieres && ue.matieres.length > 0
            ? ue.matieres.reduce((sumMat: number, m: any) => sumMat + (m.credits || 0), 0)
            : (ue.credits || 0);
          return sumUe + ueCredits;
        }, 0) || 0;

        return (
          <div key={semestre.id} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gray-100 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 text-white px-3 py-1 rounded-md font-bold text-sm">
                  {semestre.code}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{semestre.libelle}</h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${totalSemestreCredits === 30 ? 'bg-green-100 text-green-800' : totalSemestreCredits > 30 ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-amber-100 text-amber-800'}`}>
                  {totalSemestreCredits} / 30 Crédits
                </span>
              </div>
              <span className="text-sm font-medium text-gray-500">{semestre.anneeUniversitaire}</span>
            </div>

            {totalSemestreCredits > 30 && (
              <div className="bg-amber-50 border-b border-amber-200 p-3 px-6 flex items-center gap-2 text-amber-800 text-sm font-bold">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
                <span>AVERTISSEMENT : Crédit du semestre &gt; 30 ({totalSemestreCredits} / 30 crédits). L'ajout ou l'attribution de nouvelles matières est bloqué tant que le total dépasse 30.</span>
              </div>
            )}

            <div className="p-6 space-y-6">
              {semestre.ues && semestre.ues.length > 0 ? (
                semestre.ues.map((ue: any) => (
                  <div key={ue.id} className="border border-indigo-100 bg-white rounded-lg p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Layers className="w-5 h-5 text-indigo-500" />
                      <h4 className="font-bold text-gray-800 text-lg">
                        {ue.code} - {ue.libelle}
                      </h4>
                      <span className="ml-auto text-sm font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                        Crédits: {ue.matieres && ue.matieres.length > 0
                          ? ue.matieres.reduce((sum: number, m: any) => sum + (m.credits || 0), 0)
                          : (ue.credits || 0)}
                      </span>
                    </div>

                    {ue.matieres && ue.matieres.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead>
                            <tr className="bg-gray-50 text-gray-600 border-b">
                              <th className="py-2 px-4 font-semibold">Code</th>
                              <th className="py-2 px-4 font-semibold">Matière</th>
                              <th className="py-2 px-4 font-semibold text-center">Crédits</th>
                              <th className="py-2 px-4 font-semibold text-center">Coef.</th>
                              <th className="py-2 px-4 font-semibold text-center">V.H.</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {ue.matieres.map((matiere: any) => (
                              <tr key={matiere.id} className="hover:bg-gray-50">
                                <td className="py-3 px-4 font-mono text-gray-500">{matiere.code}</td>
                                <td className="py-3 px-4 font-medium text-gray-900">{matiere.libelle}</td>
                                <td className="py-3 px-4 text-center">{matiere.credits}</td>
                                <td className="py-3 px-4 text-center">{matiere.coefficient}</td>
                                <td className="py-3 px-4 text-center text-gray-500">{matiere.volumeHoraire}h</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Aucune matière dans cette UE.</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">Aucune UE configurée pour ce semestre.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
