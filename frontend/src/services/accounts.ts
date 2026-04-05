import api from '../helpers/apiClient';

export function getAccounts() {
  return api.get('/accounts');
}

export function getAccountById(accountId: number) {
  return api.get(`/accounts/${accountId}`);
}

export function getAccountTypes() {
  return api.get('/account-types');
}

export function getAccountBalance(accountId: number) {
  return api.get(`/accounts/${accountId}/balance`);
}

export function getAccountTransactions(accountId: number) {
  return api.get(`/accounts/${accountId}/transactions`);
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

export function deleteAccount(accountId: number) {
  return api.delete(`/accounts/${accountId}`);
}

export function getNetWorth() {
  return api.get('/accounts/net-worth');
}