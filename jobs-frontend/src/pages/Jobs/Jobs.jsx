import {useEffect, useState} from "react";
import {Link, useParams} from 'react-router-dom';
import styles from "./styles.module.css";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const Jobs = () => {
    const {jobStatus} = useParams();
    const jobStatuses = ["New", "Saved", "Applied", "Deleted"];
    const [view, setView] = useState("table");
    const [jobs, setJobs] = useState([]);
    const [selectedJobIndex, setSelectedJobIndex] = useState(0);
    const [jobsCounters, setJobsCounters] = useState({
        New: 0, Applied: 0, Saved: 0, Deleted: 0
    });

    useEffect(() => {
        fetchJobs();
        fetchJobCounters();
    }, [jobStatus]);


    useEffect(() => {
        const handleKeyPress = (event) => {
            event.preventDefault();
            console.log("Key pressed:", event.key);
            switch (event.key) {
                case 'l':
                case ']':
                case 'ArrowDown':
                    goToNextJob();
                    break;
                case '[':
                case 'h':
                case 'ArrowUp':
                    goToPrevJob()
                    break;
                case 'j':
                case 'PageDown':
                    pageDown();
                    break;
                case 'k':
                case 'PageUp':
                    pageUp();
                    break;
                case 's':
                    saveJob();
                    break;
                case 'd':
                    deleteJob();
                    break;
                case "o":
                    openJobLink();
                    break;
            }
        }
        window.addEventListener('keydown', handleKeyPress);

        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [selectedJobIndex, jobs]);

    const renderLink = (statusKey, count) => (<span key={statusKey}>
    <Link
        to={`/jobs/${statusKey}`}
        className={jobStatus === statusKey ? styles.activeLink : ""}
    >
      {`${statusKey}: ${count}`}
    </Link>
  </span>);


    const goToPrevJob = () => {
        if (Array.isArray(jobs) && jobs.length > 0) {
            const prevIndex = (selectedJobIndex - 1 + jobs.length) % jobs.length;
            setSelectedJobIndex(prevIndex);
        } else {
            console.log("jobs is not an array or is empty.");
        }
    };

    const openJobLink = () => {
        if (Array.isArray(jobs) && jobs.length > 0) {
            const selectedJob = jobs[selectedJobIndex];
            if (selectedJob?.link) {
                window.open(selectedJob.link, "_blank");
            } else {
                console.log("No link available for the selected job.");
            }
        } else {
            console.log("jobs is not an array or is empty.");
        }
    };


    const fetchJobs = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs?status=${jobStatus}`, {
                method: "GET", headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                console.error("Failed to fetch jobs:", response.statusText);
                return;
            }

            const fetchedJobs = await response.json();
            setJobs(fetchedJobs);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };

    const saveJob = async () => {
        if (Array.isArray(jobs) && jobs.length > 0) {
            const selectedJob = jobs[selectedJobIndex];
            console.log("Selected job:", selectedJob);
            if (selectedJob) {
                try {
                    const updatedJob = await updateJob({...selectedJob, status: "Saved"});
                    console.log("Job saved successfully:", updatedJob);
                    await fetchJobs();
                    await fetchJobCounters();
                } catch (error) {
                    console.error("Failed to save job:", error);
                }
            } else {
                console.log("No job selected to save.");
            }
        } else {
            console.log("jobs is not an array or is empty.");
        }
    };

    const deleteJob = async () => {
       let job = jobs[selectedJobIndex];
       if (job) {
           try {
               const updatedJob = await updateJob({...job, status: "Deleted"});
               console.log("Job deleted successfully:", updatedJob);
               await fetchJobs();
               await fetchJobCounters();
           } catch (error) {
               console.error("Failed to delete job:", error);
           }
       } else {
           console.log("No job selected to delete.");
       }
    };

    const updateJob = async (job) => {
        try {
            console.log("Updating job", job);
            const API_BASE_URL = import.meta.env.VITE_API_URL;
            const response = await fetch(`${API_BASE_URL}/api/job`, {
                method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(job),
            });

            if (!response.ok) {
                throw new Error(`Failed to update job: ${response.statusText}`);
            }

            const updatedJob = await response.json();
            return updatedJob; // Assuming `Job` is the expected type here
        } catch (error) {
            console.error("Error updating job:", error);
            throw error; // Re-throw the error to let the caller handle it
        }
    };


    const pageDown = () => {
        if (Array.isArray(jobs) && jobs.length > 0) {
            const nextIndex = Math.min(selectedJobIndex + 5, jobs.length - 1);
            setSelectedJobIndex(nextIndex);
        } else {
            console.warn("jobs is not an array or is empty.");
        }
    };

    const pageUp = () => {
        if (Array.isArray(jobs) && jobs.length > 0) {
            const nextIndex = Math.max(selectedJobIndex - 5, 0);
            setSelectedJobIndex(nextIndex);
        } else {
            console.warn("jobs is not an array or is empty.");
        }
    };

    const fetchJobCounters = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs/status-count`, {
                method: "GET", headers: {
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

    const formatDate = (dateString) => {
        if (!dateString || isNaN(new Date(dateString).getTime())) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
        });
    };

    const formatMoney = (amount) => {
        if (!amount || isNaN(amount)) return "";
        return new Intl.NumberFormat('en-US', {
            style: 'currency', currency: 'USD',
        }).format(amount);
    };

    const goToNextJob = () => {
        if (Array.isArray(jobs) && jobs.length > 0) {
            const nextIndex = (selectedJobIndex + 1) % jobs.length;
            setSelectedJobIndex(nextIndex);
        } else {
            console.log("jobs is not an array or is empty.");
        }
    };

    return (<div>
        <nav className={styles.navbar}>
            <ul className={styles.breadcrumb}>
                <li><a href="/">Home</a></li>
                <li>{jobStatus}</li>
            </ul>
            <span className={styles['nav-status']}>
                  {jobStatuses.map((status) => renderLink(status, jobsCounters[status]))}
            </span>
        </nav>
        <div className={styles.container}>
            <div className={styles.views}>
                <span onClick={() => setView("table")}
                      className={view === "table" ? styles.active : ''}>Table View</span>
                <span onClick={() => setView("detail")}
                      className={view === "detail" ? styles.active : ''}>Detail View</span>
            </div>
            {(view === "table") && (
                <table className={`${styles.jobSearchTable}`}>
                <thead>
                <tr>
                    <th>Company</th>
                    <th>Title</th>
                    <th>Skills Known</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Source</th>
                </tr>
                </thead>
                <tbody>
                {Array.isArray(jobs) && jobs.map((job, index) => (
                    <tr key={job.id}
                        className={index === selectedJobIndex ? styles.selectedRow : ""}
                    >
                    <td>{job.company}</td>
                    <td>{job.title}</td>
                    <td>{job.skills_known}</td>
                    <td>{job.status}</td>
                    <td>
                        {job.status === "New" && formatDate(job.date_new)}
                        {job.status === "Applied" && formatDate(job.date_applied)}
                        {job.status === "Deleted" && formatDate(job.date_deleted)}
                    </td>
                    <td>
                        <a href={job.link} target="_blank" rel="noopener noreferrer">
                            {job.source}
                        </a>
                    </td>
                </tr>))}
                </tbody>
            </table>)}

            {(view === "detail") && (<div className={styles.viewContainer}>
                    <h2 className={styles.detailHeader}>{jobs[selectedJobIndex]?.title}
                        <span>{`Job ${jobs.findIndex((job) => job === jobs[selectedJobIndex]) + 1} of ${jobs.length}`}</span>
                    </h2>
                    <div className={styles.knowSkills}>
                        {jobs[selectedJobIndex].skills_known}
                    </div>

                    <div className={styles.detailsContainer}>
                        <div className={styles.twoColumnLayout}>
                            <div className={styles.leftColumn}>
                                {jobs[selectedJobIndex] && (<>
                                    <div dangerouslySetInnerHTML={{__html: jobs[selectedJobIndex]?.html || ""}}/>
                                </>)}
                            </div>
                            <div className={styles.rightColumn}>
                                <ul>
                                    <li><strong>Company:</strong> {jobs[selectedJobIndex]?.company}</li>
                                    <li>
                                        <strong>Source: </strong>
                                        &nbsp;
                                        <a href={jobs[selectedJobIndex]?.link} target="_blank" rel="noopener noreferrer"
                                           className="card-link">
                                            Open in {jobs[selectedJobIndex]?.source}
                                        </a>
                                    </li>
                                    <li>
                                        <strong>Salary:</strong> {formatMoney(jobs[selectedJobIndex]?.salary_min)} - {formatMoney(jobs[selectedJobIndex]?.salary_max)}
                                    </li>
                                    <li><strong>Date Posted:</strong> {formatDate(jobs[selectedJobIndex]?.date_posted)}
                                    </li>
                                    <li><strong>Status:</strong> {jobs[selectedJobIndex]?.status}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

            )}

        </div>
    </div>);
};

export default Jobs;