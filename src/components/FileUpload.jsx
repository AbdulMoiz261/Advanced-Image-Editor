// src/components/FileUpload.jsx
import React from "react";
import colors from "../constants/colors";

const FileUpload = ({ onFileSelect, accept = "image/*", id = "file-upload" }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const labelStyle = {
    background: colors.upload.background,
    color: colors.upload.text
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={handleFileChange} 
        id={id} 
        className="file-input" 
        accept={accept}
      />
      <label htmlFor={id} className="file-label" style={labelStyle}>
        <i className="fas fa-cloud-upload-alt"></i> Choose Image
      </label>
    </div>
  );
};

export default FileUpload;