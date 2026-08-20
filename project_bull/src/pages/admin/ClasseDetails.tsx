import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../services/api';
import { Loader2, ArrowLeft, Users, BookOpen, Edit, CalendarX, FileText } from 'lucide-react';

// Imports des composants onglets (à créer par la suite)
import { TabEtudiants } from './classe-tabs/TabEtudiants';
import { TabAcademique } from './classe-tabs/TabAcademique';
import { TabSaisieNotes } from './classe-tabs/TabSaisieNotes';
import { TabAbsences } from './classe-tabs/TabAbsences';
import { TabBulletins } from './classe-tabs/TabBulletins';

export const ClasseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classe, setClasse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('etudiants');

  useEffect(() => {
    const fetchClasseInfo = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/classes/${id}`);
        setClasse(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement de la classe:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchClasseInfo();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  if (!classe) {
    return (
      <AdminLayout>
        <div className="text-center mt-20">
          <h2 className="text-2xl font-bold text-gray-800">Classe introuvable</h2>
          <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 hover:underline">
            Retour
          </button>
        </div>
      </AdminLayout>
    );
  }

  const tabs = [
    { id: 'etudiants', label: 'Étudiants', icon: Users },
    { id: 'programme', label: 'Programme & Matières', icon: BookOpen },
    { id: 'notes', label: 'Relever des notes', icon: Edit },
    { id: 'absences', label: 'Absences', icon: CalendarX },
    { id: 'bulletins', label: 'Résultats & Bulletins', icon: FileText },
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header de la Classe */}
        <div className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-sm">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
            title="Retour"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{classe.nom}</h1>
            <p className="text-gray-500 font-mono text-sm mt-1">Code: {classe.code} • Année: {classe.anneeUniversitaire}</p>
          </div>
        </div>

        {/* Navigation par Onglets */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="flex overflow-x-auto border-b border-gray-200 hide-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${isActive
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Contenu de l'onglet actif */}
          <div className="p-6">
            {activeTab === 'etudiants' && <TabEtudiants classeId={id!} classe={classe} />}
            {activeTab === 'programme' && <TabAcademique classeId={id!} classe={classe} />}
            {activeTab === 'notes' && <TabSaisieNotes classeId={id!} classe={classe} />}
            {activeTab === 'absences' && <TabAbsences classeId={id!} classe={classe} />}
            {activeTab === 'bulletins' && <TabBulletins classeId={id!} classe={classe} />}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
