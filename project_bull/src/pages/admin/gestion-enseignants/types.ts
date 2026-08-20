import { Matiere } from '../../../types';

export interface Teacher {
  id: string;
  utilisateurId: string;
  prenom: string;
  matricule: string;
  specialite?: string;
  utilisateur?: { email: string; nom: string };
}

export interface TeacherForm {
  nom: string;
  prenom: string;
  email: string;
  matricule: string;
  specialite: string;
  password: string;
}

export const EMPTY_FORM: TeacherForm = {
  nom: '', prenom: '', email: '', matricule: '', specialite: '', password: '',
};
