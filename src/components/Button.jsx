// src/components/Button.jsx
import React from "react";
import colors from "../constants/colors";

const Button = ({
  children,
  onClick,
  type = "primary",
  disabled = false,
  icon,
  className = "",
  ...props
}) => {
  const getButtonClass = () => {
    const baseClass = "btn";
    const typeClass = `btn-${type}`;
    return `${baseClass} ${typeClass} ${className}`.trim();
  };

  const buttonStyle = {
    background: colors[type]?.background || colors.primary.background,
    color: colors[type]?.text || colors.primary.text
  };

  return (
    <button
      className={getButtonClass()}
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <i className={icon}></i>}
      {children}
    </button>
  );
};

export default Button;