import React, {useEffect, useState} from "react";
import {useParams} from 'react-router-dom';
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
    html?: string;
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

const JobDetail = () => {
    const {jobId} = useParams<{ jobId: string }>();
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    const SKILLS_KNOWN = ["HTML", "JavaScript", "CSS", "NoSQL", "SQL", "React", "Vue", "Node.js", "Node", "Python", "PHP", "Git", "AWS", "TypeScript", "Svelte", "Flutter", "Django", "Laravel", "jQuery", "SCSS", "Jest", "Cypress", "MySQL", "Javascript", "CI/CD", "Jira", "DynamoDB", "Linux", "Vuex", "Redis", "PostgreSQL"].map(escapeRegExp);
    const [job, setJob] = useState<Job | null>(null);

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
            const response = await fetch(`${API_BASE_URL}/api/job/get/` + jobId, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const jobsData: Job = await response.json();
            const parsedContent = await marked(jobsData.content);
            jobsData.html = highlightWords(parsedContent);
            console.log(jobsData);
            return jobsData;
        }

        fetchData()
            .then((data: Job) => {
                console.log(data);
                setJob(data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [jobId, setJob]);

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

    const pageDown = () => {
        window.scrollBy({top: window.innerHeight, behavior: 'smooth'});
    };

    const pageUp = () => {
        window.scrollBy({top: -window.innerHeight, behavior: 'smooth'});
    };

    return (
        <div className={`${styles.container}`}>
            <Breadcrumb>
                <Breadcrumb.Item linkAs={Link} linkProps={{to: '/'}}>Home</Breadcrumb.Item>
                <Breadcrumb.Item linkAs={Link} linkProps={{to: '/jobs/list'}}>Job List</Breadcrumb.Item>
                <Breadcrumb.Item active>Job Details</Breadcrumb.Item>
            </Breadcrumb>

            <div className={styles.twoColumnLayout}>
                <div className={styles.leftColumn}>
                    <h2>{job?.title}</h2>
                    {job.skills_known}
                    <div dangerouslySetInnerHTML={{__html: job?.html || ""}}/>
                </div>
                <div className={styles.rightColumn}>
                    <ul>
                        <li><strong>Company:</strong> {job?.company}</li>
                        <li><strong>Salary:</strong> {formatMoney(job?.salary_min)} - {formatMoney(job?.salary_max)}
                        </li>
                        <li><strong>Date Posted:</strong> {formatDate(job?.date_posted)}</li>
                        <li><strong>Status:</strong> {job?.status}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default JobDetail;