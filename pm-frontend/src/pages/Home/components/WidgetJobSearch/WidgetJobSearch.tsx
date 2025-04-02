import React from "react";
// import Card from "../Card/Card.jsx";
import Card from 'react-bootstrap/Card';
import {useSelector} from "react-redux";
import styles from "./styles.module.css"
import {Link} from "react-router-dom";
import Table from "react-bootstrap/Table";
import {Button} from "react-bootstrap";

const WidgetJobSearch = () => {
    const counters = useSelector((state) => state.jobCounters.counters);

    return (
        <Card>
            <Card.Header as="h5">Job Search</Card.Header>
            <Card.Body>
                <Table className={`${styles.cardTable}`} bordered hover size="sm">
                    <tbody>
                    <tr>
                        <th>New:</th>
                        <td> {counters.new} </td>
                        <td style={{textAlign:"end"}}><Link to="/jobs/review-new-jobs" className="card-link">
                            Review New Job
                        </Link></td>
                    </tr>
                    <tr>
                        <th>Saved:</th>
                        <td> {counters.applied} </td>
                        <td style={{textAlign:"end"}}><Link to="/jobs/apply-for-new-jobs" className="card-link">
                            Apply for New Job
                        </Link></td>
                    </tr>
                    <tr>
                        <th>Applied:</th>
                        <td> {counters.applied} </td>
                    </tr>
                    <tr>
                        <th>Rejected:</th>
                        <td> {counters.rejected} </td>
                    </tr>
                    <tr>
                        <th>Deleted:</th>
                        <td> {counters.deleted} </td>
                    </tr>
                    </tbody>
                </Table>
            </Card.Body>
            <Card.Footer className={`text-center`}>
                <Link to="/jobs/grid" className="card-link">
                    <Button variant="outline-primary">Browse Jobs</Button>
                </Link>
                <Link to="/jobs/review-new-jobs" className="card-link">
                    <Button variant="outline-primary">Review New Jobs</Button>
                </Link>
            </Card.Footer>
        </Card>
    );
};

export default WidgetJobSearch;