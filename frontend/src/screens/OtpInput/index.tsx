import { useRef } from "react";

interface OtpInputProps {
  value: string;
  onChange: (otp: string) => void;
  disabled?: boolean;
}

const OtpInput = ({ value, onChange, disabled = false }: OtpInputProps) => {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, "").slice(-1); // only digits, last char
    const arr = value.padEnd(6, " ").split("");
    arr[index] = digit || " ";
    const next = arr.join("").trimEnd();
    onChange(next);

    if (digit && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const arr = value.padEnd(6, " ").split("");
      if (arr[index].trim()) {
        arr[index] = " ";
        onChange(arr.join("").trimEnd());
      } else if (index > 0) {
        inputs.current[index - 1]?.focus();
        const prev = value.padEnd(6, " ").split("");
        prev[index - 1] = " ";
        onChange(prev.join("").trimEnd());
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, 5);
    inputs.current[focusIndex]?.focus();
  };

  return (
    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
      {Array.from({ length: 6 }).map((_, i) => {
        const digit = value[i] ?? "";
        const isFilled = digit.trim() !== "";

        return (
          <input
            key={i}
            ref={(el: HTMLInputElement | null) => { inputs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={handlePaste}
            style={{
              width: "48px",
              height: "56px",
              textAlign: "center",
              fontSize: "20px",
              fontWeight: "600",
              fontFamily: '"DM Mono", monospace',
              background: "#090911",
              border: `1.5px solid ${isFilled ? "#C9FA30" : "#4A4A68"}`,
              borderRadius: "10px",
              color: "#C9FA30",
              outline: "none",
              caretColor: "#C9FA30",
              transition: "border-color 0.15s ease",
              opacity: disabled ? 0.4 : 1,
              cursor: disabled ? "not-allowed" : "text",
            }}
            onFocus={e => (e.target.style.borderColor = "#C9FA30")}
            onBlur={e => (e.target.style.borderColor = isFilled ? "#C9FA30" : "#4A4A68")}
          />
        );
      })}
    </div>
  );
};

export default OtpInput;