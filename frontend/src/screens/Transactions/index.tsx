import { useReducer, useEffect, useCallback, useState } from 'react';
import { getTransactions, getTransactionCategories, getTransactionTypes } from '../../services/transactions';
import { getAccounts } from '../../services/accounts';
import { useLoader } from '../../context/LoaderContext';
import { useSession } from '../../context/SessionContext';
import { formatAmount } from '../../utilities';
import RangePicker from '../../components/RangePicker';
import TransactionTable from '../../components/TransactionTable';
import AddTransactionModal from '../../components/AddTransactionModal';
import TransactionDetailModal from '../../components/TransactionDetailModal';
import type { DateRange } from '../../components/RangePicker';

const ACTION_TYPES = {
  SET_TRANSACTIONS:           'SET_TRANSACTIONS',
  SET_SUMMARY:                'SET_SUMMARY',
  SET_PAGINATION:             'SET_PAGINATION',
  SET_FILTERS:                'SET_FILTERS',
  SET_ERROR:                  'SET_ERROR',
  SET_ACCOUNTS:               'SET_ACCOUNTS',
  SET_TRANSACTION_CATEGORIES: 'SET_TRANSACTION_CATEGORIES',
  SET_TRANSACTION_TYPES:      'SET_TRANSACTION_TYPES',
} as const;

const initialState = {
  transactions:          [] as any[],
  accounts:              [] as any[],
  transactionCategories: [] as any[],
  transactionTypes:      [] as any[],
  summary: {
    totalIncome:   '',
    totalExpenses: '',
    net:           '',
  },
  pagination: {
    total:     0,
    page:      1,
    page_size: 20,
    pages:     0,
  },
  filters: {
    transactionType:     '',
    transactionCategory: '',
    title:               '',
    dateFrom:            '',
    dateTo:              '',
    page:                1,
    pageSize:            20,
    accountName:         '',
  },
  error: null as string | null,
};

type State = typeof initialState;

type Action =
  | { type: typeof ACTION_TYPES.SET_TRANSACTIONS;           transactions: any[] }
  | { type: typeof ACTION_TYPES.SET_SUMMARY;                summary: State['summary'] }
  | { type: typeof ACTION_TYPES.SET_PAGINATION;             pagination: State['pagination'] }
  | { type: typeof ACTION_TYPES.SET_FILTERS;                filters: Partial<State['filters']> }
  | { type: typeof ACTION_TYPES.SET_ERROR;                  error: string | null }
  | { type: typeof ACTION_TYPES.SET_ACCOUNTS;               accounts: any[] }
  | { type: typeof ACTION_TYPES.SET_TRANSACTION_CATEGORIES; transactionCategories: any[] }
  | { type: typeof ACTION_TYPES.SET_TRANSACTION_TYPES;      transactionTypes: any[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ACTION_TYPES.SET_TRANSACTIONS:
      return { ...state, transactions: action.transactions };
    case ACTION_TYPES.SET_SUMMARY:
      return { ...state, summary: action.summary };
    case ACTION_TYPES.SET_PAGINATION:
      return { ...state, pagination: action.pagination };
    case ACTION_TYPES.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.filters } };
    case ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.error };
    case ACTION_TYPES.SET_ACCOUNTS:
      return { ...state, accounts: action.accounts };
    case ACTION_TYPES.SET_TRANSACTION_CATEGORIES:
      return { ...state, transactionCategories: action.transactionCategories };
    case ACTION_TYPES.SET_TRANSACTION_TYPES:
      return { ...state, transactionTypes: action.transactionTypes };
    default:
      return state;
  }
}

const TYPE_PILLS = [
  { label: 'All',      value: '' },
  { label: 'Income',   value: 'income' },
  { label: 'Expense',  value: 'expense' },
  { label: 'Transfer', value: 'transfer' },
];

export default function Transactions() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { show, hide } = useLoader();
  const { person } = useSession();
  const [searchInput, setSearchInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const fetchTransactions = useCallback(async () => {
    dispatch({ type: ACTION_TYPES.SET_ERROR, error: null });
    show('Loading transactions...');
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(state.filters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      );

      const res = await getTransactions(activeFilters);
      const data = (res.data as any).data;

      dispatch({ type: ACTION_TYPES.SET_TRANSACTIONS, transactions: data.transactions });
      dispatch({
        type: ACTION_TYPES.SET_SUMMARY,
        summary: {
          totalIncome:   data.summary.totalIncome,
          totalExpenses: data.summary.totalExpenses,
          net:           data.summary.net,
        },
      });
      dispatch({ type: ACTION_TYPES.SET_PAGINATION, pagination: data.pagination });
    } catch (err) {
      console.error('fetchTransactions error:', err);
      dispatch({ type: ACTION_TYPES.SET_ERROR, error: 'Failed to load transactions.' });
    } finally {
      hide();
    }
  }, [state.filters]);

  const fetchLookups = useCallback(async () => {
    try {
      const [accountsRes, categoriesRes, typesRes] = await Promise.all([
        getAccounts(),
        getTransactionCategories(),
        getTransactionTypes(),
      ]);
      dispatch({ type: ACTION_TYPES.SET_ACCOUNTS,               accounts:              (accountsRes.data   as any).data.accounts });
      dispatch({ type: ACTION_TYPES.SET_TRANSACTION_CATEGORIES, transactionCategories: (categoriesRes.data as any).data.categories });
      dispatch({ type: ACTION_TYPES.SET_TRANSACTION_TYPES,      transactionTypes:      (typesRes.data      as any).data.types });
    } catch (err) {
      console.error('fetchLookups error:', err);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchTransactions(), fetchLookups()]);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [state.filters]);

  // debounce search → title filter, reset page to 1
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: ACTION_TYPES.SET_FILTERS, filters: { title: searchInput, page: 1 } });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleTypePill = (value: string) => {
    dispatch({ type: ACTION_TYPES.SET_FILTERS, filters: { transactionType: value, page: 1 } });
  };

  const handleDateRange = (range: DateRange | undefined) => {
    dispatch({
      type: ACTION_TYPES.SET_FILTERS,
      filters: {
        dateFrom: range?.dateFrom ?? '',
        dateTo:   range?.dateTo   ?? '',
        page:     1,
      },
    });
  };

  const handlePageChange = (page: number) => {
    dispatch({ type: ACTION_TYPES.SET_FILTERS, filters: { page } });
  };

  const dateRangeValue = state.filters.dateFrom
    ? { dateFrom: state.filters.dateFrom, dateTo: state.filters.dateTo }
    : undefined;

  const currency = (person as any)?.currency?.currency ?? 'PHP';

  return (
    <div>

      {/* Header */}
      <div className="sm:flex justify-between items-start mb-6">
        <div>
          <h1 className="text-white text-2xl font-extrabold tracking-tight">Transactions</h1>
          <p className="text-[#4A4A68] text-sm mt-1">All time</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#C9FA30] text-black text-sm font-bold px-5 py-3 rounded-xl cursor-pointer hover:opacity-70 transition-opacity mt-5 sm:mt-0"
        >
          + Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0C0C17] border border-[#1a1a2e] rounded-2xl p-6">
          <p className="text-[#4A4A68] text-xs font-semibold tracking-widest uppercase mb-3">Total Income</p>
          <p className="text-[#C9FA30] text-2xl font-extrabold tracking-tight">
            {formatAmount(state.summary.totalIncome, currency)}
          </p>
        </div>
        <div className="bg-[#0C0C17] border border-[#1a1a2e] rounded-2xl p-6">
          <p className="text-[#4A4A68] text-xs font-semibold tracking-widest uppercase mb-3">Total Expenses</p>
          <p className="text-[#FF4D4D] text-2xl font-extrabold tracking-tight">
            {formatAmount(state.summary.totalExpenses, currency)}
          </p>
        </div>
        <div className="bg-[#0C0C17] border border-[#1a1a2e] rounded-2xl p-6">
          <p className="text-[#4A4A68] text-xs font-semibold tracking-widest uppercase mb-3">Net</p>
          <p className="text-white text-2xl font-extrabold tracking-tight">
            {formatAmount(state.summary.net, currency)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#0C0C17] border border-[#1a1a2e] rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {TYPE_PILLS.map(pill => {
            const isActive = state.filters.transactionType === pill.value;
            return (
              <button
                key={pill.value}
                onClick={() => handleTypePill(pill.value)}
                className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-[#C9FA30] text-black border-[#C9FA30]'
                    : 'bg-transparent text-[#4A4A68] border-[#1a1a2e] hover:border-[#4A4A68] hover:text-white'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <RangePicker
            value={dateRangeValue}
            onChange={handleDateRange}
            placeholder="All time"
          />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search..."
            className="bg-[#07070f] border border-[#1a1a2e] text-white text-sm px-4 py-1.75 rounded-[9px] placeholder-[#4A4A68] focus:outline-none focus:border-[#4A4A68] transition-colors"
          />
          <select
            value={state.filters.accountName}
            onChange={e => dispatch({ type: ACTION_TYPES.SET_FILTERS, filters: { accountName: e.target.value, page: 1 } })}
            className="bg-[#07070f] border border-[#1a1a2e] text-white text-sm px-4 py-1.75 rounded-[9px] focus:outline-none focus:border-[#4A4A68] transition-colors cursor-pointer"
          >
            <option value="">All Accounts</option>
            {state.accounts.map((acc: any) => (
              <option key={acc.accountId} value={acc.accountName}>{acc.accountName}</option>
            ))}
          </select>
          <select
            value={state.filters.transactionCategory}
            onChange={e => dispatch({ type: ACTION_TYPES.SET_FILTERS, filters: { transactionCategory: e.target.value, page: 1 } })}
            className="bg-[#07070f] border border-[#1a1a2e] text-white text-sm px-4 py-1.75 rounded-[9px] focus:outline-none focus:border-[#4A4A68] transition-colors cursor-pointer"
          >
            <option value="">All Categories</option>
            {state.transactionCategories.map((cat: any) => (
              <option key={cat.id} value={cat.label}>{cat.icon} {cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction Table */}
      <TransactionTable
        transactions={state.transactions}
        pagination={state.pagination}
        currency={currency}
        onPageChange={handlePageChange}
        onRowClick={t => setSelectedTransaction(t)}
      />

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          currency={currency}
          onClose={() => setSelectedTransaction(null)}
        />
      )}

      {/* Add Transaction Modal */}
      {showModal && (
        <AddTransactionModal
          accounts={state.accounts}
          transactionCategories={state.transactionCategories}
          totalIncomeBalance={state.summary.totalIncome}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchTransactions();
          }}
        />
      )}

    </div>
  );
}