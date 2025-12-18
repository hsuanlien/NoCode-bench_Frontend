// src/SingleRepo.js
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/NoCodeBench.css";

const SingleRepo = () => {
  const navigate = useNavigate();
  const [pullRequests, setPullRequests] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // add submit flag

  // const API_BASE = process.env.REACT_APP_API_BASE ?? "http://localhost:3001";
  const API_BASE =
    (process.env.REACT_APP_API_BASE ?? "").replace(/\/+$/, "") ||
    "http://127.0.0.1:3001";

  const handleConfirm = async () => {
    if (!selectedRepo || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const res = await fetch(`${API_BASE}/api/tasks/run-demo/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 這裡用目前前端顯示的 instance_id
        body: JSON.stringify({ base_nocode_bench_id: selectedRepo }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backend error ${res.status}: ${text}`);
      }
      console.log("Evaluation started successfully");
      
      const data = await res.json();

      // 後端回傳的 task id（之後 Status 要用它來 GET /api/tasks/<id>/）
      const taskId = data?.id;
      if (!taskId) throw new Error("Missing task id in response.");

      // 存起來（全域可用）
      localStorage.setItem("nocode_last_task_id", String(taskId));
      // 如果你也想存選到的 instance_id
      localStorage.setItem("nocode_last_base_id", String(selectedRepo));

      // 直接把 taskId 帶去 status 頁!!
      navigate("/statusAnalytics", { state: { taskId } });

    } catch (err) {
      console.error(err);
      alert("Failed to start evaluation. Check console.");
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
      .catch(err => {
        console.error(err);
      });
  }, []);

  const currentRepo = pullRequests.find((r)=> r.instance_id === selectedRepo) ?? pullRequests[0] ?? null;
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
              Select one verified feature-addition task from the NoCode-bench dataset. Each task represents a real pull request, including a natural-language specification, corresponding code changes, and verification tests.
            </p>
          </div>
          <div className="choose-chip">Step 2 · Verified task selection</div>
        </header>

        <div className="single-layout">
          {/* 左邊：repo 列表 */}
          <div className="repo-list">
            {pullRequests.map((repo) => (
              <button
                key={repo.instance_id}
                className={`repo-list-item ${
                  repo.instance_id === selectedRepo ? "selected" : ""
                  }`}
                onClick={() => setSelectedRepo(repo.instance_id)}
              >
                <div className="repo-list-main">
                  <p className="repo-list-name">{repo.repo}</p>
                  <p className="repo-list-desc">{repo.case_number}</p>
                </div>
              </button>
            ))}
          </div>

          {/* 右邊：選中 repo 詳細資訊 */}
          <aside className="repo-detail">
            <div className="repo-detail-header">
              <span className="repo-badge">Selected task</span>
              <h3 className="repo-detail-name">{currentRepo.instance_id}</h3>
            </div>
            <div className="repo-detail-body">
              <p className="repo-detail-name">{currentRepo.title}</p>
              <p className="repo-detail-desc">Original pull request associated with: {currentRepo.url}</p>
              <div className="repo-detail-grid">
                <div>
                  <span className="repo-detail-label">Conversation</span>
                  <p className="repo-detail-value">{currentRepo.conversation}</p>
                </div>
                <div>
                  <span className="repo-detail-label">Commits</span>
                  <p className="repo-detail-value">{currentRepo.commits}</p>
                </div>
                <div>
                  <span className="repo-detail-label">Checks</span>
                  <p className="repo-detail-value">{currentRepo.checks}</p>
                </div>
              </div>
            </div>
            <div className="repo-detail-footer">
              <button
                className="btn btn-primary"
                onClick={handleConfirm}
                disabled={!selectedRepo || isSubmitting}
              >
                <span className="btn-main-text">
                  {isSubmitting ? "Starting…" : "Run Task Evaluation"}
                </span>
                <span className="btn-sub-text">
                  Generate and analyze code edits for this request
                </span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SingleRepo;