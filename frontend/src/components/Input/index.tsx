import React from "react";
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = ({ ...props }: InputProps) => {
  return (
    <input
      style={{
        background: "#090911",
        border: "1.5px solid #4A4A68",
        borderRadius: "10px",
        color: "white",
        fontSize: "14px",
        outline: "none",
        padding: "12px 16px",
        width: "100%",
        boxSizing: "border-box",
        transition: "border-color 0.15s ease",
      }}
      onFocus={e => {
        e.target.style.borderColor = "#C9FA30";
        props.onFocus?.(e);
      }}
      onBlur={e => {
        e.target.style.borderColor = "#4A4A68";
        props.onBlur?.(e);
      }}
      {...props}
    />
  );
};

export default Input;
