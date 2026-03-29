import { formatAmount } from '../../utilities';

interface Props {
  transaction: any;
  currency:    string;
  onClose:     () => void;
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-PH', {
    month: 'long',
    day:   'numeric',
    year:  'numeric',
  });
}

function formatDateTime(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-PH', {
    month:  'short',
    day:    'numeric',
    year:   'numeric',
    hour:   'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function TypeBadge({ label, description }: { label: string; description: string }) {
  const isIncome   = ['income', 'initial_balance'].includes(label?.toLowerCase());
  const isExpense  = label?.toLowerCase() === 'expense';
  const isTransfer = label?.toLowerCase() === 'transfer';

  const color = isIncome
    ? 'bg-[#1a2e00] border-[#4a7a00] text-[#C9FA30]'
    : isExpense
    ? 'bg-[#2e0000] border-[#7a0000] text-[#FF4D4D]'
    : isTransfer
    ? 'bg-[#001a2e] border-[#004a7a] text-[#4A9EFF]'
    : 'bg-transparent border-[#2a2a3f] text-[#888]';

  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${color}`}>
      {description || label}
    </span>
  );
}

export default function TransactionDetailModal({ transaction: t, currency, onClose }: Props) {
  const isPositive = parseFloat(t.amount) >= 0;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="bg-[#0C0C17] border border-[#1a1a2e] rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col">
          <div className="flex flex-1">

            {/* ── LEFT PANEL ── */}
            <div className="w-52 shrink-0 bg-[#07070f] border-r border-[#1a1a2e] flex flex-col items-center justify-center gap-3 px-6 py-8">
              <span className="text-5xl leading-none">{t.transactionCategory?.icon ?? '💳'}</span>
              <p className="text-white text-sm font-extrabold text-center tracking-tight">{t.title}</p>
              <p className={`text-2xl font-extrabold tracking-tight ${isPositive ? 'text-[#C9FA30]' : 'text-[#FF4D4D]'}`}>
                {isPositive ? '+' : '-'}{formatAmount(t.amount, currency)}
              </p>
              <TypeBadge
                label={t.transactionType?.label ?? ''}
                description={t.transactionType?.description ?? ''}
              />
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="flex-1 flex flex-col px-7 py-6">

              {/* Header */}
              <div className="flex justify-between items-center mb-5">
                <p className="text-[#4A4A68] text-[10px] font-bold tracking-widest uppercase">
                  Transaction Details
                </p>
                <button
                  onClick={onClose}
                  className="text-[#4A4A68] hover:text-white transition-colors cursor-pointer text-base leading-none"
                >
                  ✕
                </button>
              </div>

              {/* 2-column field grid */}
              <div className="grid grid-cols-2 flex-1">

                <div className="py-2.5 pr-6 border-b border-[#1a1a2e]">
                  <p className="text-[#4A4A68] text-[10px] font-bold tracking-widest uppercase mb-1">Category</p>
                  <p className="text-white text-sm font-semibold">
                    {t.transactionCategory?.icon} {t.transactionCategory?.label ?? '—'}
                  </p>
                </div>

                <div className="py-2.5 pl-6 border-b border-l border-[#1a1a2e]">
                  <p className="text-[#4A4A68] text-[10px] font-bold tracking-widest uppercase mb-1">Account</p>
                  <p className="text-white text-sm font-semibold">{t.accountName ?? '—'}</p>
                </div>

                <div className="py-2.5 pr-6 border-b border-[#1a1a2e]">
                  <p className="text-[#4A4A68] text-[10px] font-bold tracking-widest uppercase mb-1">Date</p>
                  <p className="text-white text-sm font-semibold">{formatDate(t.transactionDate)}</p>
                </div>

                <div className="py-2.5 pl-6 border-b border-l border-[#1a1a2e]">
                  <p className="text-[#4A4A68] text-[10px] font-bold tracking-widest uppercase mb-1">Ref ID (Transfers Only)</p>
                  {t.transferRefId
                    ? <p className="text-[#4A9EFF] text-xs font-mono">{t.transferRefId}</p>
                    : <p className="text-[#4A4A68] text-sm">—</p>
                  }
                </div>

                {t.description && (
                  <div className="py-2.5 col-span-2">
                    <p className="text-[#4A4A68] text-[10px] font-bold tracking-widest uppercase mb-1">Description</p>
                    <p className="text-white text-sm leading-relaxed">{t.description}</p>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="flex justify-between items-center mt-5 pt-4">
                <p className="text-[#4A4A68] text-xs">{formatDateTime(t.createdAt)}</p>
                <button
                  onClick={onClose}
                  className="text-[#4A4A68] hover:text-white border border-[#1a1a2e] hover:border-[#4A4A68] text-xs font-bold px-5 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}