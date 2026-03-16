import { useState, useRef, useEffect } from "react";

interface Currency {
  currencyId: number;
  currency: string;
  description: string;
  emoji: string;
}

interface CurrencySelectProps {
  currencies: Currency[];
  value: number | null;
  onChange: (currencyId: number) => void;
  placeholder?: string;
}

const SelectCurrency = ({ currencies, value, onChange, placeholder = "Select a currency" }: CurrencySelectProps) => {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = currencies.find(c => c.currencyId === value) ?? null;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (currencyId: number) => {
    onChange(currencyId);
    setOpen(false);
    setFocused(false);
  };

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      {/* Trigger */}
      <div
        onClick={() => { setOpen(o => !o); setFocused(true); }}
        style={{
          width: "100%",
          background: "#090911",
          border: `1.5px solid ${focused || open ? "#C9FA30" : "#4A4A68"}`,
          borderRadius: open ? "10px 10px 0 0" : "10px",
          boxSizing: "border-box",
          transition: "border-color 0.15s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px 10px 16px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span style={{ color: selected ? "white" : "#4A4A68", fontSize: "14px" }}>
          {selected ? `${selected.emoji}  ${selected.currency} — ${selected.description}` : placeholder}
        </span>

        {/* Chevron */}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={focused || open ? "#C9FA30" : "#4A4A68"}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: "transform 0.2s ease, stroke 0.15s ease", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#090911",
            border: "1.5px solid #C9FA30",
            borderTop: "none",
            borderRadius: "0 0 10px 10px",
            zIndex: 50,
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {currencies.map((c, i) => (
            <div
              key={c.currencyId}
              onClick={() => handleSelect(c.currencyId)}
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                fontSize: "14px",
                color: c.currencyId === value ? "#C9FA30" : "white",
                background: c.currencyId === value ? "#0C0C17" : "transparent",
                borderTop: i !== 0 ? "1px solid #1a1a2e" : "none",
                transition: "background 0.1s ease",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#1a1a2e")}
              onMouseLeave={e => (e.currentTarget.style.background = c.currencyId === value ? "#0C0C17" : "transparent")}
            >
              <span>{c.emoji}</span>
              <span style={{ fontWeight: 600 }}>{c.currency}</span>
              <span style={{ color: "#4A4A68", fontSize: "12px" }}>{c.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectCurrency;
