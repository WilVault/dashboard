import { useReducer, useEffect } from 'react';
import { useSession } from '../../context/SessionContext';

const ACTION_TYPES = {
  SET_LOADING: 'SET_LOADING',
  SET_READY:   'SET_READY',
  SET_ERROR:   'SET_ERROR',
} as const;

interface DashboardState {
  isLoading: boolean;
  error:     string | null;
}

type DashboardAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_READY' }
  | { type: 'SET_ERROR'; error: string };

const initialState: DashboardState = {
  isLoading: true,
  error:     null,
};

function reducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return { ...state, isLoading: true, error: null };
    case ACTION_TYPES.SET_READY:
      return { ...state, isLoading: false };
    case ACTION_TYPES.SET_ERROR:
      return { ...state, isLoading: false, error: action.error };
    default:
      return state;
  }
}

export default function Dashboard() {
  const { person } = useSession();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: ACTION_TYPES.SET_LOADING });
      try {
        dispatch({ type: ACTION_TYPES.SET_READY });
      } catch {
        dispatch({ type: ACTION_TYPES.SET_ERROR, error: 'Failed to load data.' });
      }
    };

    fetchData();
  }, []);

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {person?.fullName}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{person?.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {['Metric A', 'Metric B', 'Metric C'].map(label => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">—</p>
          </div>
        ))}
      </div>
    </div>
  );
}