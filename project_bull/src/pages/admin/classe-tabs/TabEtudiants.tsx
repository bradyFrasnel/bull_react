import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Loader2, Users } from 'lucide-react';

interface TabEtudiantsProps {
  classeId: string;
}

export const TabEtudiants: React.FC<TabEtudiantsProps> = ({ classeId }) => {
  const [etudiants, setEtudiants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEtudiants = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/classes/${classeId}/etudiants`);
        setEtudiants(res.data || []);
      } catch (err) {
        console.error("Erreur chargement étudiants:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEtudiants();
  }, [classeId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (etudiants.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Aucun étudiant</h3>
        <p className="text-gray-500">Il n'y a pas encore d'étudiants inscrits dans cette classe.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Liste des étudiants inscrits ({etudiants.length})</h2>
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">Matricule</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">Nom & Prénom</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {etudiants.map(etudiant => (
              <tr key={etudiant.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-mono text-gray-600">{etudiant.matricule}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {etudiant.utilisateur?.nom} {etudiant.prenom}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{etudiant.utilisateur?.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
