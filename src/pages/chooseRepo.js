// src/ChooseRepo.js
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/NoCodeBench.css";

function normalizeApiOrigin(input) {
  const raw = (input ?? "").trim();
  if (!raw) return "http://127.0.0.1:3001";
  let base = raw.replace(/\/+$/, "");
  if (base.endsWith("/api")) base = base.slice(0, -4);
  return base;
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

const POLL_INTERVAL_MS = 10000; // 10 s
const POLL_TIMEOUT_MS = 30 * 60 * 1000; //Wait a maximum of 30 minutes

const ChooseRepo = () => {
  const navigate = useNavigate();

  const API_ORIGIN = useMemo(
    () => normalizeApiOrigin(process.env.REACT_APP_API_BASE),
    []
  );

  const RUN_CUSTOM_URL = useMemo(() => {
    return `${API_ORIGIN}/api/tasks/run-custom-repo/`;
  }, [API_ORIGIN]);

  //------- Form Status -------
  const [manifestUrl, setManifestUrl] = useState("");
  const [manifestNote, setManifestNote] = useState("");
  const [urlTouched, setUrlTouched] = useState(false);

  // ------- UI Status -------
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ------- Polling status (same as SingleRepo)-------
  const [isPolling, setIsPolling] = useState(false);
  const [pollStatus, setPollStatus] = useState("PENDING");
  const [pollError, setPollError] = useState("");
  const [taskId, setTaskId] = useState(null);
  const [elapsedSec, setElapsedSec] = useState(0);

  const pollingAbortRef = useRef(null);
  const elapsedTimerRef = useRef(null);

  const isUrlValid = useMemo(
    () => isValidHttpUrl(manifestUrl.trim()),
    [manifestUrl]
  );

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // --- Polling: Jump to status only when result != null. ---
  const pollTaskUntilReady = async (newTaskId) => {
    const startedAt = Date.now();

    setIsPolling(true);
    setPollError("");
    setPollStatus("PENDING");
    setElapsedSec(0);

    // UI update wait time per second
    elapsedTimerRef.current = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    const controller = new AbortController();
    pollingAbortRef.current = controller;

    const TASK_URL = `${API_ORIGIN}/api/tasks/${newTaskId}/`;

    try {
      while (true) {
        if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
          throw new Error("Polling timeout. The run is taking too long.");
        }

        const res = await fetch(TASK_URL, {
          method: "GET",
          mode: "cors",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        const raw = await res.text();
        if (!res.ok) throw new Error(`Polling failed ${res.status}: ${raw}`);

        const data = raw ? JSON.parse(raw) : {};
        const status = data?.status ?? "UNKNOWN";
        const result = data?.result ?? null;

        setPollStatus(status);

        // The status check only occurs when the result is no longer null.
        if (result !== null) {
          localStorage.setItem("nocode_last_task_id", String(newTaskId));
          navigate("/statusAnalytics", { state: { taskId: newTaskId } });
          return;
        }

        // If the backend fails in the final state, go directly to the status page (and have the status page display error_details).
        if (
          status === "FAILED" ||
          status === "ERROR" ||
          status === "FAILED_TEST"
        ) {
          localStorage.setItem("nocode_last_task_id", String(newTaskId));
          navigate("/statusAnalytics", { state: { taskId: newTaskId } });
          return;
        }

        await sleep(POLL_INTERVAL_MS);
      }
    } finally {
      window.clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
      pollingAbortRef.current = null;
      setIsPolling(false);
    }
  };

  const handleCancelPolling = () => {
    try {
      pollingAbortRef.current?.abort();
    } catch {}
    window.clearInterval(elapsedTimerRef.current);
    elapsedTimerRef.current = null;

    setIsPolling(false);
    setSubmitting(false);
    setPollError("Cancelled.");
  };

  // --- POST: Submit a custom repository task ---
  const handleConfirm = async () => {
    setSubmitError("");
    setPollError("");

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
    if (submitting || isPolling) return;

    try {
      setSubmitting(true);

      const payload = { github_url, doc_change };

      console.log("[ChooseRepo] POST URL =", RUN_CUSTOM_URL);
      console.log("[ChooseRepo] POST payload =", payload);

      const res = await fetch(RUN_CUSTOM_URL, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      if (!res.ok) throw new Error(`Backend error ${res.status}: ${raw}`);

      const data = raw ? JSON.parse(raw) : {};
      const newTaskId = data?.id;
      if (!newTaskId) throw new Error("Missing task id in response.");

      setTaskId(newTaskId);
      localStorage.setItem("nocode_last_task_id", String(newTaskId));

      // Start polling (without skipping pages), and only jump to status when result != null.
      await pollTaskUntilReady(newTaskId);
    } catch (err) {
      console.error(err);
      setSubmitError(err?.message || "Failed to submit task.");
    } finally {
      setSubmitting(false);
    }
  };

  // unmount cleanup（To avoid leaving the page while still polling
  useEffect(() => {
    return () => {
      try {
        pollingAbortRef.current?.abort();
      } catch {}
      window.clearInterval(elapsedTimerRef.current);
    };
  }, []);

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
              Select a repository and provide a natural-language description of
              the intended feature change. The system will generate and analyze
              corresponding code modifications.
            </p>
          </div>
          <div className="choose-chip">Step 1 · Task specification</div>
        </header>

        <div className="choose-options">
          {/* left: built-in */}
          <button
            className="repo-card"
            onClick={() => navigate("/singleRepo")}
            disabled={submitting || isPolling}
          >
            <div className="repo-icon">📁</div>
            <h3 className="repo-title">Use Built-in Verified Tasks</h3>
            <div></div>
            <p className="repo-desc">
              Select a real software feature-addition task drawn from the
              NoCode-bench Verified subset.
            </p>
            <span className="repo-cta">
              Pick a task to see how automated editing compares to expected
              outcomes →
            </span>
          </button>

          {/* right: custom repo */}
          <div>
            <div className="repo-card" style={{ cursor: "default" }}>
              <div className="repo-icon">🔗</div>
              <h3 className="repo-title">
                Upload a GitHub Repo & Use Custom Instruction
              </h3>
              <p className="repo-desc">
                Enter the URL of a GitHub repository and a natural-language
                command describing how you want files modified.
              </p>

              <span className="repo-cta">
                {isUrlValid
                  ? "Enter the command. Be specific — the more precise your instruction, the better the model can locate relevant files."
                  : "Enter a GitHub URL"}
              </span>

              <input
                className="repo-input"
                type="url"
                placeholder="https://github.com/user/repo.git"
                value={manifestUrl}
                onChange={(e) => setManifestUrl(e.target.value)}
                onBlur={() => setUrlTouched(true)}
                disabled={submitting || isPolling}
              />

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
                    disabled={submitting || isPolling}
                  />

                  <div className="repo-detail-footer">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleConfirm}
                      disabled={submitting || isPolling}
                    >
                      <span className="btn-main-text">
                        {isPolling
                          ? "Running…"
                          : submitting
                          ? "Submitting…"
                          : "Run Task Evaluation"}
                      </span>
                      <span className="btn-sub-text">
                        {isPolling
                          ? "Waiting for backend results"
                          : "Generate and analyze code edits for this request"}
                      </span>
                    </button>

                    {isPolling && (
                      <button
                        className="btn btn-secondary"
                        onClick={handleCancelPolling}
                      >
                        <span className="btn-main-text">Cancel</span>
                        <span className="btn-sub-text">Stop waiting</span>
                      </button>
                    )}
                  </div>

                  {submitError && <div className="repo-error">{submitError}</div>}
                  {pollError && <div className="repo-error">{pollError}</div>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar to SingleRepo: use overlay + white card */}
        {isPolling && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: 20,
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: 16,
                padding: 18,
                maxWidth: 520,
                width: "100%",
                boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
                Running evaluation…
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                Task ID: <b>{taskId}</b>
                <br />
                Status: <b>{pollStatus}</b>
                <br />
                Elapsed: <b>{elapsedSec}s</b>
                <br />
                This can take 10–20 minutes. Please keep this tab open.
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                }}
              >
                <button className="btn btn-secondary" onClick={handleCancelPolling}>
                  <span className="btn-main-text">Cancel</span>
                  <span className="btn-sub-text">Stop waiting</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChooseRepo;