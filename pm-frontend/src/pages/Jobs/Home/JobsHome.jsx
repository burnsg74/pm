import React, { useEffect, useRef, useState } from "react";
import styles from "./JobsHome.module.css";
import { useNavigate } from "react-router-dom";
import { Button, ButtonGroup } from "react-bootstrap";

const STATUSES = ["New", "Saved", "Applied", "Interview", "Rejected", "Deleted"];
const JobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [currentStatus, setCurrentStatus] = useState("New");
    const [currentJob, setCurrentJob] = useState(null);
    const DB_URL = import.meta.env.VITE_DB_URL;
    const navigate = useNavigate();
    const navContainerRef = useRef(null);
    const navActiveRef = useRef(null);

    useEffect(() => {
        if (navContainerRef.current && navActiveRef.current) {
            const container = navContainerRef.current;
            const activeItem = navActiveRef.current;
            const containerRect = container.getBoundingClientRect();
            const activeRect = activeItem.getBoundingClientRect();
            const containerTop = containerRect.top;
            const containerHeight = containerRect.height;
            const activeTop = activeRect.top - containerTop;
            const activeBottom = activeTop + activeRect.height;
            const halfwayPoint = containerHeight / 2;

            if (activeTop < 0) {
                container.scrollTop += activeTop;
            } else if (activeBottom > halfwayPoint) {
                container.scrollTop += activeBottom - halfwayPoint;
            }
        }

        function handleKeyDown(event) {
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

            if (event.key === "l" || event.key === "ArrowRight") {
                event.preventDefault();
                currentJobStatusHasChanged = true;
                const currentIndex = STATUSES.indexOf(currentJob.status);
                const nextIndex = (currentIndex + 1) % STATUSES.length;
                setCurrentJob({ ...currentJob, status: STATUSES[nextIndex] });
            }

            if (event.key === "h" || event.key === "ArrowLeft") {
                event.preventDefault();
                currentJobStatusHasChanged = true;
                const currentIndex = STATUSES.indexOf(currentJob.status);
                const nextIndex = (currentIndex - 1 + STATUSES.length) % STATUSES.length;
                setCurrentJob({ ...currentJob, status: STATUSES[nextIndex] });
            }

            if (["n", "s", "a", "i", "r", "d"].includes(event.key)) {
                const statusMap = {
                    n: "New",
                    s: "Saved",
                    a: "Applied",
                    i: "Interview",
                    r: "Rejected",
                    d: "Deleted",
                };
                saveStatus(statusMap[event.key]);
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [currentJob, jobs]);

    async function saveStatus(newStatus) {
        if (!currentJob) return;

        const updatedJob = { ...currentJob, status: newStatus };

        setJobs((prevJobs) =>
            prevJobs.map((job) => (job.jk === currentJob.jk ? updatedJob : job))
        );

        try {
            const query = `UPDATE jobs
                           SET status = '${newStatus}'
                           WHERE jk = '${currentJob.jk}'`;
            const response = await fetch(`${DB_URL}/api/db`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                throw new Error("Failed to update status");
            }

            const currentJobIndex = jobs.findIndex((job) => job.jk === currentJob.jk);
            if (currentJobIndex !== -1) {
                const nextJob =
                    jobs
                        .slice(currentJobIndex + 1)
                        .find((job) => job.status === currentJob.status) || null;

                setCurrentJob(nextJob);
                setJobs(jobs.filter((job) => job.jk !== currentJob.jk));
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    useEffect(() => {
        async function fetchData() {
            const query = `SELECT *
                     FROM jobs`;
            const response = await fetch(`${DB_URL}/api/db`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query }),
            });
            return response.json();
        }

        fetchData()
            .then((data) => {
                setJobs(data);
                setCurrentJob(data.find((job) => job.status === "New") || null);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    return (
        <div className={`${styles.container}`}>
            <div className={`${styles.navJobs}`} ref={navContainerRef}>
                {jobs
                    .filter((job) => job.status === currentStatus)
                    .map((job) => (
                        <div
                            ref={currentJob?.jk === job.jk ? navActiveRef : null}
                            className={`${styles.navJob} ${
                                currentJob?.jk === job.jk ? styles.navActive : ""
                            }`}
                            onClick={() => setCurrentJob(job)}
                            key={job.jk}
                        >
                            <strong>{job.company || "NULL"}</strong> - {job.title}
                        </div>
                    ))}
            </div>
            <div className={`${styles.rightCol}`}>
                <ButtonGroup
                    aria-label="Status buttons"
                    className={`w-100`}
                    style={{ borderRadius: "unset" }}
                >
                    {STATUSES.map((statusGroup) => (
                        <Button
                            style={{ borderRadius: "unset" }}
                            variant={statusGroup === currentStatus ? "primary" : "secondary"}
                            key={statusGroup}
                            onClick={() => {
                                setCurrentStatus(statusGroup);
                            }}
                        >
                            {statusGroup} (
                            {jobs.filter((job) => job.status === statusGroup).length})
                        </Button>
                    ))}
                </ButtonGroup>
                {currentJob && (
                    <div className={`${styles.jobDetails}`}>
                        <h3 className={`${styles.title}`}>
                            <a href={currentJob.link} target="_blank">
                                {currentJob.company}&nbsp;-&nbsp;
                                {currentJob.title} &nbsp;
                            </a>
                        </h3>
                        <table className={`${styles.jobTable}`}>
                            <tbody>
                            <tr>
                                <th>Source:</th>
                                <td>{currentJob.source}</td>
                                <th>ID:</th>
                                <td>{currentJob.jk}</td>
                                <td>&nbsp;</td>
                                <th>Salary:</th>
                                <td>
                                    {currentJob.source === "Indeed" ? (
                                        <>
                                            {new Intl.NumberFormat("en-US", {
                                                style: "currency",
                                                currency: "USD",
                                            }).format(currentJob.salary_min ?? 0)}
                                            &nbsp;-&nbsp;
                                            {new Intl.NumberFormat("en-US", {
                                                style: "currency",
                                                currency: "USD",
                                            }).format(currentJob.salary_max ?? 0)}
                                        </>
                                    ) : (
                                        currentJob.salary_min ?? "N/A"
                                    )}
                                </td>
                                <th>Status:</th>
                                <td>{currentJob.status}</td>
                                <td style={{ width: "100%" }}>&nbsp;</td>
                            </tr>
                            <tr>
                                <th>Skills:</th>
                                <td style={{ color: "darkgreen" }} colSpan={5}>
                                    <strong>{currentJob.skills_known}</strong>
                                </td>
                            </tr>
                            {currentJob.date_posted && (
                                <tr>
                                    <th>Posted:</th>
                                    <td colSpan={9}>{formatDate(currentJob.date_posted)}</td>
                                </tr>
                            )}
                            {currentJob.date_new && (
                                <tr>
                                    <th>New:</th>
                                    <td colSpan={9}>{formatDate(currentJob.date_new)}</td>
                                </tr>
                            )}
                            {currentJob.date_saved && (
                                <tr>
                                    <th>Saved:</th>
                                    <td colSpan={9}>{formatDate(currentJob.date_saved)}</td>
                                </tr>
                            )}
                            {currentJob.date_applied && (
                                <tr>
                                    <th>Applied:</th>
                                    <td colSpan={9}>{formatDate(currentJob.date_applied)}</td>
                                </tr>
                            )}
                            {currentJob.date_interview && (
                                <tr>
                                    <th>Interview:</th>
                                    <td colSpan={9}>{formatDate(currentJob.date_interview)}</td>
                                </tr>
                            )}
                            {currentJob.date_rejected && (
                                <tr>
                                    <th>Rejected:</th>
                                    <td colSpan={9}>{formatDate(currentJob.date_rejected)}</td>
                                </tr>
                            )}
                            {currentJob.date_deleted && (
                                <tr>
                                    <th>Deleted:</th>
                                    <td colSpan={9}>{formatDate(currentJob.date_deleted)}</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                        <div
                            className={`${styles.jobPostHtml}`}
                            dangerouslySetInnerHTML={{ __html: currentJob.post_html }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobsPage;