import { api } from './api';
import {
  BulletinSemestre,
  BulletinAnnuel,
  BulletinExportOptions,
  RecapitulatifPromotion,
  ReleveNotes,
} from '../types';

// ============ BULLETINS ============
export const bulletinService = {
  // Générer un bulletin de semestre
  async genererBulletinSemestre(
    etudiantId: string,
    semestreId: string
  ): Promise<BulletinSemestre> {
    const response = await api.get(
      `/bulletins/etudiant/${etudiantId}/semestre/${semestreId}`
    );
    return response.data;
  },

  // Générer un bulletin annuel
  async genererBulletinAnnuel(
    etudiantId: string,
    anneeUniversitaire: string
  ): Promise<BulletinAnnuel> {
    const response = await api.get(
      `/bulletins/etudiant/${etudiantId}/annuel/${anneeUniversitaire}`
    );
    return response.data;
  },

  // Exporter un bulletin en PDF
  async exporterPDF(
    etudiantId: string,
    semestreId: string,
    options?: BulletinExportOptions
  ): Promise<Blob> {
    const response = await api.post(
      `/bulletins/etudiant/${etudiantId}/semestre/${semestreId}/pdf`,
      options || {},
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Exporter un bulletin annuel en PDF
  async exporterPDFAnnuel(
    etudiantId: string,
    anneeUniversitaire: string,
    options?: BulletinExportOptions
  ): Promise<Blob> {
    const response = await api.post(
      `/bulletins/etudiant/${etudiantId}/annuel/${anneeUniversitaire}/pdf`,
      options || {},
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Télécharger un bulletin PDF
  downloadPDF(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Générer un relevé de notes
  async genererReleveNotes(
    etudiantId: string,
    semestreId: string
  ): Promise<ReleveNotes> {
    const response = await api.get(
      `/bulletins/etudiant/${etudiantId}/semestre/${semestreId}/releve`
    );
    return response.data;
  },

  // Exporter un relevé de notes en Excel
  async exporterReleveExcel(
    etudiantId: string,
    semestreId: string
  ): Promise<Blob> {
    const response = await api.get(
      `/bulletins/etudiant/${etudiantId}/semestre/${semestreId}/releve/excel`,
      { responseType: 'blob' }
    );
    return response.data;
  },
};

// ============ RÉCAPITULATIFS ============
export const recapitulatifService = {
  // Générer un récapitulatif de promotion
  async genererRecapitulatif(
    anneeUniversitaire: string
  ): Promise<RecapitulatifPromotion> {
    const response = await api.get(`/recapitulatifs/promotion/${anneeUniversitaire}`);
    return response.data;
  },

  // Exporter le récapitulatif en Excel
  async exporterRecapitulatifExcel(anneeUniversitaire: string): Promise<Blob> {
    const response = await api.get(
      `/recapitulatifs/promotion/${anneeUniversitaire}/excel`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Exporter le récapitulatif en PDF
  async exporterRecapitulatifPDF(anneeUniversitaire: string): Promise<Blob> {
    const response = await api.get(
      `/recapitulatifs/promotion/${anneeUniversitaire}/pdf`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Télécharger un fichier
  downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

// ============ IMPORT/EXPORT ============
export const importExportService = {
  // Importer des notes depuis Excel
  async importerNotesExcel(file: File, semestreId: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('semestreId', semestreId);

    const response = await api.post('/import/notes/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Exporter toutes les notes en Excel
  async exporterToutesNotesExcel(semestreId: string): Promise<Blob> {
    const response = await api.get(`/export/notes/semestre/${semestreId}/excel`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Exporter les étudiants en Excel
  async exporterEtudiantsExcel(): Promise<Blob> {
    const response = await api.get('/export/etudiants/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Télécharger un template Excel
  async telechargerTemplateExcel(type: 'notes' | 'etudiants'): Promise<Blob> {
    const response = await api.get(`/templates/${type}/excel`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
