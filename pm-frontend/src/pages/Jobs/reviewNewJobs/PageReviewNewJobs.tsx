import React, {useEffect, useState} from "react";
import styles from "./styles.module.css";
import {Breadcrumb} from 'react-bootstrap';
import {Link} from "react-router-dom";
import {marked} from 'marked';
import Table from "react-bootstrap/Table";

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
    status: "New" | "Saved" | "Applied" | "Deleted";
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

    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatMoney = (amount: number | null): string => {
        if (!amount) return "";
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    async function updateJobFile(job: Job): Promise<Job> {
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

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            console.log("Key pressed:", event.key);
            switch (event.key) {
                case ']':
                    goToNextJob();
                    break;
                case '[':
                    goToPrevJob();
                    break;
                case 'j':
                    pageDown();
                    break;
                case 'k':
                    pageUp();
                    break;
                case 's':
                    saveJob().then();
                    break;
                case 'd':
                    deleteJob().then();
                    break;
                case "o":
                    openJobLink();
                    break;

                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentJob, jobs]);

    const goToNextJob = () => {
        console.log("Going to next job");
        if (!jobs.length || !currentJob) return;
        const currentIndex = jobs.findIndex((j) => j.id === currentJob.id);
        if (currentIndex < jobs.length - 1) {
            setCurrentJob(jobs[currentIndex + 1]);
        } else {
            setCurrentJob(jobs[0]);
        }
    };

    const goToPrevJob = () => {
        console.log("Going to next job",jobs.length, currentJob);
        if (!jobs.length || !currentJob) return;
        const currentIndex = jobs.findIndex((j) => j.id === currentJob.id);
        console.log("Current index:", currentIndex);
        if (currentIndex > 0) {
            setCurrentJob(jobs[currentIndex - 1]);
        } else {
            setCurrentJob(jobs[jobs.length - 1]);
        }
    };

    const pageDown = () => {
        window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    };

    const pageUp = () => {
        window.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
    };

    const saveJob = async () => {
        if (!currentJob) return;
        try {
            const updatedJob: Job = { ...currentJob, status: "Saved" };
            await updateJobFile(updatedJob);
            // Remove the current job from the jobs list.
            const updatedJobs = jobs.filter((job) => job.id !== updatedJob.id);
            setJobs(updatedJobs);

            if (updatedJobs.length > 0) {
                const currentIndex = jobs.findIndex((job) => job.id === updatedJob.id);
                const nextIndex = currentIndex >= updatedJobs.length ? 0 : currentIndex;
                setCurrentJob(updatedJobs[nextIndex]);
            } else {
                setCurrentJob(null);
            }
        } catch (error) {
            console.error("Error saving job", error);
        }
    };

    const deleteJob = async () => {
        if (!currentJob) return;
        try {
            const updatedJob: Job = { ...currentJob, status: "Deleted" };
            await updateJobFile(updatedJob);
            // Remove the current job from the jobs list.
            const updatedJobs = jobs.filter((job) => job.id !== updatedJob.id);
            setJobs(updatedJobs);

            if (updatedJobs.length > 0) {
                const currentIndex = jobs.findIndex((job) => job.id === updatedJob.id);
                const nextIndex = currentIndex >= updatedJobs.length ? 0 : currentIndex;
                setCurrentJob(updatedJobs[nextIndex]);
            } else {
                setCurrentJob(null);
            }
        } catch (error) {
            console.error("Error saving job", error);
        }
    };

    const openJobLink = () => {
        if (currentJob && currentJob.link) {
            window.open(currentJob.link, "_blank");
        }
    };


    return (
        <div className={`${styles.container}`}>
            <Breadcrumb>
                <Breadcrumb.Item linkAs={Link} linkProps={{to: '/'}}>Home</Breadcrumb.Item>
                <Breadcrumb.Item active>Review New Jobs</Breadcrumb.Item>
            </Breadcrumb>
            {currentJob && (
                <>
                    <h4>
                        <a href={currentJob?.link} target="_blank" rel="noopener noreferrer" className="card-link">
                            {currentJob?.title}
                        </a>
                        <span style={{float: "right", paddingRight: 5 }}>
                        {`Job ${jobs.findIndex((job) => job === currentJob) + 1} of ${jobs.length}`}
                    </span>
                    </h4>
                    <Table striped borderless className={styles.tableAutoFit}>
                    <tbody>
                        <tr>
                            <th>Date :</th>
                            <td>
                                {formatDate(currentJob.date_new)}
                            </td>
                            <th>Company :</th>
                            <td>{currentJob.company}</td>
                            <td></td>
                        </tr>
                        {currentJob.salary_min && (
                            <tr>
                                <th>Salary Min :</th>
                                <td>{formatMoney(currentJob.salary_min)}</td>
                                <th>Salary Max :</th>
                                <td>{formatMoney(currentJob.salary_max)}</td>
                                <td></td>
                            </tr>
                        )}
                        <tr>
                            <td colSpan={5}>{currentJob.skills_known}</td>
                        </tr>

                        </tbody>
                    </Table>
                    {/*TODO Show in Model when Shift ? is pressed*/}
                    {/*<span className={styles.shortcut}><kbd>]</kbd> → Next job</span>*/}
                    {/*<span className={styles.shortcut}><kbd>[</kbd> → Previous job</span>*/}
                    {/*<span className={styles.shortcut}><kbd>j</kbd> → Page Down</span>*/}
                    {/*<span className={styles.shortcut}><kbd>k</kbd> → Page Up</span>*/}
                    {/*<span className={styles.shortcut}><kbd>s</kbd> → Save job</span>*/}
                    {/*<span className={styles.shortcut}><kbd>d</kbd> → Delete job</span>*/}

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