import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ClientSideRowModelModule, TextFilterModule } from "ag-grid-community";
import { ModuleRegistry } from "ag-grid-community";
import { Breadcrumb } from "react-bootstrap";
import {Link} from "react-router-dom";



ModuleRegistry.registerModules([ClientSideRowModelModule, TextFilterModule]);

interface Job {
    source: string;
    company: string;
    title: string;
    link: string;
    status: string;
    date_new: string | null;
    date_applied: string | null;
    date_deleted: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

const PageJobsGrid: React.FC = () => {
    const [rowData, setRowData] = useState<Job[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [colDefs] = useState<ColDef<Job>[]>([
        { field: "source", headerName: "Source", sortable: true, filter: true },
        { field: "company", headerName: "Company", sortable: true, filter: true },
        {
            field: "title",
            headerName: "Title",
            sortable: true,
            filter: true,
            cellRenderer: (params) =>
                params.data?.link
                    ? <a href={params.data.link} target="_blank" rel="noopener noreferrer">{params.value}</a>
                    : params.value,
        },
        { field: "status", headerName: "Status", sortable: true, filter: true },
        { field: "date_new", headerName: "Date New", sortable: true, filter: true },
        { field: "date_applied", headerName: "Date Applied", sortable: true, filter: true },
        { field: "date_deleted", headerName: "Date Deleted", sortable: true, filter: true },
    ]);

    useEffect(() => {
        async function fetchJobs() {
            try {
                let response = await fetch(`${API_BASE_URL}/api/job/get-job-list`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    console.error(response);
                    return;
                }

                const data: Job[] = await response.json();
                console.log("Fetched jobs:", data);

                setRowData(data); // Set retrieved jobs data to the grid
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError("Failed to load jobs data from the database.");
                setLoading(false);
            }
        }

        fetchJobs();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }


    return (
        <div
             style={{ height: "100%", width: "100%" }}>
            <Breadcrumb>
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Home</Breadcrumb.Item>
                <Breadcrumb.Item active>Browse Jobs</Breadcrumb.Item>
            </Breadcrumb>
            <AgGridReact<Job>
                className="ag-theme-quartz"
                rowData={rowData}
                columnDefs={colDefs}
                defaultColDef={{
                    flex: 1,
                    minWidth: 100,
                    sortable: true,
                    resizable: true,
                    floatingFilter: true,
                    filter: true,
                }}
                pagination
                paginationPageSize={5}
                rowModelType="clientSide"
                overlayLoadingTemplate={
                    `<span class="ag-overlay-loading-center">Loading jobs...</span>`
                }
                overlayNoRowsTemplate={
                    `<span class="ag-overlay-no-rows-center">No rows to display</span>`
                }
            />
            {error && <p style={{color: 'red'}}>Error: {error}</p>}
        </div>
    );
};

export default PageJobsGrid;