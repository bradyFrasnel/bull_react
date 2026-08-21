import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Eye, Link as LinkIcon, Edit2, Trash2 } from 'lucide-react';
import { Classe } from './useClasses';

interface ClassListProps {
  classes: Classe[];
  searchTerm: string;
  filiereId?: string | null;
  handleOpenAssign: (classe: Classe) => void;
  handleOpenEdit: (classe: Classe) => void;
  handleDelete: (id: string, nom: string) => void;
}

export const ClassList: React.FC<ClassListProps> = ({
  classes,
  searchTerm,
  filiereId,
  handleOpenAssign,
  handleOpenEdit,
  handleDelete,
}) => {
  const navigate = useNavigate();

  const filteredClasses = classes.filter(c => 
    (!filiereId || (c as any).filiere?.id === filiereId || (c as any).filiereId === filiereId) && 
    `${c.nom} ${c.code}`.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.nom.localeCompare(b.nom));

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nom</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Code</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Filière</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Année Univ.</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Étudiants</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Semestres</th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {filteredClasses.map((classe) => (
            <tr key={classe.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium">
                <button
                  onClick={() => navigate(`/admin/classes/${classe.id}`)}
                  className="text-left font-bold text-gray-900 hover:text-indigo-600 transition-colors"
                  title="Ouvrir la gestion de la classe (Étudiants, Notes, Bulletins)"
                >
                  {classe.nom}
                </button>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-mono font-medium">
                  {classe.code}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {(classe as any).filiere?.code || '-'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{classe.anneeUniversitaire}</td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => navigate(`/admin/classes/${classe.id}`)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full transition-colors cursor-pointer"
                  title="Voir la liste des étudiants et réaliser les actions"
                >
                  <Users className="w-4 h-4 text-indigo-500" />
                  {classe._count?.etudiants ?? 0}
                  {classe.capaciteMax && (
                    <span className="text-gray-400 text-xs">/ {classe.capaciteMax}</span>
                  )}
                </button>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  {classe._count?.semestres ?? 0}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end items-center gap-2">
                  <button
                    onClick={() => navigate(`/admin/classes/${classe.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Accéder
                  </button>
                  <button
                    onClick={() => handleOpenAssign(classe)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Semestres
                  </button>
                  <button
                    onClick={() => handleOpenEdit(classe)}
                    title="Modifier"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Supprimer la classe "${classe.nom}" ? Les étudiants seront détachés de cette classe.`)) {
                        handleDelete(classe.id, classe.nom);
                      }
                    }}
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
  );
};
