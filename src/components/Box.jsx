// src/components/Box.jsx
import React from "react";
import Heading from "./Heading";
import colors from "../constants/colors";

const Box = ({ children, className = "", title, icon, ...props }) => {
  const boxStyle = {
    background: colors.toolbarBackground,
    borderBottom: `2px solid ${colors.border}`
  };

  return (
    <div className={`toolbar-section ${className}`} {...props}>
      {title && (
        <Heading level={2} icon={icon} style={boxStyle}>
          {title}
        </Heading>
      )}
      {children}
    </div>
  );
};

export default Box;