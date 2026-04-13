import { useNavigate } from 'react-router-dom';
import { formatAmount } from '../../utilities';

interface Props {
  transactions: any[];
  currency:     string;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PH', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

export default function RecentTransactions({ transactions, currency }: Props) {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0C0C17] border border-[#1a1a2e] rounded-2xl p-6">

      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <p className="text-white text-lg font-extrabold">Recent Transactions</p>
          <p className="text-[#4A4A68] text-xs mt-0.5">Last {transactions.length} entries</p>
        </div>
        <button
          onClick={() => navigate('/transactions')}
          className="text-xs font-bold text-[#4A4A68] border border-[#1a1a2e] px-4 py-2 rounded-xl hover:text-white hover:border-[#4A4A68] transition-all cursor-pointer"
        >
          View all →
        </button>
      </div>

      {/* List */}
      {transactions.length === 0 ? (
        <p className="text-[#4A4A68] text-sm text-center py-8">No recent transactions.</p>
      ) : (
        <div className="space-y-1">
          {transactions.map((t: any) => {
            const isPositive = t.amount >= 0;
            return (
              <div
                key={t.id}
                className="flex justify-between items-center py-3 border-b border-[#1a1a2e] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#07070f] border border-[#1a1a2e] flex items-center justify-center text-lg shrink-0">
                    {t.transaction_category_icon ?? '💳'}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{t.title}</p>
                    <p className="text-[#4A4A68] text-xs">
                      {t.transaction_category} · {formatDate(t.transaction_date)}
                    </p>
                  </div>
                </div>
                <p className={`text-sm font-bold ${isPositive ? 'text-[#C9FA30]' : 'text-[#FF4D4D]'}`}>
                  {isPositive ? '+' : '-'}{formatAmount(String(t.amount), currency)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}