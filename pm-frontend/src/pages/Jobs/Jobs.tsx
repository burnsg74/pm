import type React from "react";
import {useEffect, useState} from "react";
import styles from "./Jobs.module.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpRightFromSquare} from "@fortawesome/free-solid-svg-icons";
import {useParams, Link, useNavigate} from "react-router-dom";
import {ButtonGroup, Button} from "react-bootstrap";

const STATUSES = ["New", "Saved", "Applied", "Interview", "Rejected", "Deleted",];
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export interface Job {
    id: string;
    source: string;
    jk: string;
    status: string;
    post_html: string;
    notes?: string;
    link?: string;
    title?: string;
    company?: string;
    search_query?: string;
    salary_min?: number;
    salary_max?: number;
    date_posted?: string;
    date_new?: string;
    date_saved?: string;
    date_applied?: string;
    date_interview?: string;
    date_rejected?: string;
    date_deleted?: string;
    skills_known?: string;
    skills_unknown?: string;
}

const JobsPage: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [currentStatus, setCurrentStatus] = useState<string>("New");
    const [currentJob, setCurrentJob] = useState<Job | null>(null);
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            let currentJobStatusHasChanged = false;

            if (!currentJob) return;

            if (event.key === "j" || event.key === "ArrowDown") {
                event.preventDefault();
                const index = jobs.findIndex((j) => j.jk === currentJob.jk);
                if (index !== -1) {
                    for (let i = index + 1; i < jobs.length; i++) {
                        if (jobs[i].status === currentJob.status) {
                            setCurrentJob(jobs[i]);
                            break;
                        }
                    }
                }
            }

            if (event.key === "k" || event.key === "ArrowUp") {
                event.preventDefault();
                const index = jobs.findIndex((j) => j.jk === currentJob.jk);
                if (index !== -1) {
                    for (let i = index - 1; i >= 0; i--) {
                        if (jobs[i].status === currentJob.status) {
                            setCurrentJob(jobs[i]);
                            break;
                        }
                    }
                }
            }

            if (event.key === "l" || event.key === "ArrowLeft") {
                event.preventDefault();
                currentJobStatusHasChanged = true;
                const currentIndex = STATUSES.indexOf(currentJob.status);
                const nextIndex = (currentIndex + 1) % STATUSES.length;
                setCurrentJob({...currentJob, status: STATUSES[nextIndex]});
            }

            if (event.key === "h" || event.key === "ArrowRight") {
                event.preventDefault();
                currentJobStatusHasChanged = true;
                const currentIndex = STATUSES.indexOf(currentJob.status);
                const nextIndex = (currentIndex - 1 + STATUSES.length) % STATUSES.length;
                setCurrentJob({...currentJob, status: STATUSES[nextIndex]});
            }

            if (["n", "s", "a", "i", "r", "d"].includes(event.key)) {
                const statusMap: Record<string, string> = {
                    n: "New", s: "Saved", a: "Applied", i: "Interview", r: "Rejected", d: "Deleted",
                };
                saveStatus(statusMap[event.key]);
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [currentJob, jobs]);

    async function saveStatus(newStatus: string): Promise<void> {
        if (!currentJob) return;

        const updatedJob = {...currentJob, status: newStatus};

        setJobs((prevJobs) => prevJobs.map((job) => (job.jk === currentJob.jk ? updatedJob : job)),);

        try {
            const query = `UPDATE jobs
                           SET status = '${newStatus}'
                           WHERE jk = '${currentJob.jk}'`;
            const response = await fetch(`${API_BASE_URL}/api/db`, {
                method: "POST", headers: {
                    "Content-Type": "application/json",
                }, body: JSON.stringify({query}),
            });

            if (!response.ok) {
                throw new Error("Failed to update status");
            }

            // Update the current job to the next one and remove it from the jobs array
            if (jobs && currentJob) {
                const currentJobIndex = jobs.findIndex((job) => job.jk === currentJob.jk,);
                if (currentJobIndex !== -1) {
                    const nextJob = jobs[currentJobIndex + 1] || null;
                    setCurrentJob(nextJob);
                    setJobs(jobs.filter((job) => job.jk !== currentJob.jk));
                }
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    }

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    useEffect(() => {
        async function fetchData() {
            const query = `SELECT *
                           FROM jobs`;
            const response = await fetch(`${API_BASE_URL}/api/db`, {
                method: "POST", headers: {
                    "Content-Type": "application/json",
                }, body: JSON.stringify({query}),
            });
            return response.json();
        }

        fetchData()
            .then((data) => {
                setJobs(data);
                setCurrentJob(data[0]);
            })
            .catch((error: unknown) => {
                console.error(error);
            });
    }, [status]);

    return (<div className={`${styles.container}`}>
        <div className={`${styles.navJobs}`}>
            <div className="mb-3">
                <ButtonGroup>
                    {STATUSES.map((statusGroup) => (<Button
                        key={statusGroup}
                        size="sm"
                        variant={statusGroup === currentStatus ? "primary" : "outline-secondary"}
                        onClick={() => {
                            setCurrentStatus(statusGroup);
                        }}
                    >
                        {statusGroup} ({jobs.filter((job) => job.status === statusGroup).length})
                    </Button>))}
                </ButtonGroup>
            </div>
            {jobs.filter((job: Job) => job.status === currentStatus).map((job: Job) => (<div
                className={`${styles.navJob} ${currentJob?.jk === job.jk ? styles.navActive : ""}`}
                onClick={() => setCurrentJob(job)}
                key={job.jk}
            >
                <strong>{job.company || "NULL"}</strong> - {job.title}
            </div>))}
        </div>
        <div className={`${styles.jobDetails}`}>
            {currentJob && (<div>
                <h1>
                    {currentJob.company}&nbsp;-&nbsp;
                    {currentJob.title} &nbsp;
                    <a href={currentJob.link} target="_blank">
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare}/>
                    </a>
                </h1>
                <table>
                    <tbody>
                    <tr>
                        <td>ID:</td>
                        <th>{currentJob.jk}</th>
                        <td>&nbsp;</td>
                        <td>Salary:</td>
                        <td>
                            {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD'
                            }).format(currentJob.salary_min ?? 0)}
                            &nbsp; - &nbsp;
                            {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD'
                            }).format(currentJob.salary_max ?? 0)}
                        </td>

                    </tr>
                    <tr>
                        <td>Skills Known:</td>
                        <td>{currentJob.skills_known}</td>
                    </tr>
                    <tr>
                        <td>Skills Unknown:</td>
                        <td>{currentJob.skills_unknown}</td>
                    </tr>
                    <tr>
                        <td colSpan={4}>
                            {currentJob.date_posted &&
                                <div>
                                    <strong>Posted Date:</strong> {formatDate(currentJob.date_posted)}
                                </div>
                            }
                            {currentJob.date_new &&
                                <div>
                                    <strong>New Date:</strong> {formatDate(currentJob.date_new)}
                                </div>
                            }
                            {currentJob.date_saved &&
                                <div>
                                    <strong>Saved Date:</strong> {formatDate(currentJob.date_saved)}
                                </div>
                            }
                            {currentJob.date_applied &&
                                <div>
                                    <strong>Applied Date:</strong> {formatDate(currentJob.date_applied)}
                                </div>
                            }
                            {currentJob.date_interview &&
                                <div>
                                    <strong>Interview Date:</strong> {formatDate(currentJob.date_interview)}
                                </div>
                            }
                            {currentJob.date_rejected &&
                                <div>
                                    <strong>Rejected Date:</strong> {formatDate(currentJob.date_rejected)}
                                </div>
                            }
                            {currentJob.date_deleted &&
                                <div>
                                    <strong>Deleted Date:</strong> {formatDate(currentJob.date_deleted)}
                                </div>
                            }
                        </td>
                    </tr>
                    </tbody>
                </table>
                <hr/>
                <div dangerouslySetInnerHTML={{__html: currentJob.post_html}}/>
            </div>)}
        </div>
    </div>);
};

export default JobsPage;
