// src/pages/home.js
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import "../styles/NoCodeBench.css";

const Home = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/chooseRepo");
  };

  return (
    <div className="page home-page">
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />

      <div className="glass-card home-hero">
        {/* 上半部：主視覺 */}
        <div className="home-hero-top">
          <div className="home-logo-wrap">
            <img src={logo} alt="NoCode-bench logo" className="home-logo" />
          </div>

          <div className="home-title-block">
            <span className="home-badge">NoCode-bench · AI Agent Lab</span>
            <h1 className="home-title">
              From docs to <span>passing tests.</span>
            </h1>
            <p className="home-subtitle">
              Build and evaluate agents that read documentation changes and
              automatically implement the corresponding code updates — until
              your project tests turn green.
            </p>
          </div>

          <div className="home-actions">
            <button className="btn btn-primary" onClick={handleStart}>
              <span className="btn-main-text">Choose repository</span>
              <span className="btn-sub-text">Start an evaluation run</span>
            </button>

            <div className="home-meta">
              <div className="meta-pill">
                <span className="dot dot-green" />
                Tests-driven
              </div>
              <div className="meta-pill">
                <span className="dot dot-cyan" />
                No-code orchestration
              </div>
            </div>
          </div>
        </div>

        {/* 下半部：Agent pipeline 卡片（不再是右側一大塊） */}
        <div className="home-hero-panel-wrap">
          <div className="home-panel">
            <div className="panel-header">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <div className="panel-body">
              <p className="panel-label">Agent pipeline</p>
              <ul className="pipeline-list">
                <li>
                  <span className="pipeline-step-index">1</span>
                  <div>
                    <p className="pipeline-step-title">Watch docs change</p>
                    <p className="pipeline-step-desc">
                      Detect diffs in README, API docs, or design specs.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="pipeline-step-index">2</span>
                  <div>
                    <p className="pipeline-step-title">Apply code edits</p>
                    <p className="pipeline-step-desc">
                      Generate patches across the repository automatically.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="pipeline-step-index">3</span>
                  <div>
                    <p className="pipeline-step-title">Run tests &amp; score</p>
                    <p className="pipeline-step-desc">
                      Evaluate your agent on pass rate and regression safety.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <p className="home-watermark">NoCode-bench · Evaluation Dashboard</p>
        </div>
      </div>
    </div>
  );
};

export default Home;