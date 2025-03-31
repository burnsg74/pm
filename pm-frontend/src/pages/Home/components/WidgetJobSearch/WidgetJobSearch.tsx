import React from "react";
import Card from "../Card/Card.jsx";
import styles from "../WidgetUnemploymentStatus/styles.module.css";

const WidgetJobSearch = () => {
    return (
        <Card title="Job Search" >
            <table className={`${styles.cardTable}`}>
                <tbody>
                <tr>
                    <th>New Jobs:</th>
                    <td> 0 </td>
                    <td>Add</td>
                </tr>
                <tr>
                    <th>Applied Jobs:</th>
                    <td> 0 </td>
                    <td></td>
                </tr>
                </tbody>
            </table>
        </Card>
    );
};

export default WidgetJobSearch;