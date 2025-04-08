import React, {useEffect, useRef, useState} from "react";
import {Link} from "react-router-dom";
import {useSelector, useDispatch} from "react-redux";
import {selectJobCountsByStatus, selectJobs, updateJob} from "@store/reducers/reducerJobs";
import {Breadcrumb, Tab, Tabs, Table, ButtonGroup, Button} from "react-bootstrap";

import styles from "./styles.module.css";

const PageJobsList: React.FC = () => {
    const dispatch = useDispatch();
    const counters = useSelector(selectJobCountsByStatus);
    const jobs = useSelector(selectJobs) ?? [];
    const [selectedStatus, setSelectedStatus] = useState("New");
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({
        key: '',
        direction: 'ascending',
    });
    const [viewType, setViewType] = useState<"table" | "details">("table");
    const [selectedJob, setSelectedJob] = useState<Job | null>(jobs[0] ?? null);
    const jobRowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
    const sortedJobs = React.useMemo(() => {
        let sortableJobs = [...jobs.filter(job => selectedStatus === "" || job.status === selectedStatus)];
        if (sortConfig.key) {
            sortableJobs.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (["date_new", "date_applied", "date_deleted"].includes(sortConfig.key)) {
                    aValue = new Date(aValue).getTime();
                    bValue = new Date(bValue).getTime();
                } else {
                    aValue = (aValue || "").toString().toLowerCase();
                    bValue = (bValue || "").toString().toLowerCase();
                }

                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        setSelectedJob(sortableJobs[0] ?? null);
        return sortableJobs;
    }, [jobs, sortConfig, selectedStatus]);
    const handleSort = (key: string) => {
        console.log("Sorting by", key);
        let direction: "ascending" | "descending" = 'ascending';

        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }

        setSortConfig({key, direction});
    };

    // useEffect(() => {
    //     jobRowRefs.current[selectedJobIndex]?.scrollIntoView({
    //         behavior: "smooth",
    //         block: "nearest",
    //         inline: "nearest",
    //     });
    // }, [sortedJobs]);

    useEffect(() => {
        // if (selectedJob) {
        //     const jobIndex = jobs.findIndex((job) => job.id === selectedJob.id);
        //     setSelectedJobIndex(jobIndex);
        // }
        console.log("Selected job changed", selectedJob);
    }, [selectedJob])


    const goToNextJob = () => {
        if (!selectedJob) return;

        const currentIndex = sortedJobs.findIndex((job) => job.id === selectedJob.id);
        const nextIndex = (currentIndex + 1) % sortedJobs.length;

        setSelectedJob(sortedJobs[nextIndex]);
    };

    const goToPrevJob = () => {
        if (!selectedJob) return;

        const currentIndex = sortedJobs.findIndex((job) => job.id === selectedJob.id);
        const prevIndex = (currentIndex - 1 + sortedJobs.length) % sortedJobs.length;

        setSelectedJob(sortedJobs[prevIndex]);
    };

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
                case 'ArrowDown':
                    goToNextJob();
                    break;
                case 'ArrowUp':
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
    }, [sortedJobs, selectedJob]);

    const pageDown = () => {
        window.scrollBy({top: window.innerHeight, behavior: 'smooth'});
    };

    const pageUp = () => {
        window.scrollBy({top: -window.innerHeight, behavior: 'smooth'});
    };

    const saveJob = async () => {
        if (!selectedJob) return;
        try {
            const updatedJob: Job = {...selectedJob, status: "Saved"};
            const updatedJobs = jobs.filter((job) => job.id !== updatedJob.id);
            const newJob = await updateJobFile(updatedJob);
            console.log("Updated job:", newJob);

            dispatch(updateJob(newJob));

            if (updatedJobs.length > 0) {
                const currentIndex = jobs.findIndex((job) => job.id === updatedJob.id);
                const nextIndex = currentIndex >= updatedJobs.length ? 0 : currentIndex;
                setSelectedJob(updatedJobs[nextIndex]);
            } else {
                setSelectedJob(null);
            }
        } catch (error) {
            console.error("Error saving job", error);
        }
    };

    const deleteJob = async () => {
        if (!selectedJob) return;
        console.log("Deleting job:", selectedJob);
        try {
            const currentIndex = sortedJobs.findIndex((job) => job.id === selectedJob.id);
            console.log("Current index:", currentIndex);
            const updatedJob: Job = {...selectedJob, status: "Deleted"};

            console.log("Updated job:", updatedJob);
            dispatch(updateJob(updatedJob));

            const nextIndex = currentIndex >= sortedJobs.length ? 0 : currentIndex;
            console.log("Next index:", nextIndex);
            setSelectedJob(sortedJobs[nextIndex]);
        } catch (error) {
            console.error("Error saving job", error);
        }
    };

    const openJobLink = () => {
        if (selectedJob && selectedJob.link) {
            window.open(selectedJob.link, "_blank");
        }
    };

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

    return (
        <>
            <Breadcrumb>
                <Breadcrumb.Item linkAs={Link} linkProps={{to: '/'}}>Home</Breadcrumb.Item>
                <Breadcrumb.Item active>Browse Jobs</Breadcrumb.Item>
            </Breadcrumb>
            <div className="d-flex align-items-start">
                <Tabs
                    defaultActiveKey="New"
                    id="job-view-tabs"
                    onSelect={(key) => {
                        setViewType(key ?? "table")
                    }}
                >
                    <Tab eventKey="table" title='Table'></Tab>
                    <Tab eventKey="detail" title='Details'></Tab>
                </Tabs>
                <Tabs
                    className="ms-auto"
                    defaultActiveKey="New"
                    id="job-status-tabs"
                    onSelect={(key) => {
                        setSelectedStatus(key ?? "New")
                    }}
                >
                    <Tab eventKey="New" title={`New (${counters.New})`}></Tab>
                    <Tab eventKey="Saved" title={`Saved (${counters.Saved})`}></Tab>
                    <Tab eventKey="Applied" title={`Applied (${counters.Applied})`}></Tab>
                </Tabs>
            </div>
            {viewType === "table" ? (
                <Table striped bordered hover size="sm">
                    <thead>
                    <tr>
                        <th onClick={() => handleSort('company')}>
                            Company {sortConfig.key === 'company' ? (sortConfig.direction === 'ascending' ? '🔼' : '🔽') : ''}
                        </th>
                        <th onClick={() => handleSort('title')}>
                            Title {sortConfig.key === 'title' ? (sortConfig.direction === 'ascending' ? '🔼' : '🔽') : ''}
                        </th>
                        <th onClick={() => handleSort('skills_known')}>
                            Title {sortConfig.key === 'skills_known' ? (sortConfig.direction === 'ascending' ? '🔼' : '🔽') : ''}
                        </th>
                        <th onClick={() => handleSort('status')}>
                            Status {sortConfig.key === 'status' ? (sortConfig.direction === 'ascending' ? '🔼' : '🔽') : ''}
                        </th>
                        <th onClick={() => handleSort('date')}>
                            Date {sortConfig.key === 'date' ? (sortConfig.direction === 'ascending' ? '🔼' : '🔽') : ''}
                        </th>
                        <th onClick={() => handleSort('source')}>
                            Source {sortConfig.key === 'source' ? (sortConfig.direction === 'ascending' ? '🔼' : '🔽') : ''}
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedJobs.map((job, index) => (
                        <tr
                            key={job.id}
                            ref={(el) => {
                                jobRowRefs.current[index] = el;
                            }}
                            className={job === selectedJob ? styles.activeRow : ''}
                            style={{cursor: "pointer"}}
                            onClick={() => setSelectedJob(job)}
                        >
                            <td>{job.company}</td>
                            <td>{job.title}</td>
                            <td>{job.skills_known}</td>
                            <td>{job.status}</td>
                            <td>
                                {job.status === "New" && formatDate(job.date_new)}
                                {job.status === "Applied" && formatDate(job.date_applied)}
                                {job.status === "Deleted" && formatDate(job.date_deleted)}
                            </td>
                            <td>
                                <a href={job.link} target="_blank" rel="noopener noreferrer">
                                    {job.source}
                                </a>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            ) : (
                <div className={styles.detailsContainer}>
                    <div className={styles.twoColumnLayout}>
                        <div className={styles.leftColumn}>
                            {selectedJob && (
                                <>
                                    <h2>{selectedJob?.title}
                                        <span style={{float: "right", paddingRight: 5}}>
                        {`Job ${jobs.findIndex((job) => job === selectedJob) + 1} of ${jobs.length}`}
                    </span>
                                    </h2>
                                    <div style={{marginBottom: 10, color: "darkgreen"}}>
                                        {selectedJob.skills_known}
                                    </div>

                                    <div dangerouslySetInnerHTML={{__html: selectedJob?.html || ""}}/>
                                </>
                            )}
                        </div>
                        <div className={styles.rightColumn}>
                            <ul>
                                <li><strong>Company:</strong> {selectedJob?.company}</li>
                                <li><strong>Source: </strong>
                                    &nbsp;
                                    <a href={selectedJob?.link} target="_blank" rel="noopener noreferrer" className="card-link">
                                        {selectedJob?.source}
                                    </a>
                                </li>
                                <li>
                                    <strong>Salary:</strong> {formatMoney(selectedJob?.salary_min)} - {formatMoney(selectedJob?.salary_max)}
                                </li>
                                <li><strong>Date Posted:</strong> {formatDate(selectedJob?.date_posted)}</li>
                                <li><strong>Status:</strong> {selectedJob?.status}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PageJobsList;