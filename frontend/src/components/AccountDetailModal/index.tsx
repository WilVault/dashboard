import { useEffect, useState } from 'react';
import { getAccountTransactions, deleteAccount } from '../../services/accounts';
import { useLoader } from '../../context/LoaderContext';
import { useSession } from '../../context/SessionContext';
import { formatAmount } from '../../utilities';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Props {
  account:   any;
  onClose:   () => void;
  onDeleted: () => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PH', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

export default function AccountDetailModal({ account, onClose, onDeleted }: Props) {
  const { show, hide } = useLoader();
  const { person } = useSession();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const navigate = useNavigate();

  const currency = (person as any)?.currency?.currency ?? 'PHP';
  const color    = account.color ?? '#C9FA30';

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAccountTransactions(account.accountId);
        const data = (res.data as any).data.transactions;
        setTransactions(data.slice(0, 5));
      } catch (err) {
        console.error('fetchAccountTransactions error:', err);
      }
    };
    fetch();
  }, [account.accountId]);

  const handleDelete = async () => {
    show('Deleting account...');
    try {
      await deleteAccount(account.accountId);
      toast.success('Account deleted.');
      onDeleted();
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Failed to delete account.';
      toast.error(message);
    } finally {
      hide();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-[#0C0C17] border rounded-3xl w-full max-w-3xl overflow-hidden flex"
          style={{ borderColor: color + '33' }}
        >

          {/* ── LEFT PANEL — account info ── */}
          <div
            className="w-64 shrink-0 flex flex-col p-6 relative overflow-hidden"
            style={{ background: `linear-gradient(160deg, ${color}18 0%, #07070f 65%)` }}
          >
            {/* glow */}
            <div
              className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-25 pointer-events-none"
              style={{ backgroundColor: color }}
            />

            {/* Icon */}
            <div className="relative z-10 flex flex-col items-center mt-4 mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
                style={{ backgroundColor: color + '22', border: `2px solid ${color}55` }}
              >
                {account.icon ?? '🏦'}
              </div>
              <p className="text-white font-extrabold text-lg text-center leading-tight">
                {account.accountName}
              </p>
              <span className="mt-2 text-[10px] font-semibold tracking-widest border rounded-lg px-3 py-1 text-[#4A4A68] border-[#1a1a2e]">
                {account.accountType?.label ?? '—'}
              </span>
            </div>

            {/* Balance */}
            <div className="relative z-10 bg-[#07070f] border border-[#1a1a2e] rounded-2xl p-4 mb-4">
              <p className="text-[#4A4A68] text-[10px] font-bold tracking-widest uppercase mb-1">Balance</p>
              <p className="text-2xl font-extrabold tracking-tight" style={{ color }}>
                {formatAmount(String(account.balance ?? 0), currency)}
              </p>
            </div>

            {/* Last transaction */}
            <div className="relative z-10">
              <p className="text-[#4A4A68] text-[10px] font-bold tracking-widest uppercase mb-1">Last Transaction</p>
              <p className="text-white text-sm font-semibold">
                {formatDate(account.lastTransactionDate)}
              </p>
            </div>

            {/* Delete — pinned to bottom */}
            <div className="relative z-10 mt-auto pt-6">
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full py-2.5 rounded-xl text-sm font-bold border border-[#FF4D4D] text-[#FF4D4D] hover:bg-[#FF4D4D] hover:text-white transition-all cursor-pointer"
                >
                  Delete Account
                </button>
              ) : (
                <div className="bg-[#2e0000] border border-[#FF4D4D] rounded-xl p-3">
                  <p className="text-white text-xs font-semibold text-center mb-1">Are you sure?</p>
                  <p className="text-[#4A4A68] text-[10px] text-center mb-3">
                    Deletes account and all transactions.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="py-2 rounded-lg text-xs font-bold border border-[#1a1a2e] text-[#4A4A68] hover:text-white transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="py-2 rounded-lg text-xs font-bold bg-[#FF4D4D] text-white hover:opacity-70 transition-opacity cursor-pointer"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT PANEL — recent transactions ── */}
          <div className="flex-1 flex flex-col border-l border-[#1a1a2e]">

            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-[#1a1a2e]">
              <div>
                <p className="text-white font-extrabold text-base tracking-tight">Recent Transactions</p>
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/transactions?accountName=${encodeURIComponent(account.accountName)}`);
                  }}
                  className="text-[#4A4A68] text-xs hover:text-white transition-colors cursor-pointer mt-0.5"
                >
                  View all →
                </button>
              </div>
              <button onClick={onClose} className="text-[#4A4A68] hover:text-white transition-colors cursor-pointer text-lg">✕</button>
            </div>

            {/* Transaction list */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-[#4A4A68] text-sm">No transactions yet.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {transactions.map((t: any) => {
                    const isPositive = parseFloat(t.amount) >= 0;
                    return (
                      <div
                        key={t.transactionId}
                        className="flex justify-between items-center py-3 border-b border-[#1a1a2e] last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#07070f] border border-[#1a1a2e] flex items-center justify-center text-lg shrink-0">
                            {t.transactionCategory?.icon ?? '💳'}
                          </div>
                          <div>
                            <p className="text-white text-sm font-semibold mt-2">{t.title}</p>
                            <p className="text-[#4A4A68] text-xs">{formatDate(t.transactionDate)}</p>
                          </div>
                        </div>
                        <p className={`text-sm font-bold ${isPositive ? 'text-[#C9FA30]' : 'text-[#FF4D4D]'}`}>
                          {isPositive ? '+' : '-'}{formatAmount(t.amount, currency)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </>
  );
}