import { useReducer, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../helpers/apiClient';
import constants from '../../constants';

const ACTION_TYPES = {
  SET_EMAIL:    'SET_EMAIL',
  SET_PASSWORD: 'SET_PASSWORD',
  SET_LOADING:  'SET_LOADING',
  SET_ERROR:    'SET_ERROR',
  CLEAR_ERROR:  'CLEAR_ERROR',
} as const;

interface LoginState {
  email:    string;
  password: string;
  loading:  boolean;
  error:    string | null;
}

type LoginAction =
  | { type: 'SET_EMAIL';    email:    string }
  | { type: 'SET_PASSWORD'; password: string }
  | { type: 'SET_LOADING';  loading:  boolean }
  | { type: 'SET_ERROR';    error:    string }
  | { type: 'CLEAR_ERROR' };

const initialState: LoginState = {
  email:    '',
  password: '',
  loading:  false,
  error:    null,
};

function reducer(state: LoginState, action: LoginAction): LoginState {
  switch (action.type) {
    case ACTION_TYPES.SET_EMAIL:
      return { ...state, email: action.email };
    case ACTION_TYPES.SET_PASSWORD:
      return { ...state, password: action.password };
    case ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.loading };
    case ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.error };
    case ACTION_TYPES.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
}

export default function AuthScreen() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleLogin = useCallback(async () => {
    dispatch({ type: ACTION_TYPES.SET_LOADING, loading: true });
    dispatch({ type: ACTION_TYPES.CLEAR_ERROR });

    try {
      const res = await api.post('/login', {
        email:    state.email,
        password: state.password,
      });
      localStorage.setItem(constants.ACCESS_TOKEN, res.data.data.access_token);
      window.location.href = '/dashboard';

    } catch {
      dispatch({ type: ACTION_TYPES.SET_ERROR, error: 'Invalid email or password.' });
    } finally {
      dispatch({ type: ACTION_TYPES.SET_LOADING, loading: false });
    }
  }, [state.email, state.password, navigate]);

  return (
    <div className="max-w-[561px] bg-white rounded-2xl shadow-lg p-8 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back</p>
      </div>
      <div className="space-y-3">
        <input
          type="email"
          value={state.email}
          onChange={e => dispatch({ type: ACTION_TYPES.SET_EMAIL, email: e.target.value })}
          placeholder="Email"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="password"
          value={state.password}
          onChange={e => dispatch({ type: ACTION_TYPES.SET_PASSWORD, password: e.target.value })}
          placeholder="Password"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      {state.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}
      <button
        onClick={handleLogin}
        disabled={state.loading}
        className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {state.loading ? 'Signing in...' : 'Sign in'}
      </button>
    </div>
  );
}