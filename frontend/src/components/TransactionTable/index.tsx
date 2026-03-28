import { formatAmount } from '../../utilities';

interface TransactionTableProps {
  transactions: any[];
  pagination: {
    total:     number;
    page:      number;
    page_size: number;
    pages:     number;
  };
  currency: string;
  onPageChange: (page: number) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-PH', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

function CategoryBadge({ label, typeLabel }: { label: string; typeLabel: string }) {
  const isIncome = ['income', 'initial_balance'].includes(typeLabel?.toLowerCase());
  return (
    <span
      className={`text-xs font-bold px-3 py-1 rounded-full border ${
        isIncome
          ? 'bg-[#1a2e00] border-[#4a7a00] text-[#C9FA30]'
          : 'bg-transparent border-[#2a2a3f] text-[#888]'
      }`}
    >
      {label}
    </span>
  );
}

export default function TransactionTable({ transactions, pagination, currency, onPageChange }: TransactionTableProps) {
  return (
    <div>
      {/* Table */}
      <div className="w-full">

        {/* Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-4 pb-3 border-b border-[#1a1a2e]">
          {['Transaction', 'Category', 'Account', 'Date', 'Amount'].map(h => (
            <p key={h} className="text-[#4A4A68] text-xs font-semibold tracking-widest uppercase text-left last:text-right">
              {h}
            </p>
          ))}
        </div>

        {/* Rows */}
        {transactions.length === 0 ? (
          <div className="text-center text-[#4A4A68] text-sm py-12">No transactions found.</div>
        ) : (
          transactions.map((t: any) => {
            const isPositive = parseFloat(t.amount) >= 0;
            return (
              <div
                key={t.transactionId}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-4 py-4 border-b border-[#1a1a2e] hover:bg-[#0e0e1c] transition-colors items-center"
              >
                {/* Transaction */}
                <div className="flex items-center gap-3">
                  <span className="text-xl">{t.transactionCategory?.icon ?? '💳'}</span>
                  <span className="text-white text-sm font-semibold">{t.title}</span>
                </div>

                {/* Category */}
                <div>
                  <CategoryBadge
                    label={t.transactionCategory?.label ?? '—'}
                    typeLabel={t.transactionType?.label ?? ''}
                  />
                </div>

                {/* Account */}
                <p className="text-[#888] text-sm">{t.accountName}</p>

                {/* Date */}
                <p className="text-[#888] text-sm">{formatDate(t.transactionDate)}</p>

                {/* Amount */}
                <p className={`text-sm font-bold text-right ${isPositive ? 'text-[#C9FA30]' : 'text-[#FF4D4D]'}`}>
                  {isPositive ? '+' : '-'}{formatAmount(t.amount, currency)}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-between items-center mt-6 px-1">
          <p className="text-[#4A4A68] text-xs">
            Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-2 rounded-lg text-sm font-bold border border-[#1a1a2e] text-[#4A4A68] hover:text-white hover:border-[#4A4A68] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              ← Prev
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === pagination.pages || Math.abs(p - pagination.page) <= 1)
              .reduce<(number | string)[]>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="text-[#4A4A68] px-1">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => onPageChange(p as number)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                      pagination.page === p
                        ? 'bg-[#C9FA30] text-black'
                        : 'border border-[#1a1a2e] text-[#4A4A68] hover:text-white hover:border-[#4A4A68]'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-2 rounded-lg text-sm font-bold border border-[#1a1a2e] text-[#4A4A68] hover:text-white hover:border-[#4A4A68] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}