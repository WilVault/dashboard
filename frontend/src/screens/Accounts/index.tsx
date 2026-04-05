import { useReducer, useEffect, useCallback, useState } from 'react';
import { getAccounts, getAccountTypes, getNetWorth } from '../../services/accounts';
import { useLoader } from '../../context/LoaderContext';
import { useSession } from '../../context/SessionContext';
import AddAccountModal from '../../components/AddAccountModal';
import AccountCard from '../../components/AccountCard';
import AccountDetailModal from '../../components/AccountDetailModal';
import NetWorthBanner from '../../components/NetWorthBanner';

const ACTION_TYPES = {
  SET_ACCOUNTS:      'SET_ACCOUNTS',
  SET_ACCOUNT_TYPES: 'SET_ACCOUNT_TYPES',
  SET_NET_WORTH:     'SET_NET_WORTH',
  SET_ERROR:         'SET_ERROR',
} as const;

const initialState = {
  accounts:     [] as any[],
  accountTypes: [] as any[],
  netWorth:     null as any,
  error:        null as string | null,
};

type State = typeof initialState;
type Action =
  | { type: typeof ACTION_TYPES.SET_ACCOUNTS;      accounts: any[] }
  | { type: typeof ACTION_TYPES.SET_ACCOUNT_TYPES; accountTypes: any[] }
  | { type: typeof ACTION_TYPES.SET_NET_WORTH;     netWorth: any }
  | { type: typeof ACTION_TYPES.SET_ERROR;         error: string | null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ACTION_TYPES.SET_ACCOUNTS:      return { ...state, accounts: action.accounts };
    case ACTION_TYPES.SET_ACCOUNT_TYPES: return { ...state, accountTypes: action.accountTypes };
    case ACTION_TYPES.SET_NET_WORTH:     return { ...state, netWorth: action.netWorth };
    case ACTION_TYPES.SET_ERROR:         return { ...state, error: action.error };
    default: return state;
  }
}

export default function Accounts() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { show, hide } = useLoader();
  const { person } = useSession();
  const [showModal, setShowModal]         = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  const currency = (person as any)?.currency?.currency ?? 'PHP';

  const fetchAccounts = useCallback(async () => {
    show('Loading accounts...');
    try {
      const res = await getAccounts();
      const accounts = (res.data as any).data.accounts;
      dispatch({ type: ACTION_TYPES.SET_ACCOUNTS, accounts });
    } catch (err) {
      console.error('fetchAccounts error:', err);
      dispatch({ type: ACTION_TYPES.SET_ERROR, error: 'Failed to load accounts.' });
    } finally {
      hide();
    }
  }, []);

  const fetchNetWorth = useCallback(async () => {
    try {
      const res = await getNetWorth();
      dispatch({ type: ACTION_TYPES.SET_NET_WORTH, netWorth: (res.data as any).data });
    } catch (err) {
      console.error('fetchNetWorth error:', err);
    }
  }, []);

  const fetchAccountTypes = useCallback(async () => {
    try {
      const res = await getAccountTypes();
      dispatch({ type: ACTION_TYPES.SET_ACCOUNT_TYPES, accountTypes: (res.data as any).data.types });
    } catch (err) {
      console.error('fetchAccountTypes error:', err);
    }
  }, []);

  const refreshAll = useCallback(() => {
    Promise.all([fetchAccounts(), fetchNetWorth()]);
  }, [fetchAccounts, fetchNetWorth]);

  useEffect(() => {
    Promise.all([fetchAccounts(), fetchNetWorth(), fetchAccountTypes()]);
  }, []);

  return (
    <div>

      {/* Header */}
      <div className="sm:flex justify-between items-start mb-6">
        <div>
          <h1 className="text-white text-2xl font-extrabold tracking-tight">Accounts</h1>
          <p className="text-[#4A4A68] text-sm mt-1">Manage your wallets, banks, and investment accounts.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#C9FA30] text-black text-sm font-bold px-5 py-3 rounded-xl cursor-pointer hover:opacity-70 transition-opacity mt-5 sm:mt-0"
        >
          + Add Account
        </button>
      </div>

      {/* Net Worth Banner */}
      {state.netWorth && (
        <NetWorthBanner data={state.netWorth} currency={currency} />
      )}

      {/* Account Cards */}
      {state.accounts.length === 0 ? (
        <div className="text-center text-[#4A4A68] text-sm py-16">
          No accounts yet. Add your first account to get started.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.accounts.map((account: any) => (
            <AccountCard
              key={account.accountId}
              account={account}
              currency={currency}
              onClick={() => setSelectedAccount(account)}
            />
          ))}
        </div>
      )}

      {/* Add Account Modal */}
      {showModal && (
        <AddAccountModal
          accountTypes={state.accountTypes}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            refreshAll();
          }}
        />
      )}

      {/* Account Detail Modal */}
      {selectedAccount && (
        <AccountDetailModal
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
          onDeleted={() => {
            setSelectedAccount(null);
            refreshAll();
          }}
        />
      )}

    </div>
  );
}