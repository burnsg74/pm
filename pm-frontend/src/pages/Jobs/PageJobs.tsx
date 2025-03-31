import React, {useEffect} from "react";
import { useNavigate } from 'react-router-dom';
import {useDispatch, useSelector} from "react-redux";
import {SET_ALL_COUNTERS} from "../../store/store.js";
import styles from "./styles.module.css";

const API_BASE_URL = import.meta.env.VITE_API_URL;
export default () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const counters = useSelector((state) => state.jobCounters.counters);

    useEffect(() => {
        async function fetchData() {
            const response = await fetch(`${API_BASE_URL}/api/jobs/counters`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return response.json();
        }

        fetchData()
            .then((data) => {
                console.log(data);
                dispatch({type: SET_ALL_COUNTERS, payload: data});
            })
            .catch((error) => {
                console.error(error);
            });
    }, [dispatch]);

    return (
            <div className="container-fluid" style={{padding: "10px", margin: "10px"}}>

                <button
                    className={styles.applyForNewJobsButtons} // Use the button's CSS class
                    onClick={() => navigate('/jobs/apply-for-new-jobs')} // Use navigate instead of window.location.href
                    style={{
                        fontSize: '18px',
                        padding: '15px 30px',
                        borderRadius: '5px',
                    }}
                >
                    Apply for New Jobs
                </button>

            </div>
    );
};