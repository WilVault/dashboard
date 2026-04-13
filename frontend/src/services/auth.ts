import api from '../helpers/apiClient';

export function login(email: string, password: string) {
    return api.post<{ data: { access_token: string } }>('/login', { email, password });
}

export function register(data: {
  email: string;
  password: string;
  full_name: string;
  profile_url: string;
  profile_url_customized: boolean;
  timezone: string;
  currency_id: number;
}) {
  return api.post('/register', data);
}

export function resetPassword(email: string, new_password: string) {
  return api.post('/reset-password', { email, new_password });
}