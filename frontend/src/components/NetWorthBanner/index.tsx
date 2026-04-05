import { formatAmount } from '../../utilities';

interface Props {
  data:     any;
  currency: string;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PH', {
    month: 'short',
    day:   'numeric',
  });
}

export default function NetWorthBanner({ data, currency }: Props) {
  if (!data) return null;

  const total         = data.total ?? 0;
  const accountCount  = data.account_count ?? 0;
  const lastUpdated   = data.last_updated ?? '';
  const changePct     = data.change_percent ?? 0;
  const byType        = data.by_type ?? [];
  const accounts      = data.accounts ?? [];
  const isPositive    = changePct >= 0;

  // proportional widths for breakdown bar
  const absTotal = accounts.reduce((sum: number, a: any) => sum + Math.abs(a.balance), 0);

  return (
    <div className="bg-[#0C0C17] border border-[#1a1a2e] rounded-2xl p-5 mb-6">

      {/* Top row — net worth + change badge */}
      <div className="flex justify-between items-start mb-1">
        <p className="text-[#4A4A68] text-xs font-semibold tracking-widest uppercase">Total Net Worth</p>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full border ${
            isPositive
              ? 'bg-[#1a2e00] border-[#4a7a00] text-[#C9FA30]'
              : 'bg-[#2e0000] border-[#7a0000] text-[#FF4D4D]'
          }`}
        >
          {isPositive ? '▲' : '▼'} {Math.abs(changePct)}% this month
        </span>
      </div>

      {/* Amount + meta */}
      <p className="text-[#C9FA30] text-4xl font-extrabold tracking-tight mb-1">
        {formatAmount(String(total), currency)}
      </p>
      <p className="text-[#4A4A68] text-xs mb-4">
        Across {accountCount} account{accountCount !== 1 ? 's' : ''} · Updated {formatDate(lastUpdated)}
      </p>

      {/* Main content: bar + type breakdown */}
      <div className="flex flex-col gap-3">

        {/* Breakdown bar */}
        {absTotal > 0 && (
          <div className="flex w-full h-2 rounded-full overflow-hidden gap-0.5">
            {accounts.map((a: any) => {
              const width = absTotal > 0 ? (Math.abs(a.balance) / absTotal) * 100 : 0;
              return (
                <div
                  key={a.accountId}
                  style={{ width: `${width}%`, backgroundColor: a.color ?? '#C9FA30' }}
                  className="h-full rounded-full"
                  title={`${a.accountName}: ${formatAmount(String(a.balance), currency)}`}
                />
              );
            })}
          </div>
        )}

        {/* Type totals + legend */}
        <div className="flex flex-wrap justify-between items-start gap-3">

          {/* Account type summary */}
          <div className="flex gap-6 flex-wrap">
            {byType.map((t: any) => (
              <div key={t.label}>
                <p className="text-[#4A4A68] text-[10px] font-bold tracking-widest uppercase mb-0.5">
                  {t.label}
                </p>
                <p className="text-white text-sm font-bold">
                  {formatAmount(String(t.total), currency)}
                </p>
              </div>
            ))}
          </div>

          {/* Legend dots */}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {accounts.map((a: any) => (
              <div key={a.accountId} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: a.color ?? '#C9FA30' }}
                />
                <p className="text-[#4A4A68] text-xs">{a.accountName}</p>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}