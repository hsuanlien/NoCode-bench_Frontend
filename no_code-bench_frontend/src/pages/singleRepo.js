import { useNavigate } from 'react-router-dom';
import { useState } from "react";

const SingleRepo = () => {
    const navigate = useNavigate();
    // TODO: state to store selected option
    const [selectedRepo, setSelectedRepo] = useState("apple");

    const handleConfirm = async () => {
        // try {
        //     // TODO: send selectedRepo to backend
        //     const response = await fetch("http://localhost:4000/singleRepo", {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json",
        //         },
        //         body: JSON.stringify({ repo: selectedRepo }),
        //     });

        //     if (!response.ok) {
        //         throw new Error("Request failed");
        //     }

        //     // handle response data
        //     const data = await response.json();
        //     console.log("Server response:", data);

        //     navigate("/statusAnalytics");
        // } catch (err) {
        //     console.error("Error sending repo:", err);
        // }
        navigate("/statusAnalytics");
    };
    return (
        <div className="center">
            <div className='midColumn'>
                <div className='repoBox'>
                    <div>
                        <div className="title">
                            Choose the Repository
                        </div>
                        <select
                            className='repoSelect'
                            name="selectedFruit"
                            id="selectedFruit"
                            size={6}
                        >
                            <option value="apple">Apple</option>
                            <option value="banana">Banana</option>
                            <option value="orange">Orange</option>
                            <option value="apple">Apple</option>
                            <option value="banana">Banana</option>
                            <option value="orange">Orange</option>
                            <option value="apple">Apple</option>
                            <option value="banana">Banana</option>
                            <option value="orange">Orange</option>
                        </select>
                    </div>
                    <button onClick={handleConfirm}>
                        Confirm
                    </button>
                </div>
                <button
                    className='backButton'
                    onClick={() => navigate("/chooseRepo")}
                >
                    Back
                </button>
            </div>
        </div>

    );
};
export default SingleRepo;