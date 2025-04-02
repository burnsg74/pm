import React, {useEffect, useState} from "react";
import styles from "./styles.module.css";
import {Breadcrumb} from 'react-bootstrap';
import {Link} from "react-router-dom";
import {marked} from 'marked';

interface Job {
    id?: number;
    source?: string;
    jk: string;
    title?: string;
    company?: string;
    search_query?: string;
    salary_min?: number;
    salary_max?: number;
    link?: string;
    content: string;
    html: string;
    notes?: string;
    status: "New" | "Applied" | "Deleted";
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

export default () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    const [jobs, setJobs] = useState<Job[]>([]);
    const [currentJob, setCurrentJob] = useState<Job | null>(null);

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    async function updateJob(job: Job): Promise<Job> {
        const response = await fetch(`${API_BASE_URL}/api/job`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(job)
        });
        return response.json();
    }

    useEffect(() => {
        async function fetchData() {
            // /api/job/get-job-new
            const response = await fetch(`${API_BASE_URL}/api/job/get-job-new`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const jobsData = await response.json();
            return jobsData.map((job: Job) => ({
                ...job,
                html: marked(job.content),
            }));
        }

        fetchData()
            .then((data) => {
                console.log(data);
                setJobs(data);
                setCurrentJob(data[0]);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    const handleAppliedClick = async () => {
        if (!currentJob) return;
        console.log("Applying for job:", currentJob);
            try {
                currentJob.status = "Applied";
                await updateJob(currentJob);

                setJobs(prevJobs => {
                    const jobIndex = prevJobs.findIndex(job => job.id === currentJob.id);
                    const updatedJobs = prevJobs.filter(job => job.id !== currentJob.id);

                    setCurrentJob(updatedJobs[jobIndex] || updatedJobs[0] || null);

                    return updatedJobs;
                });

            } catch (error) {
                console.error("Error updating status (Applied):", error);
            }
    };

    const handleDeletedClick = async () => {
        if (currentJob && currentJob.id) {
            const query = `
            UPDATE jobs
            SET status = 'Deleted', date_deleted = '${new Date().toISOString()}'
            WHERE id = ${currentJob.id};
        `;

            try {
                const response = await fetch(`${API_BASE_URL}/api/db`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ query }),
                });

                // const result = await response.json();
                // console.log("Database updated (Deleted):", result);

                setJobs(prevJobs => prevJobs.filter(job => job.id !== currentJob.id));

                const remainingJobs = jobs.filter(job => job.id !== currentJob.id);
                setCurrentJob(remainingJobs.length > 0 ? remainingJobs[0] : null);
            } catch (error) {
                console.error("Error updating status (Deleted):", error);
            }
        }
    };

    return (
        <div className={`${styles.container}`}>
            <Breadcrumb>
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Home</Breadcrumb.Item>
                <Breadcrumb.Item active>Apply for New Jobs</Breadcrumb.Item>
            </Breadcrumb>
            <hr/>
            {currentJob && (
                <table className={`${styles.frontMatterTable}`}>
                    <tr>
                        <th>Job:</th>
                        <td>{currentJob.title}</td>
                        <th>Company:</th>
                        <td>{currentJob.company}</td>
                        <td>
                            <a
                                className={`${styles.aLink}`}
                                href={currentJob.link}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open in {currentJob.source}
                            </a>
                        </td>
                    </tr>
                    {currentJob?.date_new && (
                        <tr>
                            <th>Skills:</th>
                            <td>{currentJob.skills_known}</td>
                            <th>New:</th>
                            <td>{formatDate(currentJob.date_new)}</td>
                        </tr>
                    )}
                </table>
            )}
            {currentJob && (
                <>
                    <button
                        className={`${styles.nextButton}`}
                        onClick={() => {
                            const currentIndex = jobs.findIndex((job) => job === currentJob);
                            const nextIndex = currentIndex === 0 ? jobs.length - 1 : currentIndex - 1;
                            setCurrentJob(jobs[nextIndex]);
                        }}
                    >
                        Back
                    </button>

                    <span style={{padding: 10}} className={`${styles.jobIndex}`}>
                        {`Job ${jobs.findIndex((job) => job === currentJob) + 1} of ${jobs.length}`}
                    </span>
                    <button
                        className={`${styles.nextButton}`}
                        onClick={() => {
                            const currentIndex = jobs.findIndex((job) => job === currentJob);
                            const nextIndex = (currentIndex + 1) % jobs.length;
                            setCurrentJob(jobs[nextIndex]);
                        }}
                    >
                        Next
                    </button>
                    &nbsp; ||  &nbsp;
                    <button
                        className={`${styles.applyButton}`}
                        onClick={handleAppliedClick}
                    >
                        Mark as Applied
                    </button>

                    <button
                        className={`${styles.deleteButton}`}
                        onClick={handleDeletedClick}
                    >
                        Mark as Deleted
                    </button>
                </>
            )}
            {currentJob?.html && (
                <div
                    className={`${styles.jobPostHtml}`}
                    dangerouslySetInnerHTML={{__html: currentJob.html}}
                />
            )}
        </div>
    );
}