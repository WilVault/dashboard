import { useReducer, useEffect, useCallback, useRef } from 'react';
import { useSession } from '../../context/SessionContext';
import { useLoader } from '../../context/LoaderContext';
import { getMe, updateMe, deleteMe, uploadCustomAvatar, updateProfileUrl } from '../../services/persons';
import { getCurrentcies } from '../../services/currencies';
import toast from 'react-hot-toast';

const ACTION_TYPES = {
  SET_FULL_NAME:   'SET_FULL_NAME',
  SET_CURRENCY_ID: 'SET_CURRENCY_ID',
  SET_CURRENCIES:  'SET_CURRENCIES',
  SET_PERSON:      'SET_PERSON',
  SET_CONFIRM_DELETE: 'SET_CONFIRM_DELETE',
} as const;

const initialState = {
  fullName:      '',
  currencyId:    null as number | null,
  currencies:    [] as any[],
  person:        null as any,
  confirmDelete: false,
};

type State = typeof initialState;
type Action =
  | { type: typeof ACTION_TYPES.SET_FULL_NAME;      fullName: string }
  | { type: typeof ACTION_TYPES.SET_CURRENCY_ID;    currencyId: number }
  | { type: typeof ACTION_TYPES.SET_CURRENCIES;     currencies: any[] }
  | { type: typeof ACTION_TYPES.SET_PERSON;         person: any }
  | { type: typeof ACTION_TYPES.SET_CONFIRM_DELETE; confirmDelete: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ACTION_TYPES.SET_FULL_NAME:      return { ...state, fullName: action.fullName };
    case ACTION_TYPES.SET_CURRENCY_ID:    return { ...state, currencyId: action.currencyId };
    case ACTION_TYPES.SET_CURRENCIES:     return { ...state, currencies: action.currencies };
    case ACTION_TYPES.SET_PERSON:         return { ...state, person: action.person };
    case ACTION_TYPES.SET_CONFIRM_DELETE: return { ...state, confirmDelete: action.confirmDelete };
    default: return state;
  }
}

export default function Profile() {
  const { logout, refresh } = useSession();
  const { show, hide } = useLoader();
  const [state, dispatch] = useReducer(reducer, initialState);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    show('Loading profile...');
    try {
      const [personRes, currenciesRes] = await Promise.all([getMe(), getCurrentcies()]);
      const person     = (personRes.data     as any).data.user;
      const currencies = (currenciesRes.data as any).data;

      dispatch({ type: ACTION_TYPES.SET_PERSON,      person });
      dispatch({ type: ACTION_TYPES.SET_FULL_NAME,   fullName: person.fullName });
      dispatch({ type: ACTION_TYPES.SET_CURRENCY_ID, currencyId: person.currency?.currencyId ?? null });
      dispatch({ type: ACTION_TYPES.SET_CURRENCIES,  currencies: Array.isArray(currencies) ? currencies : [] });
    } catch (err) {
      console.error('fetchData error:', err);
      toast.error('Failed to load profile.');
    } finally {
      hide();
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be under 2MB.');
      return;
    }

    show('Uploading photo...');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('email', state.person.email);

      const res     = await uploadCustomAvatar(formData);
      const newUrl  = (res.data as any).data.profile_url;
      const bustUrl = `${newUrl}?t=${Date.now()}`;

      await updateProfileUrl(state.person.email, bustUrl, true);
      await refresh();
      await fetchData();
      toast.success('Photo updated!');
    } catch (err) {
      console.error('avatar upload error:', err);
      toast.error('Failed to upload photo.');
    } finally {
      hide();
    }
  };

  const handleSave = async () => {
    if (!state.fullName.trim()) {
      toast.error('Full name cannot be empty.');
      return;
    }

    show('Saving changes...');
    try {
      await updateMe({
        full_name:   state.fullName.trim(),
        currency_id: state.currencyId ?? undefined,
      });
      await refresh();
      toast.success('Profile updated!');
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Failed to save changes.';
      toast.error(message);
    } finally {
      hide();
    }
  };

  const handleDelete = async () => {
    show('Deleting account...');
    try {
      await deleteMe();
      toast.success('Account deleted.');
      logout();
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Failed to delete account.';
      toast.error(message);
    } finally {
      hide();
    }
  };

  return (
    <div>

      {/* Header */}
      <div className="mb-8">
        <p className="text-[#4A4A68] text-xs font-semibold tracking-widest uppercase mb-1">Settings</p>
        <h1 className="text-white text-2xl font-extrabold tracking-tight">My Profile</h1>
        <p className="text-[#4A4A68] text-sm mt-1">Manage your personal information and preferences.</p>
      </div>

      {/* Profile Picture */}
      <div className="bg-[#0C0C17] border border-[#1a1a2e] rounded-2xl p-6 mb-4">
        <p className="text-[#4A4A68] text-xs font-semibold tracking-widest uppercase mb-4">Profile Picture</p>
        <div className="flex items-center gap-5">
          <img
            src={state.person?.profileUrl ?? ''}
            alt="avatar"
            className="w-16 h-16 rounded-full object-cover border-2 border-[#1a1a2e]"
          />
          <div>
            <p className="text-white text-sm font-semibold mb-1">Upload a new photo</p>
            <p className="text-[#4A4A68] text-xs mb-3">JPG, PNG, or GIF. Max 2MB.</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-bold border border-[#1a1a2e] text-[#4A4A68] px-4 py-2 rounded-xl hover:text-white hover:border-[#4A4A68] transition-all cursor-pointer"
            >
              ↑ Upload photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-[#0C0C17] border border-[#1a1a2e] rounded-2xl p-6 mb-4">
        <p className="text-[#4A4A68] text-xs font-semibold tracking-widest uppercase mb-4">Personal Information</p>

        <div className="space-y-4">
          <div>
            <p className="text-[#4A4A68] text-xs font-semibold tracking-widest uppercase mb-2">Full Name</p>
            <input
              type="text"
              value={state.fullName}
              onChange={e => dispatch({ type: ACTION_TYPES.SET_FULL_NAME, fullName: e.target.value })}
              className="w-full bg-[#07070f] border border-[#1a1a2e] text-white text-sm px-4 py-3 rounded-xl placeholder-[#4A4A68] focus:outline-none focus:border-[#4A4A68] transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <p className="text-[#4A4A68] text-xs font-semibold tracking-widest uppercase">Email Address</p>
              <span className="text-[10px] font-bold border border-[#1a1a2e] text-[#4A4A68] px-2 py-0.5 rounded-md">Cannot change</span>
            </div>
            <div className="w-full bg-[#07070f] border border-[#1a1a2e] text-[#4A4A68] text-sm px-4 py-3 rounded-xl flex justify-between items-center">
              <span>{state.person?.email}</span>
              <span>🔒</span>
            </div>
            <p className="text-[#4A4A68] text-xs mt-2">Your email is used to log in and cannot be changed from here.</p>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-[#0C0C17] border border-[#1a1a2e] rounded-2xl p-6 mb-6">
        <p className="text-[#4A4A68] text-xs font-semibold tracking-widest uppercase mb-4">Preferences</p>
        <div>
          <p className="text-[#4A4A68] text-xs font-semibold tracking-widest uppercase mb-2">Default Currency</p>
          <select
            value={state.currencyId ?? ''}
            onChange={e => dispatch({ type: ACTION_TYPES.SET_CURRENCY_ID, currencyId: parseInt(e.target.value) })}
            className="w-full bg-[#07070f] border border-[#1a1a2e] text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#4A4A68] transition-colors cursor-pointer"
          >
            {state.currencies.map((c: any) => (
              <option key={c.currencyId ?? c.id} value={c.currencyId ?? c.id}>
                {c.emoji} {c.currency} — {c.description}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Save */}
      <div className='flex justify-end'>
        <button
            onClick={handleSave}
            className="bg-[#C9FA30] text-black text-sm font-bold px-6 py-3 rounded-xl cursor-pointer hover:opacity-70 transition-opacity mb-8"
        >
            Save Changes
        </button>
      </div>

      {/* Logout */}
      <div className="bg-[#0C0C17] border border-[#1a1a2e] rounded-2xl p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white text-sm font-semibold">Sign out</p>
            <p className="text-[#4A4A68] text-xs mt-1">Log out of your account on this device.</p>
          </div>
          <button
            onClick={logout}
            className="ml-6 shrink-0 border border-[#1a1a2e] text-[#4A4A68] text-sm font-bold px-4 py-2 rounded-xl hover:text-white hover:border-[#4A4A68] transition-all cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#0C0C17] border border-[#FF4D4D33] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span>⚠️</span>
          <p className="text-[#FF4D4D] font-extrabold">Danger Zone</p>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-white text-sm font-semibold">Delete this account</p>
            <p className="text-[#4A4A68] text-xs mt-1">
              Permanently removes your account and all data — transactions, budgets, accounts, goals. This cannot be undone.
            </p>
          </div>
          {!state.confirmDelete ? (
            <button
              onClick={() => dispatch({ type: ACTION_TYPES.SET_CONFIRM_DELETE, confirmDelete: true })}
              className="ml-6 shrink-0 border border-[#FF4D4D] text-[#FF4D4D] text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#FF4D4D] hover:text-white transition-all cursor-pointer"
            >
              Delete Account
            </button>
          ) : (
            <div className="ml-6 shrink-0 flex gap-2">
              <button
                onClick={() => dispatch({ type: ACTION_TYPES.SET_CONFIRM_DELETE, confirmDelete: false })}
                className="border border-[#1a1a2e] text-[#4A4A68] text-sm font-bold px-4 py-2 rounded-xl hover:text-white hover:border-[#4A4A68] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-[#FF4D4D] text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-70 transition-opacity cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}