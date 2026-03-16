import api from '../helpers/apiClient';
import type { Person } from '../types';

export function getMe() {
    return api.get<{ data: { user: Person } }>('/persons/me');
}

export function uploadDefaultAvatar(email: string, full_name: string) {
  return api.post('/persons/upload-default-avatar', { email, full_name });
}

export function updateProfileUrl(email: string, profile_url: string, profile_url_customized: boolean) {
  return api.patch('/persons/profile-url', { email, profile_url, profile_url_customized });
}

export function uploadCustomAvatar(formData: FormData) {
  return api.post('/persons/upload-custom-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}