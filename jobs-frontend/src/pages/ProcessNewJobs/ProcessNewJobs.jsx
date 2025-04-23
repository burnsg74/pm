import {useEffect, useState} from "react";
import {Link, useParams} from 'react-router-dom';
import styles from "./styles.module.css";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronLeft, faChevronRight} from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const ProcessNewJobs = () => {
    const { jobStatus= 'New' } = useParams();
    console.log("Status1", jobStatus);
    const [jobs, setJobs] = useState([]);
    const [selectedJobIndex, setSelectedJobIndex] = useState(0);

    useEffect(() => {
        console.log("Status", jobStatus);
        fetchJobs();
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
                case 'a':
                    applyJob();
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
            const API_BASE_URL = import.meta.env.VITE_API_URL;
            const query = "SELECT * from job where status='"+jobStatus+"'";
            const response = await fetch(`${API_BASE_URL}/api/db-query`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save bookmark');
            }

            const fetchedJobs = await response.json();
            setJobs(fetchedJobs);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };

    const saveJob = async () => {
        let job = jobs[selectedJobIndex];
        if (job) {
            try {
                if (!job) return;
                console.log("Saved job", job);
                const query = `UPDATE job
                               SET date_saved = NOW(),
                                   status='Saved'
                               where job_id = '${job.job_id}'`;
                const response = await fetch(`${API_BASE_URL}/api/db-query`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to save bookmark');
                }

                await response.json();
                const updatedJobs = jobs.filter((_, index) => index !== selectedJobIndex);
                setJobs(updatedJobs);
                if (selectedJobIndex >= updatedJobs.length) {
                    setSelectedJobIndex(Math.max(0, updatedJobs.length - 1));
                }
            } catch (error) {
                console.error("Failed to Saved job:", error);
            }
        } else {
            console.log("No job selected to Saved.");
        }
    };

    const applyJob = async () => {
        let job = jobs[selectedJobIndex];
        if (job) {
            try {
                if (!job) return;
                console.log("date_applied job", job);
                const query = `UPDATE job
                               SET date_applied = NOW(),
                                   status='Applied'
                               where job_id = '${job.job_id}'`;
                const response = await fetch(`${API_BASE_URL}/api/db-query`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to save bookmark');
                }

                await response.json();
                const updatedJobs = jobs.filter((_, index) => index !== selectedJobIndex);
                setJobs(updatedJobs);
                if (selectedJobIndex >= updatedJobs.length) {
                    setSelectedJobIndex(Math.max(0, updatedJobs.length - 1));
                }
            } catch (error) {
                console.error("Failed to Applied job:", error);
            }
        } else {
            console.log("No job selected to Applied.");
        }
    };

    const deleteJob = async () => {
        let job = jobs[selectedJobIndex];
        if (job) {
            try {
                if (!job) return;
                console.log("Deleting job", job);
                const query = `UPDATE job
                               SET date_deleted = NOW(),
                                   status='Deleted'
                               where job_id = '${job.job_id}'`;
                const response = await fetch(`${API_BASE_URL}/api/db-query`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to save bookmark');
                }

                await response.json();
                const updatedJobs = jobs.filter((_, index) => index !== selectedJobIndex);
                setJobs(updatedJobs);
                if (selectedJobIndex >= updatedJobs.length) {
                    setSelectedJobIndex(Math.max(0, updatedJobs.length - 1));
                }
            } catch (error) {
                console.error("Failed to delete job:", error);
            }
        } else {
            console.log("No job selected to delete.");
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

    const renderBanner = () => (
        <div className={styles.banner}>
            🎉 Congrats, you have processed all the jobs! 🎉
        </div>
    );

    return (<div>
        <div className={styles.container}>
            {jobs.length === 0 && renderBanner()}
            {(jobs.length > 0) && (<div className={styles.viewContainer}>
                    <h2 className={styles.detailHeader}>
                        <span>
                        <Link to="/">🏠 </Link>
                        {jobs[selectedJobIndex]?.company_name} :: {jobs[selectedJobIndex]?.title}
                        </span>
                        <span className={styles.jobNavigation}>
                            <FontAwesomeIcon onClick={goToPrevJob} icon={faChevronLeft} className={styles.icon}/>
                            {`Job ${jobs.findIndex((job) => job === jobs[selectedJobIndex]) + 1} of ${jobs.length}`}
                            <FontAwesomeIcon onClick={goToPrevJob} icon={faChevronRight}/>
                        </span>
                    </h2>
                    <div className={styles.knowSkills}>
                        {jobs[selectedJobIndex].skills}
                    </div>

                    <div className={styles.detailsContainer}>
                        <div className={styles.threeColumnLayout}>
                            <div className={styles.leftColumn}>
                                {/* Left Column: Job Title */}
                                {jobs[selectedJobIndex] && (
                                    <div className={styles.jobList}>
                                        {jobs.map((job, index) => (
                                            <div
                                                key={job.job_id}
                                                className={`${styles.jobTitle} ${index === selectedJobIndex ? styles.activeJob : ''}`}
                                                onClick={() => setSelectedJobIndex(index)}
                                            >
                                                {job.title}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className={styles.middleColumn}>
                                {/* Middle Column: Job Post */}
                                {jobs[selectedJobIndex] && (
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: jobs[selectedJobIndex]?.job_post || "No job description available.",
                                        }}
                                    />
                                )}
                            </div>
                            <div className={styles.rightColumn}>
                                {/* Right Column: Details and Actions */}
                                <a
                                    href={jobs[selectedJobIndex]?.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="card-link"
                                >
                                    <button className={styles.button} type="button">
                                        Open in {jobs[selectedJobIndex]?.source}
                                    </button>
                                </a>
                                <ul>
                                    <li>
                                        <strong>Company:</strong> {jobs[selectedJobIndex]?.company_name}
                                    </li>
                                    <li>
                                        <strong>Source:</strong>&nbsp;
                                        <a
                                            href={jobs[selectedJobIndex]?.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="card-link"
                                        >
                                            Open in {jobs[selectedJobIndex]?.source}
                                        </a>
                                    </li>
                                    <li>
                                        <strong>Salary:</strong>{" "}
                                        {`${formatMoney(jobs[selectedJobIndex]?.salary_min)} - ${formatMoney(
                                            jobs[selectedJobIndex]?.salary_max
                                        )}`}
                                    </li>
                                    <li>
                                        <strong>Date Posted:</strong>{" "}
                                        {formatDate(jobs[selectedJobIndex]?.date_posted)}
                                    </li>
                                    <li>
                                        <strong>Status:</strong> {jobs[selectedJobIndex]?.status}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>);
};

export default ProcessNewJobs;