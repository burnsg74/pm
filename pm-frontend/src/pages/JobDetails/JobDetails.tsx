import React from "react";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/reducers';
import { Link,useNavigate } from "react-router-dom";
import "./JobDetails.css";

const JobDetailsPage: React.FC = () => {
    const navigate = useNavigate();
    const count = useSelector((state: RootState) => state.counter.count);
    const dispatch = useDispatch();

    React.useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === "1") {
                navigate('/jobs');
            }
        };

        window.addEventListener("keydown", handleKeyPress);

        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, []);
    
    return (
        <div className="grid-container">
            {/*<div>*/}
            {/*    <h1>Count: {count}</h1>*/}
            {/*    <button onClick={() => dispatch({type: 'INCREMENT'})}>Increment</button>*/}
            {/*    <button onClick={() => dispatch({type: 'DECREMENT'})}>Decrement</button>*/}
            {/*</div>*/}
            <Link to={"/jobs/New"} className="link">
                <div className="card">
                    <div className="badge">
                        1
                    </div>
                    <div className="card-link">
                        New Jobs
                    </div>
                </div>
            </Link>
            <Link to={"/jobs/Applied"} className="link">
                <div className="card">
                    <div className="badge">
                        2
                    </div>
                    <div className="card-link">
                        Job Applied
                    </div>
                </div>
            </Link>
            <Link to={"/jobs/Deleted"} className="link">
                <div className="card">
                    <div className="badge">
                        3
                    </div>
                    <div className="card-link">
                        Deleted Jobs
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default JobDetailsPage;