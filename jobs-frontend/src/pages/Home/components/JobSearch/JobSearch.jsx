import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import styles from "./styles.module.css"
const API_BASE_URL = import.meta.env.VITE_API_URL;

const JobSearch = () => {

    const [jobsCounters, setJobsCounters] = useState({
        New: 0,
        Applied: 0,
        Saved:0
    })
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/jobs/status-count`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    console.error("Failed to fetch jobs:", response.statusText);
                    return;
                }

                setJobsCounters(await response.json());
            } catch (error) {
                console.error("Error fetching jobs:", error);
            }
        };

        fetchJobs().then();
    }, []);

    return (<div className='card'>
            <div className='cardHeader'>
                Job Search
            </div>
            <div className='cardBody'>
                <table className={`${styles.jobSearchTable}`}>
                    <tbody>
                        <tr>
                            <th><Link to={'/jobs/New'}>New : </Link></th>
                            <td> {jobsCounters.New} </td>
                        </tr>
                        <tr>
                            <th><Link to={'/jobs/Saved'}>Saved : </Link></th>
                            <td> {jobsCounters.Saved} </td>
                        </tr>
                        <tr>
                            <th><Link to={'/jobs/Applied'}>Applied : </Link></th>
                            <td> {jobsCounters.Applied} </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default JobSearch;