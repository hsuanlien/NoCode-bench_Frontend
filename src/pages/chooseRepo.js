// src/ChooseRepo.js
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import "../styles/NoCodeBench.css";

const ChooseRepo = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const allowedExtensions = [".csv", ".json", ".js"];

  const handleUploadClick = () => {
    setError("");
    setStatus("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const validateFile = (file) => {
    if (!file) return "Please choose a file.";

    const name = file.name.toLowerCase();
    const ok = allowedExtensions.some((ext) => name.endsWith(ext));
    if (!ok) {
      return `Only ${allowedExtensions.join(", ")} files are allowed.`;
    }
    return "";
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      setStatus("");
      return;
    }

    // 原本就有的流程：檔案 OK -> 進到 /statusAnalytics
    navigate("/statusAnalytics");
  };

  return (
    <div className="page choose-repo-page">
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />

      <div className="glass-card choose-repo-card">
        <header className="choose-header">
          <div>
            <p className="breadcrumb" onClick={() => navigate("/")}>
              ⬅ Back to Home
            </p>
            <h2 className="choose-title">Select a repository</h2>
            <p className="choose-subtitle">
              Start by picking a single repo from your bench, or upload a
              manifest file that describes multiple projects.
            </p>
          </div>
          <div className="choose-chip">Step 1 · Repository source</div>
        </header>

        <div className="choose-options">
          <button
            className="repo-card"
            onClick={() => navigate("/singleRepo")}
          >
            <div className="repo-icon">📁</div>
            <h3 className="repo-title">Single repository</h3>
            <p className="repo-desc">
              Browse a list of benchmark repos and run an evaluation on one
              project.
            </p>
            <span className="repo-cta">Choose from list →</span>
          </button>

          <button className="repo-card" onClick={handleUploadClick}>
            <div className="repo-icon">⬆️</div>
            <h3 className="repo-title">Upload manifest</h3>
            <p className="repo-desc">
              Upload a <code>.csv</code>, <code>.json</code>, or{" "}
              <code>.js</code> file that describes multiple repositories and
              tasks.
            </p>
            <span className="repo-cta">Select file →</span>
          </button>

          {/* hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,.json,.js"
            style={{ display: "none" }}
          />
        </div>

        <footer className="choose-footer">
          {error && (
            <p className="message message-error">
              <span>⚠</span> {error}
            </p>
          )}
          {status && (
            <p className="message message-success">
              <span>✓</span> {status}
            </p>
          )}
          {!error && !status && (
            <p className="message message-muted">
              Only <code>.csv</code>, <code>.json</code>, or{" "}
              <code>.js</code> files are accepted for uploads.
            </p>
          )}
        </footer>
      </div>
    </div>
  );
};

export default ChooseRepo;