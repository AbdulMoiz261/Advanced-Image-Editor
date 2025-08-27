import React from "react";
import ImageEditor from "./ImageEditor";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <div className="header">
        <h1><i className="fas fa-image"></i> Advanced Image Editor</h1>
        <p>Edit your images with drawing, shapes and cropping tools</p>
      </div>
      <ImageEditor />
    </div>
  );
}

export default App;