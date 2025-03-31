import React from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from "react-router-dom";
import "./JobDetails.css";

const JobDetailsPage = () => {
    const navigate = useNavigate();
    const count = useSelector((state) => state.counter.count);
    const dispatch = useDispatch();

    React.useEffect(() => {
        const handleKeyPress = (event) => {
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
            <Link to={"/jobs/New"} className="link">
                <div className="card">
                    <div className="badge">1</div>
                    <div className="card-link">New Jobs</div>
                </div>
            </Link>
            <Link to={"/jobs/Applied"} className="link">
                <div className="card">
                    <div className="badge">2</div>
                    <div className="card-link">Job Applied</div>
                </div>
            </Link>
            <Link to={"/jobs/Deleted"} className="link">
                <div className="card">
                    <div className="badge">3</div>
                    <div className="card-link">Deleted Jobs</div>
                </div>
            </Link>
        </div>
    );
};

export default JobDetailsPage;