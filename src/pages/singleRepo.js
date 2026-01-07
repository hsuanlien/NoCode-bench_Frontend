// src/SingleRepo.js
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

const POLL_INTERVAL_MS = 10000; 
const POLL_TIMEOUT_MS = 30 * 60 * 1000; // Wait a maximum of 30 minutes

const SingleRepo = () => {
  const navigate = useNavigate();

  const [pullRequests, setPullRequests] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);

  // UI 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pollStatus, setPollStatus] = useState("PENDING");
  const [pollError, setPollError] = useState("");
  const [taskId, setTaskId] = useState(null);
  const [elapsedSec, setElapsedSec] = useState(0);

  const API_ORIGIN = useMemo(
    () => normalizeApiOrigin(process.env.REACT_APP_API_BASE),
    []
  );

  const START_TASK_URL = useMemo(() => {
    return `${API_ORIGIN}/api/tasks/start-task/`;
  }, [API_ORIGIN]);

  const pollingAbortRef = useRef(null);
  const elapsedTimerRef = useRef(null);

  // --- The page jumps only when result != null. ---
  const pollTaskUntilReady = async (newTaskId) => {
    const startedAt = Date.now();
    setIsPolling(true);
    setPollError("");
    setPollStatus("PENDING");
    setElapsedSec(0);

    // Update wait time per second (pure UI)
    elapsedTimerRef.current = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    // abort controller(Can be stopped when leaving the page/cancelling)
    const controller = new AbortController();
    pollingAbortRef.current = controller;

    const TASK_URL = `${API_ORIGIN}/api/tasks/${newTaskId}/`;

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
        if (!res.ok) {
          throw new Error(`Polling failed ${res.status}: ${raw}`);
        }

        const data = raw ? JSON.parse(raw) : {};
        const status = data?.status ?? "UNKNOWN";
        const result = data?.result ?? null;

        setPollStatus(status);

        // desired condition: the page will only jump if the result is no longer null.
        if (result !== null) {
          // Remember the taskId so the status page can use it.
          localStorage.setItem("nocode_last_task_id", String(newTaskId));

          navigate("/statusAnalytics", { state: { taskId: newTaskId } });
          return;
        }

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
    setIsSubmitting(false);
    setPollError("Cancelled.");
  };

  const handleConfirm = async () => {
    if (!selectedRepo || isSubmitting || isPolling) return;

    try {
      setIsSubmitting(true);
      setPollError("");

      const payload = { nocode_bench_id: String(selectedRepo).trim() };

      console.log("[SingleRepo] POST URL =", START_TASK_URL);
      console.log("[SingleRepo] POST payload =", payload);

      const res = await fetch(START_TASK_URL, {
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
      localStorage.setItem("nocode_last_base_id", payload.nocode_bench_id);

      await pollTaskUntilReady(newTaskId);
    } catch (err) {
      console.error(err);
      setPollError(err?.message || "Failed to start evaluation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetch("requestOptions.json")
      .then((res) => res.json())
      .then((data) => {
        setPullRequests(data.pullRequests || []);
        setSelectedRepo(data.pullRequests?.[0]?.instance_id ?? null);
      })
      .catch((err) => console.error(err));

    // unmount cleanup
    return () => {
      try {
        pollingAbortRef.current?.abort();
      } catch {}
      window.clearInterval(elapsedTimerRef.current);
    };
  }, []);

  const currentRepo =
    pullRequests.find((r) => r.instance_id === selectedRepo) ??
    pullRequests[0] ??
    null;

  if (!currentRepo) return <div>Loading…</div>;

  return (
    <div className="page single-repo-page">
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />

      <div className="glass-card single-repo-card">
        <header className="choose-header">
          <div>
            <p className="breadcrumb" onClick={() => navigate("/chooseRepo")}>
              ⬅ Back to Task Specification
            </p>
            <h2 className="choose-title">Select a Verified Feature Request</h2>
            <p className="choose-subtitle">
              Select one verified feature-addition task from the NoCode-bench dataset.
            </p>
          </div>
          <div className="choose-chip">Step 2 · Verified task selection</div>
        </header>

        <div className="single-layout">
          <div className="repo-list">
            {pullRequests.map((repo) => (
              <button
                key={repo.instance_id}
                className={`repo-list-item ${
                  repo.instance_id === selectedRepo ? "selected" : ""
                }`}
                onClick={() => setSelectedRepo(repo.instance_id)}
                disabled={isSubmitting || isPolling}
              >
                <div className="repo-list-main">
                  <p className="repo-list-name">{repo.repo}</p>
                  <p className="repo-list-desc">{repo.case_number}</p>
                </div>
              </button>
            ))}
          </div>

          <aside className="repo-detail">
            <div className="repo-detail-header">
              <span className="repo-badge">Selected task</span>
              <h3 className="repo-detail-name">{currentRepo.instance_id}</h3>
            </div>

            <div className="repo-detail-body">
              <p className="repo-detail-name">{currentRepo.title}</p>
              <p className="repo-detail-desc">Original pull request: {currentRepo.url}</p>

              {pollError && (
                <div className="repo-error" style={{ marginTop: 10 }}>
                  {pollError}
                </div>
              )}
            </div>

            <div className="repo-detail-footer">
              <button
                className="btn btn-primary"
                onClick={handleConfirm}
                disabled={!selectedRepo || isSubmitting || isPolling}
              >
                <span className="btn-main-text">
                  {isPolling
                    ? "Running…"
                    : isSubmitting
                    ? "Starting…"
                    : "Run Task Evaluation"}
                </span>
                <span className="btn-sub-text">
                  {isPolling
                    ? "Waiting for backend results"
                    : "Generate and analyze code edits for this request"}
                </span>
              </button>

              {isPolling && (
                <button className="btn btn-secondary" onClick={handleCancelPolling}>
                  <span className="btn-main-text">Cancel</span>
                  <span className="btn-sub-text">Stop waiting</span>
                </button>
              )}
            </div>
          </aside>
        </div>

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

              <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "flex-end" }}>
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

export default SingleRepo;