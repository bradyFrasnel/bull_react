import React from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import {
  Save, AlertCircle, Loader2, BookOpen, CheckCircle, RefreshCw,
} from 'lucide-react';
import { useSaisirNotes } from './saisir-notes/useSaisirNotes';
import { NotesTable } from './saisir-notes/NotesTable';

export const SaisirNotes: React.FC = () => {
  const {
    matieres, selectedMatiere, setSelectedMatiere,
    rows, loading, loadingReleve, saving, error, success,
    updateRow, handleSave, matiere, fetchReleve
  } = useSaisirNotes();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relever des notes</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Saisie en masse — toute la classe en une seule opération
            </p>
          </div>
          <div className="flex gap-3">
            {selectedMatiere && (
              <button
                onClick={fetchReleve}
                disabled={loadingReleve}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loadingReleve ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !selectedMatiere || rows.length === 0}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all text-sm font-medium"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer tout
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {/* Sélection matière */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <BookOpen className="w-4 h-4 inline mr-1" />
            Matière
          </label>
          <select
            value={selectedMatiere}
            onChange={e => setSelectedMatiere(e.target.value)}
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Sélectionner une matière</option>
            {matieres.map(m => (
              <option key={m.id} value={m.id}>
                {m.libelle} / Coef. {m.coefficient} / crédits. {m.credits}
              </option>
            ))}
          </select>
          {matiere && (
            <p className="text-xs text-gray-500 mt-2">
              {rows.length} étudiant(s) dans le relevé
            </p>
          )}
        </div>

        <NotesTable 
          rows={rows}
          loadingReleve={loadingReleve}
          selectedMatiere={selectedMatiere}
          saving={saving}
          updateRow={updateRow}
          handleSave={handleSave}
        />
      </div>
    </AdminLayout>
  );
};

