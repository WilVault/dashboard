import { useReducer } from 'react';
import { createAccount } from '../../services/accounts';
import { useLoader } from '../../context/LoaderContext';
import toast from 'react-hot-toast';

const ACTION_TYPES = {
  SET_ICON:    'SET_ICON',
  SET_COLOR:   'SET_COLOR',
  SET_NAME:    'SET_NAME',
  SET_BALANCE: 'SET_BALANCE',
  SET_TYPE_ID: 'SET_TYPE_ID',
  RESET:       'RESET',
} as const;

const ICONS = [
  '🏦', '🏧', '📱', '💵', '📊', '💳',
  '💰', '🏠', '✈️', '🎓', '💼', '🛒',
  '🎯', '📈', '💎', '🪙',
];

const COLORS = [
  '#C9FA30', '#22C55E', '#4A9EFF', '#A855F7',
  '#F97316', '#EAB308', '#EF4444', '#EC4899',
];

const initialState = {
  icon:    ICONS[0],
  color:   COLORS[0],
  name:    '',
  balance: '',
  typeId:  '',
};

type State = typeof initialState;
type Action =
  | { type: typeof ACTION_TYPES.SET_ICON;    icon: string }
  | { type: typeof ACTION_TYPES.SET_COLOR;   color: string }
  | { type: typeof ACTION_TYPES.SET_NAME;    name: string }
  | { type: typeof ACTION_TYPES.SET_BALANCE; balance: string }
  | { type: typeof ACTION_TYPES.SET_TYPE_ID; typeId: string }
  | { type: typeof ACTION_TYPES.RESET };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ACTION_TYPES.SET_ICON:    return { ...state, icon: action.icon };
    case ACTION_TYPES.SET_COLOR:   return { ...state, color: action.color };
    case ACTION_TYPES.SET_NAME:    return { ...state, name: action.name };
    case ACTION_TYPES.SET_BALANCE: return { ...state, balance: action.balance };
    case ACTION_TYPES.SET_TYPE_ID: return { ...state, typeId: action.typeId };
    case ACTION_TYPES.RESET:       return { ...initialState };
    default: return state;
  }
}

interface Props {
  accountTypes: any[];
  onClose:      () => void;
  onSuccess:    () => void;
}

export default function AddAccountModal({ accountTypes, onClose, onSuccess }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { show, hide } = useLoader();

  const selectedTypeName = accountTypes.find(
    (t: any) => t.accountTypeId === parseInt(state.typeId)
  )?.label ?? 'Account Type';

  const handleSave = async () => {
    if (!state.name.trim()) { toast.error('Please enter an account name.'); return; }
    if (!state.typeId) { toast.error('Please select an account type.'); return; }
    if (state.balance === '' || isNaN(parseFloat(state.balance))) { toast.error('Please enter a valid balance.'); return; }

    show('Creating account...');
    try {
      await createAccount({
        account_name:    state.name.trim(),
        account_type_id: parseInt(state.typeId),
        initial_balance: parseFloat(state.balance),
        color:           state.color,
        icon:            state.icon,
      });
      toast.success('Account created!');
      dispatch({ type: ACTION_TYPES.RESET });
      onSuccess();
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Failed to create account.';
      toast.error(message);
    } finally {
      hide();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#0C0C17] border border-[#1a1a2e] rounded-3xl w-full max-w-3xl overflow-hidden flex">

          {/* ── LEFT PANEL ── */}
          <div
            className="w-64 shrink-0 flex flex-col p-6 relative overflow-hidden"
            style={{ background: `linear-gradient(160deg, ${state.color}18 0%, #07070f 60%)` }}
          >
            {/* glow blob */}
            <div
              className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ backgroundColor: state.color }}
            />

            {/* Preview card */}
            <div className="relative z-10 mt-4 mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 mx-auto"
                style={{ backgroundColor: state.color + '22', border: `2px solid ${state.color}55` }}
              >
                {state.icon}
              </div>
              <p
                className="text-center text-lg font-extrabold tracking-tight truncate"
                style={{ color: state.color }}
              >
                {state.name || 'Account Name'}
              </p>
              <p className="text-center text-[#4A4A68] text-xs mt-1">{selectedTypeName}</p>
            </div>

            {/* Color picker */}
            <p className="text-[#4A4A68] text-[10px] font-bold tracking-widest uppercase mb-2 relative z-10">Color</p>
            <div className="grid grid-cols-4 gap-2 relative z-10 mb-5">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => dispatch({ type: ACTION_TYPES.SET_COLOR, color })}
                  className="w-9 h-9 rounded-full cursor-pointer transition-all"
                  style={{
                    backgroundColor: color,
                    outline: state.color === color ? `3px solid ${color}` : 'none',
                    outlineOffset: '3px',
                  }}
                />
              ))}
            </div>

            {/* Icon picker */}
            <p className="text-[#4A4A68] text-[10px] font-bold tracking-widest uppercase mb-2 relative z-10">Icon</p>
            <div className="grid grid-cols-4 gap-2 relative z-10">
              {ICONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => dispatch({ type: ACTION_TYPES.SET_ICON, icon })}
                  className="w-9 h-9 rounded-xl text-lg flex items-center justify-center cursor-pointer transition-all border"
                  style={{
                    backgroundColor: state.icon === icon ? state.color + '22' : '#07070f',
                    borderColor:     state.icon === icon ? state.color : '#1a1a2e',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="flex-1 flex flex-col p-6 border-l border-[#1a1a2e]">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-xl font-extrabold tracking-tight">Add Account</h2>
              <button onClick={onClose} className="text-[#4A4A68] hover:text-white transition-colors cursor-pointer text-lg">✕</button>
            </div>

            <div className="flex flex-col gap-4 flex-1">

              {/* Account Name */}
              <div>
                <p className="text-[#4A4A68] text-xs font-semibold tracking-widest uppercase mb-2">Account Name</p>
                <input
                  type="text"
                  value={state.name}
                  onChange={e => dispatch({ type: ACTION_TYPES.SET_NAME, name: e.target.value })}
                  placeholder="e.g. BPI Savings"
                  className="w-full bg-[#07070f] border border-[#1a1a2e] text-white text-sm px-4 py-3 rounded-xl placeholder-[#4A4A68] focus:outline-none focus:border-[#4A4A68] transition-colors"
                />
              </div>

              {/* Current Balance */}
              <div>
                <p className="text-[#4A4A68] text-xs font-semibold tracking-widest uppercase mb-2">Current Balance</p>
                <input
                  type="number"
                  step="0.01"
                  value={state.balance}
                  onChange={e => dispatch({ type: ACTION_TYPES.SET_BALANCE, balance: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-[#07070f] border border-[#1a1a2e] text-white text-sm px-4 py-3 rounded-xl placeholder-[#4A4A68] focus:outline-none focus:border-[#4A4A68] transition-colors"
                />
              </div>

              {/* Account Type */}
              <div>
                <p className="text-[#4A4A68] text-xs font-semibold tracking-widest uppercase mb-2">Account Type</p>
                <select
                  value={state.typeId}
                  onChange={e => dispatch({ type: ACTION_TYPES.SET_TYPE_ID, typeId: e.target.value })}
                  className="w-full bg-[#07070f] border border-[#1a1a2e] text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#4A4A68] transition-colors cursor-pointer"
                >
                  <option value="">Select type</option>
                  {accountTypes.map((t: any) => (
                    <option key={t.accountTypeId} value={t.accountTypeId}>{t.label}</option>
                  ))}
                </select>
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
                Add Account
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}