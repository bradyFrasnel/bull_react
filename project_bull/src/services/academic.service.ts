import { api } from './api';
import {
  Semestre,
  UniteEnseignement,
  Matiere,
  Etudiant,
  Enseignant,
  CreateSemestreForm,
  CreateUEForm,
  CreateMatiereForm,
  CreateEtudiantForm,
  CreateEnseignantForm,
} from '../types';

// ============ SEMESTRES ============
export const semestreService = {
  async getAll(): Promise<Semestre[]> {
    const response = await api.get('/semestres');
    return response.data;
  },

  async getById(id: string): Promise<Semestre> {
    const response = await api.get(`/semestres/${id}`);
    return response.data;
  },

  async getByAnnee(annee: string): Promise<Semestre[]> {
    const response = await api.get(`/semestres/annee/${annee}`);
    return response.data;
  },

  async create(data: CreateSemestreForm): Promise<Semestre> {
    const response = await api.post('/semestres', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateSemestreForm>): Promise<Semestre> {
    const response = await api.put(`/semestres/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/semestres/${id}`);
  },
};

// ============ UNITÉS D'ENSEIGNEMENT ============
export const ueService = {
  async getAll(): Promise<UniteEnseignement[]> {
    const response = await api.get('/unites-enseignement');
    return response.data;
  },

  async getById(id: string): Promise<UniteEnseignement> {
    const response = await api.get(`/unites-enseignement/${id}`);
    return response.data;
  },

  async getBySemestre(semestreId: string): Promise<UniteEnseignement[]> {
    const response = await api.get(`/unites-enseignement/semestre/${semestreId}`);
    return response.data;
  },

  async create(data: CreateUEForm): Promise<UniteEnseignement> {
    const response = await api.post('/unites-enseignement', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateUEForm>): Promise<UniteEnseignement> {
    const response = await api.put(`/unites-enseignement/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/unites-enseignement/${id}`);
  },
};

// ============ MATIÈRES ============
export const matiereService = {
  async getAll(): Promise<Matiere[]> {
    const response = await api.get('/matieres');
    return response.data;
  },

  async getById(id: string): Promise<Matiere> {
    const response = await api.get(`/matieres/${id}`);
    return response.data;
  },

  async getByUE(ueId: string): Promise<Matiere[]> {
    const response = await api.get(`/matieres/ue/${ueId}`);
    return response.data;
  },

  async create(data: CreateMatiereForm): Promise<Matiere> {
    const response = await api.post('/matieres', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateMatiereForm>): Promise<Matiere> {
    const response = await api.put(`/matieres/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/matieres/${id}`);
  },
};

// ============ ÉTUDIANTS ============
export const etudiantService = {
  async getAll(): Promise<Etudiant[]> {
    const response = await api.get('/etudiants');
    return response.data;
  },

  async getById(id: string): Promise<Etudiant> {
    const response = await api.get(`/etudiants/${id}`);
    return response.data;
  },

  async getByMatricule(matricule: string): Promise<Etudiant> {
    const response = await api.get(`/etudiants/matricule/${matricule}`);
    return response.data;
  },

  async getByUserId(userId: string): Promise<Etudiant> {
    const response = await api.get(`/etudiants/user/${userId}`);
    return response.data;
  },

  async create(data: CreateEtudiantForm): Promise<Etudiant> {
    const response = await api.post('/etudiants', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateEtudiantForm>): Promise<Etudiant> {
    const response = await api.put(`/etudiants/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/etudiants/${id}`);
  },
};

// ============ ENSEIGNANTS ============
export const enseignantService = {
  async getAll(): Promise<Enseignant[]> {
    const response = await api.get('/enseignants');
    return response.data;
  },

  async getById(id: string): Promise<Enseignant> {
    const response = await api.get(`/enseignants/${id}`);
    return response.data;
  },

  async getByUserId(userId: string): Promise<Enseignant> {
    const response = await api.get(`/enseignants/user/${userId}`);
    return response.data;
  },

  async create(data: CreateEnseignantForm): Promise<Enseignant> {
    const response = await api.post('/enseignants', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateEnseignantForm>): Promise<Enseignant> {
    const response = await api.put(`/enseignants/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/enseignants/${id}`);
  },

  // Gestion des matières assignées
  async assignMatiere(enseignantId: string, matiereId: string): Promise<void> {
    await api.post(`/enseignants/${enseignantId}/matieres/${matiereId}`);
  },

  async removeMatiere(enseignantId: string, matiereId: string): Promise<void> {
    await api.delete(`/enseignants/${enseignantId}/matieres/${matiereId}`);
  },

  async getMatieres(enseignantId: string): Promise<Matiere[]> {
    const response = await api.get(`/enseignants/${enseignantId}/matieres`);
    return response.data;
  },

  async getEnseignantsByMatiere(matiereId: string): Promise<Enseignant[]> {
    const response = await api.get(`/enseignants/matieres/${matiereId}/enseignants`);
    return response.data;
  },
};
