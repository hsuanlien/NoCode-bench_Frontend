## NoCode-bench — Frontend

The NoCode-bench Frontend is a browser-based user interface for interacting with the NoCode-bench evaluation system.
It enables users to define documentation-driven feature addition tasks, trigger automated evaluations, and inspect generated code patches and evaluation results through a unified web interface.

* Live Demo: [https://no-code-bench-frontend.vercel.app]
* Deployment: Hosted on Vercel
* Backend: Connected to the NoCode-bench evaluation API
* Supported Tasks:
  * Verified NoCode-bench benchmark tasks
  * Custom feature requests on arbitrary GitHub repositories

This frontend is designed to require no local setup or configuration. All interactions—from task specification to result inspection—are performed directly in the browser

1. Platform Overview

NoCode-bench is a web-based evaluation platform for documentation-driven code changes.
The frontend serves as the primary interaction layer, allowing users to:

* Specify a feature addition task using natural language
* Trigger a fully automated evaluation workflow
* Inspect generated code changes and evaluation outcomes

From the user’s perspective, the system abstracts away repository cloning, code modification, and test execution. Users focus only on task definition and result interpretation, while all execution logic is handled by the backend.

2. Typical User Flow (Quick Guide)
Step 1: Home Page
    Start from the landing page and click “Define a Feature Addition Task”.

Step 2: Choose Task Type
Users can select one of two task specification modes:
* Built-in Verified Tasks
    - Choose from curated NoCode-bench benchmark instances derived from real-world documentation changes.
    - No additional input is required.
* Custom GitHub Repository
    - Provide a GitHub repository URL.
    - Describe the intended feature change in natural language.

Step 3: Run Evaluation
* Click “Run Task Evaluation”.
* The frontend submits the task to the backend.
* Execution typically takes 10–20 minutes, depending on repository size and test complexity.
* A loading view displays task status and elapsed time.

Step 4: View Results
Once execution completes, users are redirected to the results page, where they can:
Inspect the generated code patch (diff view)
    - Green lines indicate added code
    - Red lines indicate removed code
Review evaluation outcomes and metrics based on test execution

Step 5: Exit or Restart
* Users may return to the home page to define and run another task.

3. Project Structure Highlights
src/
├── pages/                # All major pages
│   ├── home.js            # Landing page
│   ├── chooseRepo.js      # Task specification (built-in & custom)
│   ├── singleRepo.js      # Verified task selection & execution
│   └── status.js          # Evaluation results & patch viewer
│
├── styles/
│   ├── NoCodeBench.css    # Main styling
│   └── App.css
│
├── App.js                 # Main routing setup
├── index.js               # App entry point
└── index.css


3. Notes & Limitations
* Evaluation tasks may take 10–20 minutes depending on repository size and test complexity.
* Results depend on the quality of existing tests in the target repository.