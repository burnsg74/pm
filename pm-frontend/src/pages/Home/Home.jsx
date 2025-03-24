import React from 'react';
import {Link} from "react-router-dom";
import {Card, Col, Container, Row} from "react-bootstrap";
import { areas } from '../../constants/areas';

const Home = () => {
    return (
        <div>
            <Container className={"mt-2"} fluid={true}>
                <Row>
                    {areas.map(area => (
                        <Col key={area.key}>
                            <Link to={area.route}>
                                <Card>
                                    <Card.Body>
                                        {area.title}
                                    </Card.Body>
                                </Card>
                            </Link>
                        </Col>
                    ))}
                </Row>
            </Container>

        </div>
    );
};

export default Home;