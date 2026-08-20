import React from 'react';
import {
  Plus, AlertCircle, Loader2, Search, CheckCircle, X
} from 'lucide-react';
import { useClasses } from './classe-components/useClasses';
import { ClassList } from './classe-components/ClassList';
import { ClassForm } from './classe-components/ClassForm';
import { ClassAssignSemestres } from './classe-components/ClassAssignSemestres';
import { ClassViewEtudiants } from './classe-components/ClassViewEtudiants';
import { useNavigate } from 'react-router-dom';

export const ClassesContent: React.FC<{ filiereId?: string | null, onClearFilter?: () => void }> = ({ filiereId, onClearFilter }) => {
  const {
    classes, semestres, filieres, loading, error, success, submitting,
    showModal, editingClasse, formData,
    showAssignModal, selectedClasse, assigning, searchTerm,
    viewingClasse, etudiantsClasse, loadingEtudiants,
    setSearchTerm, setShowAssignModal, setViewingClasse, setFormData, setError, setSuccess,
    handleOpenCreate, handleOpenEdit, handleCloseModal, handleSubmit, handleDelete,
    handleOpenEtudiants, handleOpenAssign, isAssigned, handleToggleSemestre
  } = useClasses();

  const navigate = useNavigate();

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Classes</h1>
            {filiereId && onClearFilter && (
              <button onClick={onClearFilter} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 flex items-center gap-1">
                Filtre actif <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <p className="text-gray-600 mt-1">Gérez les promotions et leurs semestres</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Nouvelle classe
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-6 flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom de classe ou code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <ClassList
        classes={classes}
        filiereId={filiereId}
        searchTerm={searchTerm}
        loading={loading}
        onSearch={setSearchTerm}
        onClearFilter={onClearFilter}
        onOpenEdit={handleOpenEdit}
        onOpenAssign={handleOpenAssign}
        onOpenEtudiants={handleOpenEtudiants}
        onDelete={handleDelete}
      />

      {showModal && (
        <ClassForm
          formData={formData}
          filieres={filieres}
          submitting={submitting}
          editingClasse={!!editingClasse}
          onChange={setFormData}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
        />
      )}

      {showAssignModal && selectedClasse && (
        <ClassAssignSemestres 
          selectedClasse={selectedClasse}
          semestres={semestres}
          assigning={assigning}
          isAssigned={isAssigned}
          handleToggleSemestre={handleToggleSemestre}
          setShowAssignModal={setShowAssignModal}
        />
      )}

      {viewingClasse && (
        <ClassViewEtudiants 
          viewingClasse={viewingClasse}
          etudiantsClasse={etudiantsClasse}
          loadingEtudiants={loadingEtudiants}
          setViewingClasse={setViewingClasse}
        />
      )}
    </div>
  );
};
