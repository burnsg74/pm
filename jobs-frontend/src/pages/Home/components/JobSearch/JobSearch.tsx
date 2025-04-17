import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";

interface JobCounters {
    New: number;
    Applied: number;
    Saved: number;
    Deleted: number;
    Unknown: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

const JobSearch = () => {
    const [jobsCounters, setJobsCounters] = useState<JobCounters>({
        New: 0,
        Applied: 0,
        Saved: 0,
        Deleted: 0,
        Unknown: 0,
    });

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

                const data: JobCounters = await response.json();
                setJobsCounters(data);
            } catch (error) {
                console.error("Error fetching jobs:", error);
            }
        };

        void fetchJobs();
    }, []);

    return (<div className='card'>
            <div className='cardHeader'>
                <Link to={'/jobs/process-new-jobs'}>Job Search </Link>
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
                        <tr>
                            <th>Deleted :</th>
                            <td> {jobsCounters.Deleted} </td>
                        </tr>
                        <tr>
                            <th>Unknown :</th>
                            <td> {jobsCounters.Unknown} </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default JobSearch;