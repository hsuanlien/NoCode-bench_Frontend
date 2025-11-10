import { Link } from 'react-router-dom';

const ChooseRepo = () => {
    return (
        <div>
            <h1>Choose Repository</h1>
            <nav style={{ marginBottom: '20px' }}>
                <Link to="/singleRepo">SingleRepo</Link> |{" "}
                <Link to="/uploadRepo">UploadRepo</Link>
            </nav>
        </div>
    );
};
export default ChooseRepo;