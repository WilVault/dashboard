import { useReducer } from 'react';
import { createTransaction } from '../../services/transactions';
import { useLoader } from '../../context/LoaderContext';
import toast from 'react-hot-toast';

const ACTION_TYPES = {
  SET_TYPE:        'SET_TYPE',
  SET_TITLE:       'SET_TITLE',
  SET_AMOUNT:      'SET_AMOUNT',
  SET_CATEGORY_ID: 'SET_CATEGORY_ID',
  SET_ACCOUNT_ID:  'SET_ACCOUNT_ID',
  SET_DATE:        'SET_DATE',
  SET_DESCRIPTION: 'SET_DESCRIPTION',
  RESET:           'RESET',
} as const;

const today = new Date().toISOString().slice(0, 10);

const initialState = {
  transactionTypeId: 2,  // default: expense
  title:             '',
  amount:            '',
  categoryId:        '',
  accountId:         '',
  date:              today,
  description:       '',
};

type State = typeof initialState;
type Action =
  | { type: typeof ACTION_TYPES.SET_TYPE;        transactionTypeId: number }
  | { type: typeof ACTION_TYPES.SET_TITLE;       title: string }
  | { type: typeof ACTION_TYPES.SET_AMOUNT;      amount: string }
  | { type: typeof ACTION_TYPES.SET_CATEGORY_ID; categoryId: string }
  | { type: typeof ACTION_TYPES.SET_ACCOUNT_ID;  accountId: string }
  | { type: typeof ACTION_TYPES.SET_DATE;        date: string }
  | { type: typeof ACTION_TYPES.SET_DESCRIPTION; description: string }
  | { type: typeof ACTION_TYPES.RESET };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ACTION_TYPES.SET_TYPE:        return { ...state, transactionTypeId: action.transactionTypeId };
    case ACTION_TYPES.SET_TITLE:       return { ...state, title: action.title };
    case ACTION_TYPES.SET_AMOUNT:      return { ...state, amount: action.amount };
    case ACTION_TYPES.SET_CATEGORY_ID: return { ...state, categoryId: action.categoryId };
    case ACTION_TYPES.SET_ACCOUNT_ID:  return { ...state, accountId: action.accountId };
    case ACTION_TYPES.SET_DATE:        return { ...state, date: action.date };
    case ACTION_TYPES.SET_DESCRIPTION: return { ...state, description: action.description };
    case ACTION_TYPES.RESET:           return { ...initialState, date: today };
    default: return state;
  }
}

// type pills — expense and income only (no transfer/initial_balance in this modal)
const TYPE_PILLS = [
  { label: 'Income',  typeId: 1 },
  { label: 'Expense', typeId: 2 },
];

interface Props {
  accounts:              any[];
  transactionCategories: any[];
  onClose:               () => void;
  onSuccess:             () => void;
}

export default function AddTransactionModal({ accounts, transactionCategories, onClose, onSuccess }: Props) {
  const [state, dispatch] = useReducer(reducer, { ...initialState, date: today });
  const { show, hide } = useLoader();

  const handleSave = async () => {
    if (!state.title.trim()) {
      toast.error('Please enter a title.');
      return;
    }
    if (!state.amount || isNaN(parseFloat(state.amount))) {
      toast.error('Please enter a valid amount.');
      return;
    }
    if (!state.categoryId) {
      toast.error('Please select a category.');
      return;
    }
    if (!state.accountId) {
      toast.error('Please select an account.');
      return;
    }
    if (!state.date) {
      toast.error('Please select a date.');
      return;
    }

    const isExpense = state.transactionTypeId === 2;
    const amount    = isExpense ? -Math.abs(parseFloat(state.amount)) : Math.abs(parseFloat(state.amount));

    show('Saving transaction...');
    try {
      await createTransaction({
        account_id:              parseInt(state.accountId),
        transaction_category_id: parseInt(state.categoryId),
        transaction_type_id:     state.transactionTypeId,
        amount,
        title:                   state.title.trim(),
        description:             state.description.trim() || undefined,
        transaction_date:        state.date,
      });

      toast.success('Transaction saved!');
      dispatch({ type: ACTION_TYPES.RESET });
      onSuccess();
    } catch (err) {
      console.error('createTransaction error:', err);
      toast.error('Failed to save transaction. Please try again.');
    } finally {
      hide();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#0C0C17] border border-[#1a1a2e] rounded-2xl w-full max-w-md p-6">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-xl font-extrabold tracking-tight">New Transaction</h2>
            <button
              onClick={onClose}
              className="text-[#4A4A68] hover:text-white transition-colors cursor-pointer text-lg"
            >
              ✕
            </button>
          </div>

          {/* Type pills */}
          <div className="flex gap-2 mb-5">
            {TYPE_PILLS.map(pill => {
              const isActive = state.transactionTypeId === pill.typeId;
              return (
                <button
                  key={pill.typeId}
                  onClick={() => dispatch({ type: ACTION_TYPES.SET_TYPE, transactionTypeId: pill.typeId })}
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

          <div className="space-y-4">

            {/* Title */}
            <div>
              <p className="text-[#4A4A68] text-xs font-semibold tracking-widest uppercase mb-2">Title</p>
              <input
                type="text"
                value={state.title}
                onChange={e => dispatch({ type: ACTION_TYPES.SET_TITLE, title: e.target.value })}
                placeholder="e.g. Jollibee, Monthly Salary"
                className="w-full bg-[#07070f] border border-[#1a1a2e] text-white text-sm px-4 py-3 rounded-xl placeholder-[#4A4A68] focus:outline-none focus:border-[#4A4A68] transition-colors"
              />
            </div>

            {/* Amount */}
            <div>
              <p className="text-[#4A4A68] text-xs font-semibold tracking-widest uppercase mb-2">Amount</p>
              <input
                type="number"
                min="0"
                step="0.01"
                value={state.amount}
                onChange={e => dispatch({ type: ACTION_TYPES.SET_AMOUNT, amount: e.target.value })}
                placeholder="0.00"
                className="w-full bg-[#07070f] border border-[#1a1a2e] text-white text-sm px-4 py-3 rounded-xl placeholder-[#4A4A68] focus:outline-none focus:border-[#4A4A68] transition-colors"
              />
            </div>

            {/* Category + Account */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[#4A4A68] text-xs font-semibold tracking-widest uppercase mb-2">Category</p>
                <select
                  value={state.categoryId}
                  onChange={e => dispatch({ type: ACTION_TYPES.SET_CATEGORY_ID, categoryId: e.target.value })}
                  className="w-full bg-[#07070f] border border-[#1a1a2e] text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#4A4A68] transition-colors cursor-pointer"
                >
                  <option value="">Select</option>
                  {transactionCategories
                    .filter((c: any) => !['Initial Balance', 'Transfer'].includes(c.label))
                    .map((c: any) => (
                      <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                    ))
                  }
                </select>
              </div>
              <div>
                <p className="text-[#4A4A68] text-xs font-semibold tracking-widest uppercase mb-2">Account</p>
                <select
                  value={state.accountId}
                  onChange={e => dispatch({ type: ACTION_TYPES.SET_ACCOUNT_ID, accountId: e.target.value })}
                  className="w-full bg-[#07070f] border border-[#1a1a2e] text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#4A4A68] transition-colors cursor-pointer"
                >
                  <option value="">Select</option>
                  {accounts.map((a: any) => (
                    <option key={a.accountId} value={a.accountId}>{a.accountName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <p className="text-[#4A4A68] text-xs font-semibold tracking-widest uppercase mb-2">Date</p>
              <input
                type="date"
                value={state.date}
                onChange={e => dispatch({ type: ACTION_TYPES.SET_DATE, date: e.target.value })}
                className="w-full bg-[#07070f] border border-[#1a1a2e] text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#4A4A68] transition-colors cursor-pointer"
              />
            </div>

            {/* Description */}
            <div>
              <p className="text-[#4A4A68] text-xs font-semibold tracking-widest uppercase mb-2">Description <span className="normal-case text-[10px]">(optional)</span></p>
              <textarea
                value={state.description}
                onChange={e => dispatch({ type: ACTION_TYPES.SET_DESCRIPTION, description: e.target.value })}
                placeholder="Any extra details about this transaction..."
                rows={3}
                className="w-full bg-[#07070f] border border-[#1a1a2e] text-white text-sm px-4 py-3 rounded-xl placeholder-[#4A4A68] focus:outline-none focus:border-[#4A4A68] transition-colors resize-none"
              />
            </div>

          </div>

          {/* Footer */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={onClose}
              className="py-3 rounded-xl text-sm font-bold border border-[#1a1a2e] text-[#4A4A68] hover:text-white hover:border-[#4A4A68] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="py-3 rounded-xl text-sm font-bold bg-[#C9FA30] text-black hover:opacity-70 transition-opacity cursor-pointer"
            >
              Save Transaction
            </button>
          </div>

        </div>
      </div>
    </>
  );
}