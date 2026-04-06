import api from '../helpers/apiClient';

export interface DashboardFilters {
  dateFrom?: string;
  dateTo?:   string;
}

export function getDashboard(filters: DashboardFilters = {}) {
  return api.get('/dashboard', { params: filters });
}