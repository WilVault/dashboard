import api from '../helpers/apiClient';

export function getAccounts() {
  return api.get('/accounts');
}

export function getAccountById(accountId: number) {
  return api.get(`/accounts/${accountId}`);
}

export function createAccount(data: {
  account_name:    string;
  account_type_id: number;
  initial_balance: number;
  color?:          string;
  icon?:           string;
}) {
  return api.post('/accounts', data);
}