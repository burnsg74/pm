import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const HomePage: React.FC = () => {
    return (
        <div className="grid-container">
            <Link to={"/jobs"} className="link">
            <div className="card">
                <div className="card-link">
                    Jobs
                </div>
            </div>
            </Link>
        </div>
    );
};

export default HomePage;