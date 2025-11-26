// src/SingleRepo.js
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/NoCodeBench.css";

const repoOptions = [
  {
    id: "apple",
    name: "apple/nocode-doc-patch",
    description:
      "A sample repository where agents apply documentation-driven patches to a TypeScript codebase.",
    language: "TypeScript",
    stars: "3.2k",
    lastRun: "Last run: 5 mins ago",
  },
  {
    id: "banana",
    name: "banana/agent-eval-playground",
    description:
      "Multi-task benchmark with unit tests focused on refactoring and behavior-preserving edits.",
    language: "Python",
    stars: "1.1k",
    lastRun: "Last run: 2 hours ago",
  },
  {
    id: "orange",
    name: "orange/regression-guard-suite",
    description:
      "Stress tests for agents applying doc changes across monorepo modules with CI integration.",
    language: "Monorepo (mix)",
    stars: "890",
    lastRun: "No runs yet",
  },
];

const SingleRepo = () => {
  const navigate = useNavigate();
  const [selectedRepo, setSelectedRepo] = useState(repoOptions[0].id);

  const handleConfirm = async () => {
    // 日後要打 backend 的話，可以在這裡用 selectedRepo 呼叫 API
    // 現在先維持原本行為：直接跳 statusAnalytics
    navigate("/statusAnalytics");
  };

  const currentRepo =
    repoOptions.find((repo) => repo.id === selectedRepo) || repoOptions[0];

  return (
    <div className="page single-repo-page">
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />

      <div className="glass-card single-repo-card">
        <header className="choose-header">
          <div>
            <p className="breadcrumb" onClick={() => navigate("/chooseRepo")}>
              ⬅ Back to repository source
            </p>
            <h2 className="choose-title">Choose a benchmark repository</h2>
            <p className="choose-subtitle">
              Pick a single repository from your NoCode-bench collection to
              run an evaluation. Each repo comes with documentation changes and
              test suites.
            </p>
          </div>
          <div className="choose-chip">Step 2 · Select repo</div>
        </header>

        <div className="single-layout">
          {/* 左邊：repo 列表 */}
          <div className="repo-list">
            {repoOptions.map((repo) => (
              <button
                key={repo.id}
                className={`repo-list-item ${
                  repo.id === selectedRepo ? "selected" : ""
                }`}
                onClick={() => setSelectedRepo(repo.id)}
              >
                <div className="repo-list-main">
                  <p className="repo-list-name">{repo.name}</p>
                  <p className="repo-list-desc">{repo.description}</p>
                </div>
                <div className="repo-list-meta">
                  <span className="repo-tag">{repo.language}</span>
                  <span className="repo-tag subtle">⭐ {repo.stars}</span>
                </div>
              </button>
            ))}
          </div>

          {/* 右邊：選中 repo 詳細資訊 */}
          <aside className="repo-detail">
            <div className="repo-detail-header">
              <span className="repo-badge">Selected repo</span>
              <h3 className="repo-detail-name">{currentRepo.name}</h3>
            </div>
            <div className="repo-detail-body">
              <p className="repo-detail-desc">{currentRepo.description}</p>
              <div className="repo-detail-grid">
                <div>
                  <span className="repo-detail-label">Primary language</span>
                  <p className="repo-detail-value">{currentRepo.language}</p>
                </div>
                <div>
                  <span className="repo-detail-label">Stars</span>
                  <p className="repo-detail-value">{currentRepo.stars}</p>
                </div>
                <div>
                  <span className="repo-detail-label">Status</span>
                  <p className="repo-detail-value">{currentRepo.lastRun}</p>
                </div>
              </div>
            </div>
            <div className="repo-detail-footer">
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/chooseRepo")}
              >
                Back
              </button>
              <button className="btn btn-primary" onClick={handleConfirm}>
                <span className="btn-main-text">Run evaluation</span>
                <span className="btn-sub-text">
                  Use this repo and go to status
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