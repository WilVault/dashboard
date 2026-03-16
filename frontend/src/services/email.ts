import api from '../helpers/apiClient';

export function validateEmail(email: string) {
    return api.post('/validate-email', { email });
}