// src/ChooseRepo.js
import { useNavigate } from "react-router-dom";
import { useRef, useState, useMemo } from "react";
import "../styles/NoCodeBench.css";

function isValidHttpUrl(value) {
  if (!value) return false;

  // parsing check
  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) return false;

    return true;
  } catch {
    return false;
  }
}

const ChooseRepo = () => {
  const navigate = useNavigate();
  const [manifestUrl, setManifestUrl] = useState("");
  const [manifestNote, setManifestNote] = useState("");
  const [urlTouched, setUrlTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitOk, setSubmitOk] = useState(false);

  const isUrlValid = useMemo(
    () => isValidHttpUrl(manifestUrl.trim()),
    [manifestUrl]
  );

  const API_BASE = process.env.REACT_APP_API_BASE ?? "http://localhost:3001";

  const handleConfirm = async () => {
    setSubmitError("");
    setSubmitOk(false);

    const url = manifestUrl.trim();
    if (!isValidHttpUrl(url)) {
      setSubmitError("Please enter a valid http(s) URL.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          github_url: url,
          doc_change: manifestNote.trim() || manifestNote,
        }),
      });

      if (!res.ok) {
        // try to read server error message if it returns JSON/text
        let msg = `Request failed (${res.status})`;
        try {
          const data = await res.json();
          msg = data?.message || data?.error || msg;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      setSubmitOk(true);
      navigate("/statusAnalytics");
    } catch (e) {
      setSubmitError(e.message || "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
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
            <h2 className="choose-title">Specify a Feature Addition Task</h2>
            <p className="choose-subtitle">
              Select a repository and provide a natural-language description of the intended feature change. The system will generate and analyze corresponding code modifications.
            </p>
          </div>
          <div className="choose-chip">Step 1 · Task specification</div>
        </header>

        <div className="choose-options">
          <button
            className="repo-card"
            onClick={() => navigate("/singleRepo")}
          >
            <div className="repo-icon">📁</div>
            <h3 className="repo-title">Use Built-in Verified Tasks</h3>
            <div></div>
            <p className="repo-desc">
              Select a real software feature-addition task drawn from the NoCode-bench Verified subset — manually validated instances where documentation changes clearly map to code edits and verification tests.
            </p>
            <span className="repo-cta">Pick a task to see how automated editing compares to expected outcomes →</span>
          </button>

          <div>
            <div className="repo-card" style={{ cursor: "default" }}>
              <div className="repo-icon">🔗</div>
              <h3 className="repo-title">Upload a GitHub Repo & Use Custom Instruction</h3>
              <p className="repo-desc">
                Enter the URL of a GitHub repository and a natural-language command describing how you want files modified. Our engine will Analyze the repository structure, Generate code edits based on your instruction, and Present the modified code with analysis. This follows the same feature addition evaluation principles used in NoCode-bench: editorial clarity, code correctness, and result coverage.
              </p>
              <span className="repo-cta">{isUrlValid ? "Enter the command. Be specific — the more precise your instruction, the better the model can locate relevant files and generate correct edits." : "Enter a GitHub URL"}</span>

              <input
                className="repo-input"
                type="url"
                placeholder="https://github.com/example/example.git"
                value={manifestUrl}
                onChange={(e) => setManifestUrl(e.target.value)}
                onBlur={() => setUrlTouched(true)}
              />

              {urlTouched && manifestUrl.trim() !== "" && !isUrlValid && (
                <div className="repo-error">Please enter a valid URL.</div>
              )}

              {isUrlValid && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input
                    className="repo-input"
                    type="text"
                    placeholder="e.g., In the ... file, add a new variable 'x' and set it to 'Gemini'"
                    value={manifestNote}
                    onChange={(e) => setManifestNote(e.target.value)}
                  />

                  <div className="repo-detail-footer">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleConfirm}
                      disabled={submitting || !isUrlValid}
                    >
                      <span className="btn-main-text">{submitting ? "Submitting..." : "Run Task Evaluation"}</span>
                      <span className="btn-sub-text">
                  Generate and analyze code edits for this request
                </span>
                    </button>
                  </div>

                  {submitError && <div className="repo-error">{submitError}</div>}
                  {submitOk && <div className="repo-success">Submitted ✓</div>}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default ChooseRepo;