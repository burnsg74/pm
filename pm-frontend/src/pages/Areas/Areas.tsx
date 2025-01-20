import React, {useEffect, useState} from "react";
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-theme-balham.css';
import {Job} from "../Jobs/Jobs";


const Areas: React.FC = () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    const [rowData, setRowData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const columnDefs: ColDef[] = [
        { headerName: 'Name', field: 'name', sortable: true, filter: true },
        { headerName: 'Created', field: 'created_at', sortable: true, filter: true },
        { headerName: 'Update', field: 'updated_at', sortable: true, filter: true }
    ];

    useEffect(() => {
        async function fetchData() {
            const query = `SELECT * FROM areas`;
            const response = await fetch(`${API_BASE_URL}/api/db`, {
                method: "POST", headers: {
                    "Content-Type": "application/json",
                }, body: JSON.stringify({query}),
            });
            return response.json();
        }

        fetchData()
            .then((data) => {
                setRowData(data);
            })
            .catch((error: unknown) => {
                console.error(error);
            });
    }, []);

    return (<div style={{ height: 300, width: 650 }}>
        <h1 className="p-3">Areas</h1>
        <div className="ps-3" style={{ height: '100%', width: '100%' }}>
            <AgGridReact
                className="ag-theme-balham"
                rowData={rowData}
                columnDefs={columnDefs}
            />
        </div>
    </div>);
};

export default Areas;