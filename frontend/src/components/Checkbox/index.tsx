import { useState } from "react";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

const Checkbox = ({ checked, onChange, label, disabled = false }: CheckboxProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        userSelect: "none",
      }}
    >
      {/* Box */}
      <div
        style={{
          width: "18px",
          height: "18px",
          minWidth: "18px",
          borderRadius: "5px",
          border: `1.5px solid ${checked ? "#C9FA30" : hovered ? "#C9FA30" : "#4A4A68"}`,
          background: checked ? "#C9FA30" : "#090911",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s ease",
        }}
      >
        {checked && (
          <svg
            width="11"
            height="11"
            viewBox="0 0 12 12"
            fill="none"
            stroke="#000"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="2 6 5 9 10 3" />
          </svg>
        )}
      </div>

      {/* Label */}
      {label && (
        <span
          style={{
            color: checked ? "#C9FA30" : "#4A4A68",
            fontSize: "13px",
            transition: "color 0.15s ease",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default Checkbox;