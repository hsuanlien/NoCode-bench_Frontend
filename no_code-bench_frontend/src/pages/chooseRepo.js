import { useNavigate } from 'react-router-dom';
import { useRef, useState } from "react";

const ChooseRepo = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [error, setError] = useState("");
    const [status, setStatus] = useState("");

    const allowedExtensions = [".csv", ".json", ".js"];

    const handleUploadClick = () => {
        // reset messages
        setError("");
        setStatus("");

        // clear previous selection so same file can be re-selected
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
        // try {
        //     setError("");
        //     setStatus("Uploading...");

        //     const formData = new FormData();
        //     formData.append("file", file);

        //     // 🔴 TODO: change this to your real backend URL
        //     const response = await fetch("http://localhost:4000/chooseRepo", {
        //         method: "POST",
        //         body: formData,
        //     });

        //     if (!response.ok) {
        //         throw new Error("Upload failed");
        //     }

        //     setStatus("Upload successful!");
        //     navigate("/statusAnalytics");
        // } catch (err) {
        //     console.error(err);
        //     setStatus("");
        //     setError("Upload failed. Please try again.");
        // }
        navigate("/statusAnalytics");
    };

    return (
        <div className="center">
            <div className="buttonArea">
                <nav className="buttonRow">
                    <button
                        className="button"
                        onClick={() => navigate("/singleRepo")}>
                        Single
                    </button>

                    <button
                        className="button"
                        onClick={handleUploadClick}>
                        Upload
                    </button>
                    {/* hidden file input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".csv,.json, .js"
                        style={{ display: "none" }}
                    />
                </nav>
                <div className="messageArea">
                    {error && (
                        <p
                            style={{ color: "red", marginTop: "8px", }}
                            className='center'
                        >
                            {error}
                        </p>
                    )}
                    {status && (
                        <p
                            style={{ color: "green", marginTop: "8px" }}
                            className='center'
                        >
                            {status}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
export default ChooseRepo;