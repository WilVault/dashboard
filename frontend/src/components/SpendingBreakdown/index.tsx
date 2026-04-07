import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatAmount } from '../../utilities';

interface Props {
  data:     any[];
  currency: string;
}

const COLORS = [
  '#EAB308', '#C9FA30', '#EF4444', '#A855F7',
  '#4A9EFF', '#22C55E', '#F97316', '#EC4899',
  '#14B8A6', '#6366F1',
];

function CustomTooltip({ active, payload, currency }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#0e0e1a] border border-[#2a2a3f] rounded-xl px-4 py-3 text-sm">
      <p className="text-white font-bold">{d.icon} {d.category}</p>
      <p className="text-[#4A4A68] text-xs mt-1">{formatAmount(String(d.amount), currency)}</p>
    </div>
  );
}

export default function SpendingBreakdown({ data, currency }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#0C0C17] border border-[#1a1a2e] rounded-2xl p-6 flex flex-col items-center justify-center min-h-75">
        <p className="text-[#4A4A68] text-sm">No spending data for this period.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0C0C17] border border-[#1a1a2e] rounded-2xl p-6">
      <p className="text-white text-lg font-extrabold mb-1">Spending Breakdown</p>
      <p className="text-[#4A4A68] text-xs mb-4">By category · selected period</p>

      {/* Donut */}
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="amount"
          >
            {data.map((_: any, i: number) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip currency={currency} />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Category list */}
      <div className="mt-4 space-y-2">
        {data.map((item: any, i: number) => (
          <div key={item.category} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <p className="text-[#888] text-sm">{item.icon} {item.category}</p>
            </div>
            <p className="text-white text-sm font-semibold">
              {formatAmount(String(item.amount), currency)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}