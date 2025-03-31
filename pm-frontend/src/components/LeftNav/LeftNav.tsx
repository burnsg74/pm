import {Link} from "react-router-dom";
import {Container, Navbar} from 'react-bootstrap';
import {Nav} from "react-bootstrap";
import styles from './LeftNav.module.css';

function LeftNav() {

    return (
        <Navbar
            className={`${styles.container}`}
        >
            <Nav className="me-auto">
                <Nav.Link href="/jobs">Jobs</Nav.Link>
            </Nav>
        </Navbar>
    );
}

export default LeftNav;
