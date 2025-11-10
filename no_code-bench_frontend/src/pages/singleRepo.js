import { useNavigate } from 'react-router-dom';

const SingleRepo = () => {
    const navigate = useNavigate();
    return (
        <div>
            <h2>Choose from existing 144 Repos</h2>
            <button onClick={() => navigate("/chooseRepo")}>Back</button>
        </div>

    );
};
export default SingleRepo;