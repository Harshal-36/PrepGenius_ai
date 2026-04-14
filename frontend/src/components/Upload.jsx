import React, { useState } from "react";
import axios from "axios";

function Upload({ token, setFileId }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const upload = async () => {
    if (!file) return alert("Please select a file to upload.");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/upload/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFileId(res.data.id);
      alert("File uploaded & processed successfully!");
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Session expired. Please click Logout and log in again.");
      } else {
        alert("Error uploading file.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-section">
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <div style={{ flex: 1 }}>
          <div className="file-upload-wrapper">
            <span className="file-upload-text">
              {fileName ? fileName : "Drag & drop or click to select a file (PDF, MP3, MP4)"}
            </span>
            <input type="file" onChange={handleFileChange} />
          </div>
        </div>
        <div style={{ marginLeft: "1rem", minWidth: "140px" }}>
          <button className="btn btn-primary" onClick={upload} disabled={loading || !file}>
            {loading ? "Processing..." : "Upload File"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Upload;