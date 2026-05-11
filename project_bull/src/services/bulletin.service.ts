import { api } from './api';

// ============ BULLETINS ============
// Endpoints documentés :
// GET /bulletins/etudiant/:id/semestre/:id  → données bulletin semestre
// GET /bulletins/etudiant/:id/annuel        → données bulletin annuel
// GET /bulletins/promotion/semestre/:id     → récapitulatif promotion

export const bulletinService = {
  /**
   * Données agrégées pour le bulletin d'un semestre
   */
  async getBulletinSemestre(etudiantId: string, semestreId: string): Promise<any> {
    const response = await api.get(
      `/bulletins/etudiant/${etudiantId}/semestre/${semestreId}`
    );
    return response.data;
  },

  /**
   * Données agrégées pour le bulletin annuel
   */
  async getBulletinAnnuel(etudiantId: string): Promise<any> {
    const response = await api.get(`/bulletins/etudiant/${etudiantId}/annuel`);
    return response.data;
  },

  /**
   * Récapitulatif de toute la promotion pour un semestre
   */
  async getRecapPromotion(semestreId: string): Promise<any> {
    const response = await api.get(`/bulletins/promotion/semestre/${semestreId}`);
    return response.data;
  },

  /**
   * Télécharger un fichier blob (PDF généré côté frontend)
   */
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
  /**
   * Importer des notes depuis Excel
   */
  async importerNotesExcel(file: File, semestreId: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('semestreId', semestreId);
    const response = await api.post('/import/notes/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Exporter les notes d'un semestre en Excel
   */
  async exporterNotesExcel(semestreId: string): Promise<Blob> {
    const response = await api.get(`/export/notes/semestre/${semestreId}/excel`, {
      responseType: 'blob',
    });
    return response.data;
  },

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
