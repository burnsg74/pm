import {useSelector} from "react-redux";
import {Link} from "react-router-dom";
import {Table, Button, Card} from "react-bootstrap";
import styles from "./styles.module.css"
import { selectJobCountsByStatus } from "../../../../store/reducers/reducerJobs"


const WidgetJobSearch = () => {

    const counters = useSelector(selectJobCountsByStatus);

    return (
        <Card>
            <Card.Header as="h5">Job Search</Card.Header>
            <Card.Body>
                <Table className={`${styles.cardTable}`} bordered hover size="sm">
                    <tbody>
                    <tr>
                        <th>New:</th>
                        <td> {counters.New} </td>
                    </tr>
                    <tr>
                        <th>Saved:</th>
                        <td> {counters.Saved} </td>
                    </tr>
                    <tr>
                        <th>Applied:</th>
                        <td> {counters.Applied} </td>
                    </tr>
                    <tr>
                        <th>Rejected:</th>
                        <td> {counters.Rejected} </td>
                    </tr>
                    <tr>
                        <th>Deleted:</th>
                        <td> {counters.Deleted} </td>
                    </tr>
                    </tbody>
                </Table>
            </Card.Body>
            <Card.Footer className={`text-center`}>
                <Link to="/jobs/list" className="card-link">
                    <Button variant="outline-primary">Browse Jobs</Button>
                </Link>
                <Link to="/jobs/add-new-job" className="card-link">
                    <Button variant="outline-success">Add New Job</Button>
                </Link>
            </Card.Footer>
        </Card>
    );
};

export default WidgetJobSearch;