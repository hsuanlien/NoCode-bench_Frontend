// src/ChooseRepo.js
import { useNavigate } from "react-router-dom";
import { useRef, useState, useMemo } from "react";
import "../styles/NoCodeBench.css";

const API_BASE =
  (process.env.REACT_APP_API_BASE ?? "").replace(/\/+$/, "") ||
  "http://127.0.0.1:3001";

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
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
  // const [submitOk, setSubmitOk] = useState(false);

  const isUrlValid = useMemo(
    () => isValidHttpUrl(manifestUrl.trim()),
    [manifestUrl]
  );

    const handleConfirm = async () => {
    setSubmitError("");

    const github_url = manifestUrl.trim();
    const doc_change = manifestNote.trim();

    if (!isUrlValid) {
      setSubmitError("Please enter a valid GitHub URL.");
      return;
    }
    if (!doc_change) {
      setSubmitError("Please enter a feature description.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(
        `${API_BASE}/api/tasks/run-custom-repo/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ github_url, doc_change }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backend error ${res.status}: ${text}`);
      }

      const data = await res.json();

      // 🔑 這就是你要記住的 taskId
      const taskId = data.id;

      // 保險：給 Status 用（支援重新整理）
      localStorage.setItem("nocode_last_task_id", String(taskId));

      // 跳轉到 status（和 SingleRepo 一模一樣）
      navigate("/statusAnalytics", {
        state: { taskId },
      });
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || "Failed to submit task.");
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
{/* 左邊 built-in task 保持不動 */}
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
 {/* 右邊 custom repo */}
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
                placeholder="https://github.com/user/repo.git"
                value={manifestUrl}
                onChange={(e) => setManifestUrl(e.target.value)}
                onBlur={() => setUrlTouched(true)}
              />

              {/* {urlTouched && manifestUrl.trim() !== "" && !isUrlValid && (
                <div className="repo-error">Please enter a valid URL.</div>
              )} */}
              {urlTouched && !isUrlValid && (
              <div className="repo-error">Invalid URL.</div>
            )}

              {isUrlValid && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input
                    className="repo-input"
                    type="text"
                    placeholder="Describe the feature you want to add…"
                    value={manifestNote}
                    onChange={(e) => setManifestNote(e.target.value)}
                  />

                  <div className="repo-detail-footer">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleConfirm}
                      disabled={submitting}
                    >
                      <span className="btn-main-text">
                        {submitting ? "Submitting..." : "Run Task Evaluation"}</span>
                      <span className="btn-sub-text">
                  Generate and analyze code edits for this request
                </span>
                    </button>
                  </div>

                  {submitError && <div className="repo-error">{submitError}</div>}
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