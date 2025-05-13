import { Link } from "react-router-dom";
import styles from "./styles.module.css";
import { useSelector } from "react-redux";
import { selectJobCounters } from "@store/jobCountersSlice";

const JobSearch = () => {
  const jobsCounters = useSelector(selectJobCounters);

  return (
    <div className="card">
      <div className="cardHeader">
        <Link to={"/jobs/New"}>Job Search </Link>
      </div>
      <div className="cardBody">
        <table className={`${styles.jobSearchTable}`}>
          <tbody>
            <tr>
              <th>
                <Link to={"/jobs/New"}>New : </Link>
              </th>
              <td> {jobsCounters.New} </td>
            </tr>
            <tr>
              <th>
                <Link to={"/jobs/Saved"}>Saved : </Link>
              </th>
              <td> {jobsCounters.Saved} </td>
            </tr>
            <tr>
              <th>
                <Link to={"/jobs/Applied"}>Applied : </Link>
              </th>
              <td> {jobsCounters.Applied} </td>
            </tr>
            <tr>
              <th>
                <Link to={"/jobs/Deleted"}>Deleted : </Link>
              </th>
              <td> {jobsCounters.Deleted} </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobSearch;
