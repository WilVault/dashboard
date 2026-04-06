import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { formatAmount } from '../../utilities';

interface Props {
  data:     any[];
  currency: string;
}

function CustomTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0e0e1a] border border-[#2a2a3f] rounded-xl px-4 py-3 text-sm">
      <p className="text-[#4A4A68] text-xs mb-2">{label}</p>
      <p className="text-[#C9FA30] font-bold">
        {formatAmount(String(payload[0]?.value ?? 0), currency)}
      </p>
      <p className="text-[#F97316] font-bold">
        {formatAmount(String(payload[1]?.value ?? 0), currency)}
      </p>
    </div>
  );
}

function formatYAxis(value: number): string {
  if (value >= 1000) return `₱${(value / 1000).toFixed(0)}k`;
  return `₱${value}`;
}

export default function CashFlowChart({ data, currency }: Props) {
  const monthCount = data.length;

  return (
    <div className="bg-[#0C0C17] border border-[#1a1a2e] rounded-2xl p-6">
      <p className="text-white text-lg font-extrabold mb-1">Cash Flow</p>
      <p className="text-[#4A4A68] text-xs mb-6">
        Income vs Expenses · {monthCount} month{monthCount !== 1 ? 's' : ''}
      </p>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#C9FA30" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#C9FA30" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#F97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" vertical={false} />

          <XAxis
            dataKey="month"
            tick={{ fill: '#4A4A68', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fill: '#4A4A68', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={50}
          />

          <Tooltip content={<CustomTooltip currency={currency} />} />

          <Area
            type="monotone"
            dataKey="income"
            stroke="#C9FA30"
            strokeWidth={2}
            fill="url(#incomeGradient)"
            dot={false}
            activeDot={{ r: 5, fill: '#C9FA30' }}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="#F97316"
            strokeWidth={2}
            fill="url(#expensesGradient)"
            dot={false}
            activeDot={{ r: 5, fill: '#F97316' }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex gap-5 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#C9FA30]" />
          <p className="text-[#4A4A68] text-xs">Income</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
          <p className="text-[#4A4A68] text-xs">Expenses</p>
        </div>
      </div>
    </div>
  );
}