import { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { selectAllJobs, updateJob } from "@store/jobsSlice";
import { decrementJobCounter, incrementJobCounter, setJobCounters } from "@store/jobCountersSlice";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import styles from "./styles.module.css";
import { AppRootState } from "@store/store.ts";
import { Job, JobStatus } from "@app-types/job";
import { JobCounters } from "@app-types/jobCounters.ts";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const formatDate = (dateString: string | null): string => {
    if (!dateString || isNaN(new Date(dateString).getTime())) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
    });
};

const formatMoney = (amount: number | null): string => {
    if (!amount || isNaN(amount)) return "";
    return new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD',
    }).format(amount);
};

const Jobs: FC = () => {
  const dispatch = useDispatch();
  
  const { jobStatus = 'New' } = useParams<{ jobStatus?: string }>();
  const [view, setView] = useState<"table" | "detail">("table");
  const [isLocal, setIsLocal] = useState<boolean>(false);
  
  const allJobs = useSelector((state: AppRootState) => selectAllJobs(state));
  const jobs = allJobs
  .filter(job => isLocal ? job.is_local === 1 : job.is_local === 0)
  .filter(job => job.status === jobStatus);
  const [selectedJobIndex, setSelectedJobIndex] = useState<number>(0);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent): void => {
      const keyActions: Record<string, () => void> = {
        ']': goToNextJob,
        'ArrowDown': goToNextJob,
        '[': goToPrevJob,
        'ArrowUp': goToPrevJob,
        'j': goToNextJob,
        'PageDown': pageDown,
        'k': goToNextJob,
        'PageUp': pageUp,
        's': saveJob,
        'd': deleteJob,
        'a': applyJob,
        'o': openJobLink,
      };

      const action = keyActions[event.key];
      if (action) {
        event.preventDefault();
        action();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [selectedJobIndex, jobs]);

  const goToNextJob = (): void => {
    if (jobs.length > 0) {
      const nextIndex = (selectedJobIndex + 1) % jobs.length;
      setSelectedJobIndex(nextIndex);
    }
  };

  const goToPrevJob = (): void => {
    if (jobs.length > 0) {
      const prevIndex = (selectedJobIndex - 1 + jobs.length) % jobs.length;
      setSelectedJobIndex(prevIndex);
    }
  };

  const pageDown = (): void => {
    if (jobs.length > 0) {
      const nextIndex = Math.min(selectedJobIndex + 5, jobs.length - 1);
      setSelectedJobIndex(nextIndex);
    }
  };

  const pageUp = (): void => {
    if (jobs.length > 0) {
      const nextIndex = Math.max(selectedJobIndex - 5, 0);
      setSelectedJobIndex(nextIndex);
    }
  };

  const openJobLink = (): void => {
    if (jobs.length > 0) {
      const selectedJob = jobs[selectedJobIndex];
      if (selectedJob?.link) {
        window.open(selectedJob.link, "_blank");
      }
    }
  };

  const updateJobStatus = async (job: Job, newStatus: JobStatus): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/job/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldStatus: job.status,
          newStatus: newStatus,
          filePath: job.is_local ? job.job_id : undefined
        }),
      });

      if (!response.ok) {
        console.error('Failed to update job status');
        return;
      }

      // Update Redux state
      // dispatch(decrementJobCounter(job.status));
      // dispatch(incrementJobCounter(newStatus));

      const updatedJob = { ...job, status: newStatus };
      dispatch(updateJob(updatedJob));

      // If we're on a filtered view, we might need to adjust the selected index
      if (jobStatus !== 'All') {
        const nextIndex = Math.min(selectedJobIndex, jobs.length - 2);
        setSelectedJobIndex(nextIndex >= 0 ? nextIndex : 0);
      }
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };

  const saveJob = (): void => {
      const updatedJob = {
        ...jobs[selectedJobIndex],
        status: 'Saved' as JobStatus
      };
      dispatch(updateJob(updatedJob));
      fetchJobCounters()
  };

  const applyJob = (): void => {
    const updatedJob = {
      ...jobs[selectedJobIndex],
      status: 'Applied' as JobStatus
    };
    dispatch(updateJob(updatedJob));
    fetchJobCounters()
  };

  const deleteJob = (): void => {
    const updatedJob = {
      ...jobs[selectedJobIndex],
      status: 'Deleted' as JobStatus
    };
    dispatch(updateJob(updatedJob));
    fetchJobCounters()
  };

  const fetchJobCounters = async () => {
    const query = `
    SELECT 
      COALESCE(SUM(CASE WHEN status = 'New' THEN 1 ELSE 0 END), 0) as New,
      COALESCE(SUM(CASE WHEN status = 'Applied' THEN 1 ELSE 0 END), 0) as Applied,
      COALESCE(SUM(CASE WHEN status = 'Saved' THEN 1 ELSE 0 END), 0) as Saved,
      COALESCE(SUM(CASE WHEN status = 'Deleted' THEN 1 ELSE 0 END), 0) as Deleted,
      COALESCE(SUM(CASE WHEN status NOT IN ('New', 'Applied', 'Saved', 'Deleted') THEN 1 ELSE 0 END), 0) as Unknown
    FROM job`;

    try {
      const response = await fetch(`${API_BASE_URL}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: query })
      });

      if (!response.ok) {
        console.error("Failed to fetch job counters:", response.statusText);
        return;
      }

      const { data } = await response.json();
      const counters: JobCounters = data[0]; // The query returns a single row
      dispatch(setJobCounters(counters));
    } catch (error) {
      console.error("Error fetching job counters:", error);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.viewContainer}>
          <h2 className={styles.detailHeader}>
            <span>
              <Link to="/">🏠 </Link>
              {jobs.length > 0 ? `${jobs[selectedJobIndex]?.company_name} :: ${jobs[selectedJobIndex]?.title}` : jobStatus}
            </span>
            <span className={styles.jobNavigation}>
              {jobs.length > 0 && (
                <>
                  <FontAwesomeIcon onClick={goToPrevJob} icon={faChevronLeft} className={styles.icon}/>
                  {`Job ${selectedJobIndex + 1} of ${jobs.length}`}
                  <FontAwesomeIcon onClick={goToNextJob} icon={faChevronRight}/>
                </>
              )}
            </span>
          </h2>
          <div className={styles.skillsHeader}>
            <div className={styles.knowSkills}>
              <span className={styles.knowSkillsList}> {jobs[selectedJobIndex]?.skills} </span>
            </div>
            <div className={styles.views}>
              <span
                onClick={() => setIsLocal(!isLocal)}
                className={isLocal ? styles.active : ""}
              >
                Local
              </span>
              <span
                onClick={() => setView("table")}
                className={view === "table" ? styles.active : ""}
              >
                Table
              </span>
              <span
                onClick={() => setView("detail")}
                className={view === "detail" ? styles.active : ""}
              >
                Detail
              </span>
            </div>
          </div>
        </div>

        <div className={styles.detailsContainer}>
          {jobs.length === 0 ? 'No Jobs' : (
            view === "table" ? (
              <table className={`${styles.jobSearchTable}`}>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Title</th>
                    <th>Skills</th>
                    <th>Salary</th>
                    <th>Open</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, index) => (
                    <tr 
                      key={job.job_id}
                      className={`${styles.jobRow} ${index === selectedJobIndex ? styles.selectedRow : ""}`}
                      onClick={() => setSelectedJobIndex(index)}
                    >
                      <td>{job.company_name}</td>
                      <td>{job.title}</td>
                      <td>{job.skills}</td>
                      <td>
                        {formatMoney(job.salary_min)} - {formatMoney(job.salary_max)}
                      </td>
                      <td>
                        {job.link && (
                          <a
                            href={job.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="card-link"
                          >
                            Open in {job.source}
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className={styles.threeColumnLayout}>
                <div className={styles.leftColumn}>
                  <div className={styles.jobList}>
                    {jobs.map((job, index) => (
                      <div
                        key={job.job_id}
                        className={`${styles.jobTitle} ${
                          index === selectedJobIndex ? styles.activeJob : ""
                        }`}
                        onClick={() => setSelectedJobIndex(index)}
                      >
                        {job.title}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.middleColumn}>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: jobs[selectedJobIndex]?.job_post || "No job description available.",
                    }}
                  />
                </div>
                <div className={styles.rightColumn}>
                  {jobs[selectedJobIndex]?.link && (
                    <a
                      href={jobs[selectedJobIndex].link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-link"
                    >
                      <button className={styles.button} type="button">
                        Open in {jobs[selectedJobIndex].source}
                      </button>
                    </a>
                  )}
                  <ul>
                    <li>
                      <strong>Company:</strong> {jobs[selectedJobIndex]?.company_name}
                    </li>
                    <li>
                      <strong>Source:</strong>&nbsp;
                      {jobs[selectedJobIndex]?.link && (
                        <a
                          href={jobs[selectedJobIndex].link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="card-link"
                        >
                          Open in {jobs[selectedJobIndex].source}
                        </a>
                      )}
                    </li>
                    <li>
                      <strong>Salary:</strong>{" "}
                      {`${formatMoney(jobs[selectedJobIndex]?.salary_min)} - ${formatMoney(
                        jobs[selectedJobIndex]?.salary_max
                      )}`}
                    </li>
                    <li>
                      <strong>Date Posted:</strong> {formatDate(jobs[selectedJobIndex]?.date_posted)}
                    </li>
                    <li>
                      <strong>Status:</strong> {jobs[selectedJobIndex]?.status}
                    </li>
                  </ul>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default Jobs;