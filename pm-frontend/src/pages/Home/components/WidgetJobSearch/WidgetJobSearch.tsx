import React from "react";
import Card from "../Card/Card.jsx";
import {useSelector} from "react-redux";
import styles from "./styles.module.css"
import {Link} from "react-router-dom";

const WidgetJobSearch = () => {
    const counters = useSelector((state) => state.jobCounters.counters);

    return (
        <Card title="Job Search" >
            <table className={`${styles.cardTable}`}>
                <tbody>
                <tr>
                    <th>New Jobs:</th>
                    <td> {counters.new} </td>
                    <td></td>
                </tr>
                <tr>
                    <th>Applied Jobs:</th>
                    <td> {counters.applied} </td>
                    <td></td>
                </tr>
                <tr>
                    <th>Rejected Jobs:</th>
                    <td> {counters.rejected} </td>
                    <td></td>
                </tr>
                <tr>
                    <th>Deleted Jobs:</th>
                    <td> {counters.deleted} </td>
                    <td></td>
                </tr>
                </tbody>
            </table>

            <div className={styles.linkContainer}>
                <Link to="/jobs/apply-for-new-jobs"className={styles.link}>Apply for New Jobs</Link>
            </div>
        </Card>
    );
};

export default WidgetJobSearch;