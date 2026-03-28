import { useState } from 'react';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const G = {
  bg:     '#07070f',
  border: '#18182a',
  text:   '#e8e8f5',
  muted:  '#4a4a6a',
  accent: '#c8f542',
};

// ─── TYPES ────────────────────────────────────────────────────────────────────
export interface DateRange {
  dateFrom: string; // "YYYY-MM-DD"
  dateTo:   string; // "YYYY-MM-DD"
}

interface InternalRange {
  from: Date;
  to:   Date | undefined;
}

interface RangePickerProps {
  value?:    DateRange;
  onChange:  (range: DateRange | undefined) => void;
  placeholder?: string;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toYMD(d: Date): string {
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day   = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromYMD(s: string): Date {
  const d = new Date(s + 'T00:00:00');
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmtDisplay(d: Date): string {
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── CALENDAR MONTH ───────────────────────────────────────────────────────────
interface CalendarMonthProps {
  year:       number;
  month:      number;
  range:      InternalRange | undefined;
  hovered:    Date | null;
  onDayClick: (d: Date) => void;
  onDayHover: (d: Date) => void;
}

function CalendarMonth({ year, month, range, hovered, onDayClick, onDayHover }: CalendarMonthProps) {
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today       = new Date(); today.setHours(0, 0, 0, 0);

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const inRange = (d: Date | null): boolean => {
    if (!d || !range?.from) return false;
    const to  = range.to ?? hovered;
    if (!to) return false;
    const lo  = range.from <= to ? range.from : to;
    const hi  = range.from <= to ? to : range.from;
    return d > lo && d < hi;
  };

  const isStart = (d: Date | null): boolean =>
    !!d && !!range?.from && d.getTime() === range.from.getTime();

  const isEnd = (d: Date | null): boolean => {
    if (!d || !range?.from) return false;
    const end = range.to ?? (hovered ?? null);
    return !!end && d.getTime() === end.getTime() && d.getTime() !== range.from.getTime();
  };

  const isToday = (d: Date | null): boolean =>
    !!d && d.getTime() === today.getTime();

  return (
    <div>
      {/* Month heading */}
      <div
        className="text-center text-[13px] font-bold mb-3"
        style={{ color: G.text, fontFamily: "'Syne', sans-serif" }}
      >
        {new Date(year, month).toLocaleString('default', { month: 'long' })} {year}
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map(w => (
          <div
            key={w}
            className="text-center text-[10px] uppercase tracking-widest pb-1"
            style={{ color: G.muted }}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          const start  = isStart(d);
          const end    = isEnd(d);
          const middle = inRange(d);
          const todayD = isToday(d);

          let bg           = 'transparent';
          let color        = G.text;
          let borderRadius = '7px';
          const cursor     = d ? 'pointer' : 'default';

          if (start || end)  { bg = G.accent; color = '#07070f'; }
          else if (middle)   { bg = '#1a2000'; color = G.accent; borderRadius = '0'; }
          if (start && (end || middle)) borderRadius = '7px 0 0 7px';
          if (end && (start || middle)) borderRadius = '0 7px 7px 0';

          return (
            <div
              key={i}
              style={{ background: middle ? '#1a2000' : 'transparent', borderRadius: middle ? 0 : undefined }}
            >
              <div
                onClick={()      => d && onDayClick(new Date(d))}
                onMouseEnter={()  => d && onDayHover(new Date(d))}
                style={{
                  width: 34, height: 34,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, cursor, borderRadius, background: bg, color,
                  fontWeight:  start || end ? 700 : 400,
                  border:      todayD && !start && !end ? '1px solid #2a2a3f' : 'none',
                  margin:      '0 auto',
                  transition:  'background 0.1s',
                  userSelect:  'none',
                  fontFamily:  "'DM Mono', monospace",
                }}
              >
                {d ? d.getDate() : ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── RANGE PICKER ─────────────────────────────────────────────────────────────
export default function RangePicker({ value, onChange, placeholder = 'All time' }: RangePickerProps) {
  const [open,      setOpen]      = useState(false);
  const [hovered,   setHovered]   = useState<Date | null>(null);

  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() > 0 ? today.getMonth() - 1 : 0);

  // Convert external DateRange → internal InternalRange
  const range: InternalRange | undefined = value
    ? { from: fromYMD(value.dateFrom), to: value.dateTo ? fromYMD(value.dateTo) : undefined }
    : undefined;

  const hasRange = !!range?.from;
  const label    = hasRange
    ? `${fmtDisplay(range!.from)} → ${range!.to ? fmtDisplay(range!.to) : '…'}`
    : placeholder;

  // Navigation
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const secondMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const secondYear  = viewMonth === 11 ? viewYear + 1 : viewYear;

  const handleDayClick = (d: Date) => {
    d.setHours(0, 0, 0, 0);

    if (!range?.from || (range.from && range.to)) {
      // Start a fresh selection
      onChange({ dateFrom: toYMD(d), dateTo: '' });
    } else {
      // Complete the range
      const from = range.from;
      if (d < from) {
        onChange({ dateFrom: toYMD(d), dateTo: toYMD(from) });
      } else {
        onChange({ dateFrom: toYMD(from), dateTo: toYMD(d) });
      }
      setOpen(false);
      setHovered(null);
    }
  };

  const handleHover = (d: Date) => {
    if (range?.from && !range?.to) {
      d.setHours(0, 0, 0, 0);
      setHovered(d);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setHovered(null);
  };

  const footerLabel = range?.from && !range?.to
    ? 'Now click an end date'
    : range?.from && range?.to
    ? `${fmtDisplay(range.from)} → ${fmtDisplay(range.to)}`
    : 'Click a start date';

  return (
    <div className="relative" style={{ fontFamily: "'DM Mono', monospace" }}>

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-[11px] px-3 py-1.75 rounded-[9px] transition-all"
        style={{
          background:     hasRange ? '#1a2000' : 'transparent',
          border:         `1px solid ${hasRange ? G.accent : G.border}`,
          color:          hasRange ? G.accent : '#777',
          fontFamily:     'inherit',
          letterSpacing:  '0.04em',
          whiteSpace:     'nowrap',
          cursor:         'pointer',
        }}
      >
        <span style={{ fontSize: 12 }}>📅</span>
        <span>{label}</span>
        {hasRange && (
          <span
            onClick={handleClear}
            style={{ marginLeft: 4, opacity: 0.6, lineHeight: 1, cursor: 'pointer' }}
          >
            ✕
          </span>
        )}
      </button>

      {/* Popover */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div
            className="absolute left-0 top-full mt-2 z-50 p-4 rounded-[14px]"
            style={{
              background:  '#0e0e1a',
              border:      '1px solid #2a2a3f',
              boxShadow:   '0 8px 32px rgba(0,0,0,0.6)',
              minWidth:    580,
            }}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Month navigation */}
            <div className="flex justify-between items-center mb-3">
              <button
                type="button"
                onClick={prevMonth}
                style={{ background: 'none', border: 'none', color: G.muted, cursor: 'pointer', fontSize: 18, padding: '0 8px' }}
              >
                ‹
              </button>
              <div />
              <button
                type="button"
                onClick={nextMonth}
                style={{ background: 'none', border: 'none', color: G.muted, cursor: 'pointer', fontSize: 18, padding: '0 8px' }}
              >
                ›
              </button>
            </div>

            {/* Two month calendars */}
            <div className="grid grid-cols-2 gap-6">
              <CalendarMonth
                year={viewYear}   month={viewMonth}
                range={range}     hovered={hovered}
                onDayClick={handleDayClick} onDayHover={handleHover}
              />
              <CalendarMonth
                year={secondYear}  month={secondMonth}
                range={range}      hovered={hovered}
                onDayClick={handleDayClick} onDayHover={handleHover}
              />
            </div>

            {/* Footer */}
            <div
              className="flex justify-between items-center mt-4 pt-3"
              style={{ borderTop: `1px solid ${G.border}` }}
            >
              <div className="text-[11px]" style={{ color: G.muted }}>{footerLabel}</div>
              {hasRange && (
                <button
                  type="button"
                  onClick={() => { onChange(undefined); setHovered(null); }}
                  className="text-[11px] px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: 'transparent',
                    border:     `1px solid ${G.border}`,
                    color:      G.muted,
                    fontFamily: 'inherit',
                    cursor:     'pointer',
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}