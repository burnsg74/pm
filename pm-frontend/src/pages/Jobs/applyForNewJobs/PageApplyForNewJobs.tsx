import React, {useEffect, useState} from "react";
import styles from "./styles.module.css";

export default () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    const [jobs, setJobs] = useState([]);
    const [currentJob, setCurrentJob] = useState(null);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    async function UpdateJob(job) {
        const response = await fetch(`${API_BASE_URL}/api/job`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(job)
        });
        return response.json();
    }

    useEffect(() => {
        async function fetchData() {
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
                setCurrentJob(data[0]);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);
    // {
    //     "title": "Senior Full-Stack Developer",
    //     "company": "ASET Partners",
    //     "search_query": "Backend Developer,Senior Full Stack Engineer,Senior Full Stack Developer,Web Developer",
    //     "salary_min": null,
    //     "salary_max": null,
    //     "link": "https://www.indeed.com/rc/clk?jk=a817e90b240738e9&bb=jhJjf-wBjjcPtLJ4h4D8wUpsqS7CxJTMF6AmS0n8yNdUIUzs0fBEbNPtAjtdMwaWho4d0p0IvmCPkk39jOVO6UtYYJCQ7KFyy3V8ZmUijH4Py0eIWneMXLh2cs5n6W7X&xkcb=SoAU67M30f7Vf2gFnj0HbzkdCdPP&fccid=db96a7568cd8a67a&vjs=3",
    //     "status": "Applied",
    //     "date_new": "2025-03-24T14:39:50.636Z",
    //     "skills_known": "Python, React, MySQL, AWS, HTML, CSS, JavaScript, Django, Vue, Redis",
    //     "skills_unknown": ""
    // }
    return (
        <div className={`${styles.container}`}>
            {currentJob?.frontMatter && (
                <table className={`${styles.frontMatterTable}`}>
                    <tr>
                        <th>{currentJob.frontMatter.title}, {currentJob.frontMatter.company}</th>
                        <td>
                            <a
                                className={`${styles.aLink}`}
                                href={currentJob.frontMatter.link}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open in {currentJob.frontMatter.source}
                            </a>
                        </td>
                    </tr>
                    {currentJob?.frontMatter?.date_new && (
                        <tr>
                            <th>{currentJob.frontMatter.skills_known}</th>
                            <td>{formatDate(currentJob.frontMatter.date_new)}</td>
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
                        className={`${styles.statusButton}`}
                        onClick={() => {
                            const updatedJobs = jobs.map((job) =>
                                job === currentJob ? {
                                    ...job,
                                    frontMatter: {...job.frontMatter, status: "Applied"}
                                } : job
                            );
                            setJobs(updatedJobs);
                            setCurrentJob({...currentJob, frontMatter: {...currentJob.frontMatter, status: "Applied"}});
                        }}
                    >
                        Set as Applied
                    </button>
                    &nbsp;  &nbsp;
                    <button
                        className={`${styles.statusButton}`}
                        onClick={() => {
                            const updatedJobs = jobs.filter((job) => job !== currentJob);
                            setJobs(updatedJobs);
                            setCurrentJob(updatedJobs.length > 0 ? updatedJobs[0] : null);
                        }}
                    >
                        Delete Job
                    </button>
                </>
            )}
            {currentJob?.postHtml && (
                <div
                    className={`${styles.jobPostHtml}`}
                    dangerouslySetInnerHTML={{__html: currentJob.postHtml}}
                />
            )}
        </div>
    );
}