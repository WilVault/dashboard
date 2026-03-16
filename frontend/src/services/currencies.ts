import api from '../helpers/apiClient';
import type { Currencies } from "../types";

export function getCurrentcies() {
    return api.get<{ data: { user: Currencies } }>('/currencies');
}