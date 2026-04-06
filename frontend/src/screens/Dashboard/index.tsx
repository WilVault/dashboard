import { useReducer, useEffect, useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { useLoader } from '../../context/LoaderContext';
import { getDashboard } from '../../services/dashboard';
import { formatAmount } from '../../utilities';
import RangePicker from '../../components/RangePicker';
import DashboardStatCard from '../../components/DashboardStatCard';
import CashFlowChart from '../../components/CashFlowChart';
import SpendingBreakdown from '../../components/SpendingBreakdown';
import RecentTransactions from '../../components/RecentTransactions';
import type { DateRange } from '../../components/RangePicker';

const ACTION_TYPES = {
  SET_DATA:  'SET_DATA',
  SET_ERROR: 'SET_ERROR',
} as const;

const initialState = {
  data:  null as any,
  error: null as string | null,
};

type State = typeof initialState;
type Action =
  | { type: typeof ACTION_TYPES.SET_DATA;  data: any }
  | { type: typeof ACTION_TYPES.SET_ERROR; error: string | null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ACTION_TYPES.SET_DATA:  return { ...state, data: action.data, error: null };
    case ACTION_TYPES.SET_ERROR: return { ...state, error: action.error };
    default: return state;
  }
}

export default function Dashboard() {
  const { person } = useSession();
  const { show, hide } = useLoader();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const currency = (person as any)?.currency?.currency ?? 'PHP';

  const fetchDashboard = async (range?: DateRange) => {
    show('Loading dashboard...');
    try {
      const res = await getDashboard({
        dateFrom: range?.dateFrom,
        dateTo:   range?.dateTo,
      });
      dispatch({ type: ACTION_TYPES.SET_DATA, data: (res.data as any).data });
    } catch (err) {
      console.error('fetchDashboard error:', err);
      dispatch({ type: ACTION_TYPES.SET_ERROR, error: 'Failed to load dashboard.' });
    } finally {
      hide();
    }
  };

  useEffect(() => {
    fetchDashboard(dateRange);
  }, [dateRange]);

  const d = state.data;

  function getGreeting(firstName: string): string {
    const hour = new Date().getHours();
    if (hour >= 0  && hour < 12) return `Good morning, ${firstName} ☀️`;
    if (hour >= 12 && hour < 19) return `Good afternoon, ${firstName} 👋`;
    return `Good evening, ${firstName} 🌙`;
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <div>
          <h1 className="text-white text-2xl font-extrabold tracking-tight">
            {getGreeting((person as any)?.fullName?.split(' ')[0] ?? 'there')}
          </h1>
          <div className="mt-2">
            <RangePicker
              value={dateRange}
              onChange={range => {
                setDateRange(range);
              }}
              placeholder="All time"
            />
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      {d && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardStatCard
            label="Net Worth"
            value={formatAmount(String(d.net_worth.value), currency)}
            changePct={d.net_worth.change_percent}
            changeLabel="all accounts"
          />
          <DashboardStatCard
            label="Total Income"
            value={formatAmount(String(d.total_income.value), currency)}
            changePct={d.total_income.change_percent}
            changeLabel="this period"
          />
          <DashboardStatCard
            label="Total Expenses"
            value={formatAmount(String(d.total_expenses.value), currency)}
            changePct={d.total_expenses.change_percent}
            changeLabel="this period"
          />
          <DashboardStatCard
            label="Savings Rate"
            value={`${d.savings_rate.value}%`}
            changePct={d.savings_rate.change_percent}
            changeLabel="of income"
          />
        </div>
      )}

      {/* Cash Flow + Spending Breakdown */}
      {d && (
        <div className="grid lg:grid-cols-[1fr_380px] gap-4">
          <CashFlowChart data={d.cash_flow} currency={currency} />
          <SpendingBreakdown data={d.spending_breakdown} currency={currency} />
        </div>
      )}

      {/* Recent Transactions */}
      {d && (
        <RecentTransactions
          transactions={d.recent_transactions}
          currency={currency}
        />
      )}

    </div>
  );
}