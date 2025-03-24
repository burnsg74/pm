import {Link} from "react-router-dom";
import { Card, Col, Dropdown, Row } from 'react-bootstrap';
import styles from './AreaNav.module.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faHouse, faGrip } from "@fortawesome/free-solid-svg-icons";


function AreaNav() {

    return (
            <Dropdown.Menu
                align="end"
                className={`${styles.container}`}
                // className="navbar-dropdown-caret py-0 dropdown-nine-dots shadow border"
            >
                <Card
                    className="position-relative border-0"
                    style={{ height: '20rem', minWidth: 244 }}
                >
                        <Card.Body className="pt-3 px-3 pb-0">
                            <Row className="text-center align-items-center g-0">
                                {/*{items.map(item => (*/}
                                {/*    <Col xs={4} key={item.title}>*/}
                                {/*        <Link*/}
                                {/*            to="#!"*/}
                                {/*            className="d-block bg-body-secondary-hover p-2 rounded-3 text-center text-decoration-none mb-3"*/}
                                {/*        >*/}
                                {/*            <img*/}
                                {/*                src={item.img}*/}
                                {/*                alt="behance"*/}
                                {/*                width={item.width || 30}*/}
                                {/*            />*/}
                                {/*            <p className="mb-0 text-body-emphasis text-truncate fs-10 mt-1 pt-1">*/}
                                {/*                {item.title}*/}
                                {/*            </p>*/}
                                {/*        </Link>*/}
                                {/*    </Col>*/}
                                {/*))}*/}
                            </Row>
                        </Card.Body>
                </Card>
            </Dropdown.Menu>
    );
}

export default AreaNav;
