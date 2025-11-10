import { useNavigate } from 'react-router-dom';

const UploadRepo = () => {
    const navigate = useNavigate();
    return (
        <div>
            <h2>Upload your Repo</h2>
            <button onClick={() => navigate("/chooseRepo")}>Back</button>
        </div>
    );
};
export default UploadRepo;