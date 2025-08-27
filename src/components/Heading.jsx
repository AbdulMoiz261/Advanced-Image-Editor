// src/components/Heading.jsx
import React from "react";
import colors from "../constants/colors";

const Heading = ({ level = 2, children, icon, className = "" }) => {
  const Tag = `h${level}`;
  const headingStyle = {
    color: colors.textPrimary
  };
  
  return (
    <Tag className={className} style={headingStyle}>
      {icon && <i className={icon}></i>}
      {children}
    </Tag>
  );
};

export default Heading;