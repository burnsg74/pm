import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {Breadcrumb} from "react-bootstrap";
import styles from "./styles.module.css";
import Table from "react-bootstrap/Table";
import {setAllJobs} from "@store/reducers/reducerJobs";

const PageJobsList: React.FC = () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    const [jobs, setJobs] =  useState([])

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/jobs`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    console.error("Failed to fetch jobs:", response.statusText);
                    return;
                }

                const jobs: Job[] = await response.json();
                dispatch(setAllJobs(jobs));

            } catch (error) {
                console.error("Error fetching jobs:", error);
            }
        };

        fetchJobs();
    }, []);

    return (
        <>
            <Breadcrumb>
                <Breadcrumb.Item linkAs={Link} linkProps={{to: '/'}}>Home</Breadcrumb.Item>
                <Breadcrumb.Item active>Browse Jobs</Breadcrumb.Item>
            </Breadcrumb>
            <Table striped bordered hover size="sm">
            </Table>
        </>
    );
};

export default PageJobsList;