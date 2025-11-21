import { useNavigate } from 'react-router-dom';

const StatusAnalytics = () => {
    const navigate = useNavigate();
    return (
        <div className='center'>
            <div className='statusBox'>
                <div className='repoInfo'>
                    <div className='repoName'>
                        Repo Name
                        <div></div>
                    </div>

                    <div className='repoChanged'>
                        Repo Changed/ Marked
                        <div></div>
                    </div>
                </div>
                <div className='statusInfo'>
                    Status Results
                    <div></div>
                </div>
            </div>
            <button
                className='backButton'
                onClick={() => navigate("/")}
            >
                Done
            </button>
        </div>
    );
};
export default StatusAnalytics;