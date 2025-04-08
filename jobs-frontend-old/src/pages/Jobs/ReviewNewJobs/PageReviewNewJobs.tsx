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
    const SKILLS_KNOWN = ["HTML", "JavaScript", "CSS", "NoSQL", "SQL", "React", "Vue", "Node.js", "Node", "Python", "PHP", "Git", "AWS", "TypeScript", "Svelte", "Flutter", "Django", "Laravel", "jQuery", "SCSS", "Jest", "Cypress", "MySQL", "Javascript", "CI/CD", "Jira", "DynamoDB", "Linux", "Vuex", "Redis", "PostgreSQL"].map(escapeRegExp);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [currentJob, setCurrentJob] = useState<Job | null>(null);

    function escapeRegExp(string: string) {
        return string.replace(/[.*+?^${}()|[\]#\\]/g, "\\$&");
    }

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
            return await Promise.all(
                jobsData.map(async (job: Job) => {
                    const parsedContent = await marked(job.content);
                    return {
                        ...job,
                        html: highlightWords(parsedContent),
                    };
                })
            );
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

    function highlightWords(text: string) {
        if (!text) return "";

        const regex = new RegExp(`(?<!\\w)(${SKILLS_KNOWN.join("|")})(?!\\w)`, "gi",);
        return text.replace(regex, (match, p1) => {
            if (p1) {
                return `<span class="highlight-green">${match}</span>`;
            }
            return match;
        });
    }

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
        console.log("Going to next job", jobs.length, currentJob);
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
        window.scrollBy({top: window.innerHeight, behavior: 'smooth'});
    };

    const pageUp = () => {
        window.scrollBy({top: -window.innerHeight, behavior: 'smooth'});
    };

    const saveJob = async () => {
        if (!currentJob) return;
        try {
            const updatedJob: Job = {...currentJob, status: "Saved"};
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
            const updatedJob: Job = {...currentJob, status: "Deleted"};
            await updateJobFile(updatedJob);
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

            <div className={styles.twoColumnLayout}>
                <div className={styles.leftColumn}>
                    {currentJob && (
                        <>
                            <h2>{currentJob?.title}
                                <span style={{float: "right", paddingRight: 5}}>
                        {`Job ${jobs.findIndex((job) => job === currentJob) + 1} of ${jobs.length}`}
                    </span>
                            </h2>
                            <div style={{marginBottom: 10, color: "darkgreen"}}>
                                {currentJob.skills_known}
                            </div>

                            <div dangerouslySetInnerHTML={{__html: currentJob?.html || ""}}/>
                        </>
                    )}
                </div>
                <div className={styles.rightColumn}>
                    <ul>
                        <li><strong>Company:</strong> {currentJob?.company}</li>
                        <li><strong>Source: </strong>
                            &nbsp;
                            <a href={currentJob?.link} target="_blank" rel="noopener noreferrer" className="card-link">
                                {currentJob?.source}
                            </a>
                        </li>
                        <li>
                            <strong>Salary:</strong> {formatMoney(currentJob?.salary_min)} - {formatMoney(currentJob?.salary_max)}
                        </li>
                        <li><strong>Date Posted:</strong> {formatDate(currentJob?.date_posted)}</li>
                        <li><strong>Status:</strong> {currentJob?.status}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}