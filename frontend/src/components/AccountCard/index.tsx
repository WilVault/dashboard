import { formatAmount } from '../../utilities';

interface AccountCardProps {
  account:  any;
  currency: string;
  onClick:  () => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'No transactions yet';
  return new Date(dateStr).toLocaleDateString('en-PH', {
    month: 'short',
    day:   'numeric',
  });
}

export default function AccountCard({ account, currency, onClick }: AccountCardProps) {
  const color = account.color ?? '#C9FA30';

  return (
    <div
      className="bg-[#0C0C17] border border-[#1a1a2e] rounded-2xl p-5 flex flex-col gap-4 hover:border-[#2a2a3f] transition-all cursor-pointer relative overflow-hidden"
      style={{ borderColor: color + '33' }}
    >
      {/* subtle glow top left */}
      <div
        className="absolute -top-6 -left-6 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none"
        style={{ backgroundColor: color }}
      />

      {/* Top row — icon + type badge */}
      <div className="flex justify-between items-start relative z-10">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: color + '22', border: `1.5px solid ${color}44` }}
        >
          {account.icon ?? '🏦'}
        </div>
        <span className="text-[#4A4A68] text-xs font-semibold border border-[#1a1a2e] rounded-lg px-3 py-1">
          {account.accountType?.label ?? '—'}
        </span>
      </div>

      {/* Account name + balance */}
      <div className="relative z-10">
        <p className="text-[#888] text-sm mb-1">{account.accountName}</p>
        <p className="text-2xl font-extrabold tracking-tight" style={{ color }}>
          {formatAmount(String(account.balance ?? 0), currency)}
        </p>
      </div>

      {/* Bottom row — last date + details */}
      <div className="flex justify-between items-center relative z-10">
        <p className="text-[#4A4A68] text-xs">
          Last: {formatDate(account.lastTransactionDate)}
        </p>
        <button
          onClick={onClick}
          className="text-xs font-bold transition-opacity hover:opacity-70 cursor-pointer"
          style={{ color }}
        >
          Details →
        </button>
      </div>
    </div>
  );
}