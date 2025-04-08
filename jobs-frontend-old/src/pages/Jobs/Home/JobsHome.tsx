import React, { useEffect, useRef, useState } from "react";
import styles from "./JobsHome.module.css";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const STATUSES = ["New", "Applied", "Interview", "Rejected", "Deleted"];
const JobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [currentStatus, setCurrentStatus] = useState("New");
    const [currentJob, setCurrentJob] = useState(null);
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
                const index = jobs.findIndex((j) => j.jk === currentJob.frontMatter.jk);
                if (index !== -1) {
                    for (let i = index + 1; i < jobs.length; i++) {
                        if (jobs[i].status === currentJob.frontMatter.status) {
                            setCurrentJob(jobs[i]);
                            break;
                        }
                    }
                }
            }

            if (event.key === "k" || event.key === "ArrowUp") {
                event.preventDefault();
                const index = jobs.findIndex((j) => j.jk === currentJob.frontMatter.jk);
                if (index !== -1) {
                    for (let i = index - 1; i >= 0; i--) {
                        if (jobs[i].status === currentJob.frontMatter.status) {
                            setCurrentJob(jobs[i]);
                            break;
                        }
                    }
                }
            }

            if (event.key === "l" || event.key === "ArrowRight") {
                event.preventDefault();
                currentJobStatusHasChanged = true;
                const currentIndex = STATUSES.indexOf(currentJob.frontMatter.status);
                const nextIndex = (currentIndex + 1) % STATUSES.length;
                setCurrentJob({ ...currentJob, status: STATUSES[nextIndex] });
            }

            if (event.key === "h" || event.key === "ArrowLeft") {
                event.preventDefault();
                currentJobStatusHasChanged = true;
                const currentIndex = STATUSES.indexOf(currentJob.frontMatter.status);
                const nextIndex = (currentIndex - 1 + STATUSES.length) % STATUSES.length;
                setCurrentJob({ ...currentJob, status: STATUSES[nextIndex] });
            }

            if (["n", "a", "i", "r", "d"].includes(event.key)) {
                const statusMap = {
                    n: "New",
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
            prevJobs.map((job) => (job.jk === currentJob.frontMatter.jk ? updatedJob : job))
        );

        try {
            // @TODO Update File
            const currentJobIndex = jobs.findIndex((job) => job.jk === currentJob.frontMatter.jk);
            if (currentJobIndex !== -1) {
                const nextJob =
                    jobs
                        .slice(currentJobIndex + 1)
                        .find((job) => job.status === currentJob.frontMatter.status) || null;

                setCurrentJob(nextJob);
                setJobs(jobs.filter((job) => job.jk !== currentJob.frontMatter.jk));
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
        // const PROJECT_PATH = '/Users/greg/Library/CloudStorage/Dropbox/PM/Areas/Job Search/Jobs/New';
        //  const filename = `${PROJECT_PATH}/${sanitizeFilename(newDBRecord.company)}-${sanitizeFilename(newDBRecord.title)}.md`;
        //     const yamlFrontmatter = objectToYAML(frontmatterData);
        //     fs.writeFileSync(filename, `---\n${yamlFrontmatter}\n---\n\n${markdown}`);
        // /api/jobs/new
        async function fetchData() {
            // const response = await fetch(`${API_BASE_URL}/api/db`, {
            const response = await fetch(`${API_BASE_URL}/api/jobs/new`, {
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
                {jobs.map((job) => (
                        <div
                            ref={currentJob?.jk === job.jk ? navActiveRef : null}
                            className={`${styles.navJob} ${
                                currentJob?.jk === job.jk ? styles.navActive : ""
                            }`}
                            onClick={() => setCurrentJob(job)}
                            key={job.jk}
                        >
                            <strong>{job.frontMatter.company || "NULL"}</strong> - {job.frontMatter.title}
                        </div>
                    ))}
            </div>
            <div className={`${styles.rightCol}`}>
                {currentJob && (
                    <div className={`${styles.jobDetails}`}>
                        <h3 className={`${styles.title}`}>
                            <a href={currentJob.frontMatter.link} target="_blank">
                                {currentJob.frontMatter.company}&nbsp;-&nbsp;
                                {currentJob.frontMatter.title} &nbsp;
                            </a>
                        </h3>
                        <table className={`${styles.jobTable}`}>
                            <tbody>
                            <tr>
                                <th>Source:</th>
                                <td>{currentJob.frontMatter.source}</td>
                                <th>ID:</th>
                                <td>{currentJob.frontMatter.jk}</td>
                                <td>&nbsp;</td>
                                <th>Salary:</th>
                                <td>
                                    {currentJob.frontMatter.source === "Indeed" ? (
                                        <>
                                            {new Intl.NumberFormat("en-US", {
                                                style: "currency",
                                                currency: "USD",
                                            }).format(currentJob.frontMatter.salary_min ?? 0)}
                                            &nbsp;-&nbsp;
                                            {new Intl.NumberFormat("en-US", {
                                                style: "currency",
                                                currency: "USD",
                                            }).format(currentJob.frontMatter.salary_max ?? 0)}
                                        </>
                                    ) : (
                                        currentJob.frontMatter.salary_min ?? "N/A"
                                    )}
                                </td>
                                <th>Status:</th>
                                <td>{currentJob.frontMatter.status}</td>
                                <td style={{ width: "100%" }}>&nbsp;</td>
                            </tr>
                            <tr>
                                <th>Skills:</th>
                                <td style={{ color: "darkgreen" }} colSpan={5}>
                                    <strong>{currentJob.frontMatter.skills_known}</strong>
                                </td>
                            </tr>
                            {currentJob.frontMatter.date_posted && (
                                <tr>
                                    <th>Posted:</th>
                                    <td colSpan={9}>{formatDate(currentJob.frontMatter.date_posted)}</td>
                                </tr>
                            )}
                            {currentJob.frontMatter.date_new && (
                                <tr>
                                    <th>New:</th>
                                    <td colSpan={9}>{formatDate(currentJob.frontMatter.date_new)}</td>
                                </tr>
                            )}
                            {currentJob.frontMatter.date_applied && (
                                <tr>
                                    <th>Applied:</th>
                                    <td colSpan={9}>{formatDate(currentJob.frontMatter.date_applied)}</td>
                                </tr>
                            )}
                            {currentJob.frontMatter.date_interview && (
                                <tr>
                                    <th>Interview:</th>
                                    <td colSpan={9}>{formatDate(currentJob.frontMatter.date_interview)}</td>
                                </tr>
                            )}
                            {currentJob.frontMatter.date_rejected && (
                                <tr>
                                    <th>Rejected:</th>
                                    <td colSpan={9}>{formatDate(currentJob.frontMatter.date_rejected)}</td>
                                </tr>
                            )}
                            {currentJob.frontMatter.date_deleted && (
                                <tr>
                                    <th>Deleted:</th>
                                    <td colSpan={9}>{formatDate(currentJob.frontMatter.date_deleted)}</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                        <div
                            className={`${styles.jobPostHtml}`}
                            dangerouslySetInnerHTML={{ __html: currentJob.postHtml }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobsPage;