import React from 'react';
import { Loader2 } from 'lucide-react';
import { Classe, ClasseForm as IClasseForm, Filiere } from './useClasses';

interface ClassFormProps {
  editingClasse: Classe | null;
  formData: IClasseForm;
  setFormData: (data: IClasseForm) => void;
  filieres: Filiere[];
  error: string;
  submitting: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  handleCloseModal: () => void;
}

export const ClassForm: React.FC<ClassFormProps> = ({
  editingClasse,
  formData,
  setFormData,
  filieres,
  error,
  submitting,
  handleSubmit,
  handleCloseModal,
}) => {
  return (
    <form autoComplete="off" onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nom de la classe *
        </label>
        <input
          type="text"
          required
          placeholder="Ex: L1 Génie Logiciel"
          value={formData.nom}
          onChange={e => setFormData({ ...formData, nom: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Code *
        </label>
        <input
          type="text"
          required
          placeholder="Ex: L1-GL"
          value={formData.code}
          onChange={e => setFormData({ ...formData, code: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all uppercase"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Filière
        </label>
        <select
          value={formData.filiereId}
          onChange={e => setFormData({ ...formData, filiereId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
        >
          <option value="">Sélectionner une filière (Optionnel)</option>
          {filieres.map(f => (
            <option key={f.id} value={f.id}>{f.nom}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Année Universitaire *
          </label>
          <input
            type="text"
            required
            placeholder="Ex: 2025-2026"
            value={formData.anneeUniversitaire}
            onChange={e => setFormData({ ...formData, anneeUniversitaire: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Capacité max
          </label>
          <input
            type="number"
            min="1"
            placeholder="Optionnel"
            value={formData.capaciteMax}
            onChange={e => setFormData({ ...formData, capaciteMax: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t mt-6">
        <button
          type="button"
          onClick={handleCloseModal}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {editingClasse ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
};
