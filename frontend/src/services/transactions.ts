import api from '../helpers/apiClient';

export interface TransactionFilters {
  transaction_type?:     string;
  transaction_category?: string;
  title?:                string;
  date_from?:            string;
  date_to?:              string;
  page?:                 number;
  page_size?:            number;
}

export function getTransactions(filters: TransactionFilters = {}) {
  return api.get('/transactions', { params: filters });
}

export function getTransactionById(transactionId: number) {
  return api.get(`/transactions/${transactionId}`);
}

export function getTransactionsByAccount(accountId: number) {
  return api.get(`/accounts/${accountId}/transactions`);
}

export function createTransaction(data: {
  account_id:              number;
  transaction_category_id: number;
  transaction_type_id:     number;
  amount:                  number;
  title:                   string;
  description?:            string;
  transaction_date?:       string;
}) {
  return api.post('/transactions', data);
}

export function createTransfer(data: {
  from_account_id: number;
  to_account_id:   number;
  amount:          number;
  title:           string;
  description?:    string;
}) {
  return api.post('/transactions/transfer', data);
}

export function getTransactionCategories() {
  return api.get('/transaction-categories');
}

export function getTransactionTypes() {
  return api.get('/transaction-types');
}