import api from '../helpers/apiClient';
import type { Person } from '../types';

export function getMe() {
    return api.get<{ data: { user: Person } }>('/persons/me');
}