interface Props {
  label:         string;
  value:         string;
  changePct:     number;
  changeLabel:   string;
}

export default function DashboardStatCard({ label, value, changePct, changeLabel }: Props) {
  const isPositive = changePct >= 0;

  return (
    <div className="bg-[#0C0C17] border border-[#1a1a2e] rounded-2xl p-5 flex flex-col gap-4">
      <p className="text-[#4A4A68] text-xs font-semibold tracking-widest uppercase">{label}</p>
      <p className="text-white text-3xl font-extrabold tracking-tight">{value}</p>
      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
            isPositive
              ? 'bg-[#1a2e00] border border-[#4a7a00] text-[#C9FA30]'
              : 'bg-[#2e0000] border border-[#7a0000] text-[#FF4D4D]'
          }`}
        >
          {isPositive ? '▲' : '▼'} {Math.abs(changePct)}%
        </span>
        <p className="text-[#4A4A68] text-xs">{changeLabel}</p>
      </div>
    </div>
  );
}