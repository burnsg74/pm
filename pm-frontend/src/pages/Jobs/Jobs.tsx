import type React from "react";
import {useEffect, useState } from "react";
import styles from './Jobs.module.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpRightFromSquare} from "@fortawesome/free-solid-svg-icons";

export interface Job {
    jk: string;
    status: string;
    post_html: string;
    notes?: string;
    link?: string;
    title?: string;
    company?: string;
    company_link?: string;
    salary?: string;
    new_date?: string;
    saved_date?: string;
    applied_date?: string;
    interview_date?: string;
    rejected_date?: string;
    deleted_date?: string;
    search_query?: string;
}

const JobsPage: React.FC = () => {

    const [jobs, setJobs] = useState<Job[]>([]);
    const [currentJob, setCurrentJob] = useState<Job | null>(null);
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            const STATUSES = ["New", "Saved", "Applied", "Interview", "Rejected", "Deleted"];
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


    async function saveStatus(newStatus: string): Promise<void> {
        if (!currentJob) return;

        const updatedJob = {...currentJob, status: newStatus};

        setJobs((prevJobs) =>
            prevJobs.map((job) =>
                job.jk === currentJob.jk ? updatedJob : job
            )
        );

        try {
            const query = `UPDATE jobs SET status = '${newStatus}' WHERE jk = '${currentJob.jk}'`;
            const response = await fetch(`${API_BASE_URL}/api/db`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({query}),
            });

            if (!response.ok) {
                throw new Error("Failed to update status");
            }

            // Update the current job to the next one and remove it from the jobs array
            if (jobs && currentJob) {
                const currentJobIndex = jobs.findIndex((job) => job.jk === currentJob.jk);
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
    
    function highlightWords(text: string): string {
        function escapeRegExp(string: string) {
            return string.replace(/[.*+?^${}()|[\]#\\]/g, "\\$&");
        }

        if (!text) return "";
        const wordsToHighlightGreen = [
            "HTML",
            "JavaScript",
            "CSS",
            "NoSQL",
            "SQL",
            "React",
            "Vue",
            "Node.js",
            "Node",
            "Python",
            "PHP",
            "Git",
            "AWS",
            "TypeScript",
            "Svelte",
            "Flutter",
            "Django",
            "Laravel",
            "jQuery",
            "SCSS",
            "Jest",
            "Cypress",
            "MySQL",
            "Javascript",
            "CI/CD",
            "Jira",
            "DynamoDB",
            "Linux",
            "Vuex"
        ].map(escapeRegExp);

        const wordsToHighlightRed = [
            "MS SQL",
            "Ruby on Rails",
            "Ruby",
            "Azure",
            ".Net",
            "Java",
            "C#",
            "C++",
            "Swift",
            "Kotlin",
            "Angular",
            "Flutter",
            "Spring",
            "MSSQL",
            "Next.js",
            "ASP.NET",
            "VB.Net",
            "VB",
            "PostgreSQL",
            "Wordpress",
            "Drupal",
            "Visual Basic"
        ].map(escapeRegExp);

        const regex = new RegExp(
            `(?<!\\w)(${wordsToHighlightGreen.join("|")})(?!\\w)|(?<!\\w)(${wordsToHighlightRed.join("|")})(?!\\w)`,
            "gi"
        );

        return text.replace(regex, (match, p1, p2) => {
            if (p1) {
                return `<span class="highlight-green">${match}</span>`;
            } else if (p2) {

                return `<span class="highlight-red">${match}</span>`;
            }
            return match;
        });
    }

    useEffect(() => {
        async function fetchData() {
            const query = `SELECT *
                           FROM jobs
                           WHERE status = 'New'`;
            const response = await fetch(`${API_BASE_URL}/api/db`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({query}),
                });
            return response.json();
        }

        fetchData().then((data) => {
            const updatedJobs = data.map((job: any) => {
                job.post_html = highlightWords(job?.post_html);
                return job;
            });

            setJobs(updatedJobs);
            setCurrentJob(updatedJobs[0]);
        }).catch((error: unknown) => {
            console.error(error);
        });
    }, []);

    return (
        <div className={`${styles.container}`}>
            <div className={`${styles.navJobs}`}>
                {jobs.filter((job: Job) => job.status === 'New').map((job: Job) => (
                    <div className={`${styles.navJob} ${currentJob?.jk === job.jk ? styles.navActive : ''}`}
                         onClick={() => setCurrentJob(job)}
                         key={job.jk}>
                        <strong>{job.company || 'NULL'}</strong> - {job.title}
                    </div>
                ))}
            </div>
            <div className={`${styles.jobDetails}`}>
                {currentJob && (
                    <div>
                        <h1>
                            {currentJob.title} &nbsp;
                            <a href={currentJob.link} target="_blank">
                                <FontAwesomeIcon icon={faArrowUpRightFromSquare}/>
                            </a>
                        </h1>
                        <table>
                            <tbody>
                            <tr>
                                <td>Company:</td>
                                <td>
                                    {currentJob.company && (
                                        <strong>
                                            {currentJob.company}
                                            <a
                                                href={currentJob.company_link}
                                                target="_blank"
                                            >
                                                <FontAwesomeIcon icon={faArrowUpRightFromSquare}/>
                                            </a>
                                        </strong>
                                    )}
                                </td>
                                <td style={{width: "10px"}}>&nbsp;</td>
                                <td>ID:</td>
                                <th>{currentJob.jk}</th>
                            </tr>
                            <tr>
                                <td>Salary:</td>
                                <td><strong>{currentJob.salary}</strong></td>
                                <td>&nbsp;</td>
                                <td>Query:</td>
                                <th>{currentJob.search_query}</th>
                            </tr>
                            <tr>
                                <td>Status:</td>
                                <td>
                                    {currentJob.status}
                                </td>
                                <td>&nbsp;</td>
                                <td>Date:</td>
                                <th>{currentJob.new_date}</th>
                            </tr>
                            </tbody>
                        </table>
                        <hr/>
                        <div dangerouslySetInnerHTML={{__html: currentJob.post_html}}/>
                    </div>
                )}
            </div>
        </div>
    )
};

export default JobsPage;