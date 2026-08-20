import { api } from './api';

export interface DashboardStats {
  totalEtudiants: number;
  totalEnseignants: number;
  totalMatieres: number;
  totalClasses: number;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};
