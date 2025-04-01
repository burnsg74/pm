import React, {useEffect, useState} from "react";
import Card from "../Card/Card.jsx";
import GaugeChart from "./components/GaugeChart/GaugeChart.jsx";
import styles from "./styles.module.css";


const WidgetUnemploymentStatus = () => {
    const MILLISECONDS_IN_ONE_DAY = 1000 * 60 * 60 * 24; // ms in secs * secs in min * min in hours * hours in days
    const TOTAL_MONTHS_OF_UNEMPLOYMENT = 12;
    const [monthsPassed, setMonthsPassed] = useState(0);
    const [extraDaysPassed, setExtraDaysPassed] = useState(0);
    const [monthsLeft, setMonthsLeft] = useState(0);
    const [extraDaysLeft, setExtraDaysLeft] = useState(0);
    const [weeksLeft, setWeeksLeft] = useState(0);
    const [weeksPassed, setWeeksPassed] = useState(0);
    const [percentLeft, setPercentLeft] = useState(100);

    useEffect(() => {
        const startDate = new Date("2024-12-01");
        const endDate = new Date("2025-11-29");
        const today = new Date(new Date().setHours(0, 0, 0, 0));
        const totalDurationInMs = endDate.getTime() - startDate.getTime();
        const totalDurationInDays = totalDurationInMs / MILLISECONDS_IN_ONE_DAY;
        const daysPassed = Math.floor(Math.max(0, (today.getTime() - startDate.getTime()) / MILLISECONDS_IN_ONE_DAY));
        const remainingDays = Math.ceil(Math.max(0, totalDurationInDays - daysPassed));
        const percentLeft = Math.ceil((remainingDays / totalDurationInDays) * 100);
        const weeksPassed = Math.floor(daysPassed / 7);
        const weeksLeft = Math.floor(remainingDays / 7);
        const daysPerMonth = totalDurationInDays / TOTAL_MONTHS_OF_UNEMPLOYMENT;
        const monthsPassed = Math.floor(daysPassed / daysPerMonth);
        const extraDaysPassed = Math.floor(daysPassed % daysPerMonth);
        const monthsLeft = TOTAL_MONTHS_OF_UNEMPLOYMENT - monthsPassed;
        const extraDaysLeft = Math.floor(remainingDays % daysPerMonth);

        setWeeksPassed(weeksPassed);
        setWeeksLeft(weeksLeft);
        setMonthsPassed(monthsPassed);
        setExtraDaysPassed(extraDaysPassed);
        setMonthsLeft(monthsLeft);
        setExtraDaysLeft(extraDaysLeft);
        setPercentLeft(percentLeft);
    }, []);

    return (
        <Card title={"Unemployment Status"}>
            <GaugeChart percentLeft={percentLeft}/>
            <table className={`${styles.cardTable}`}>
                <tbody>
                <tr>
                    <th>Dates:</th>
                    <td>01-Dec-2024 to 29-Nov-2025</td>
                    <td></td>
                </tr>
                <tr>
                    <th>Amount:</th>
                    <td>$836.00</td>
                    <td></td>
                </tr>
                <tr>
                    <th>Weeks Passed:</th>
                    <td>{weeksPassed} Weeks</td>
                    <td></td>
                </tr>
                <tr>
                    <th>Weeks Left:</th>
                    <td>{weeksLeft} Weeks</td>
                    <td></td>
                </tr>
                <tr>
                    <th>Time Passed:</th>
                    <td>{monthsPassed} Months, {extraDaysPassed} Days</td>
                    <td></td>
                </tr>
                <tr>
                    <th>Time Left:</th>
                    <td>{monthsLeft} Months, {extraDaysLeft} Days</td>
                    <td></td>
                </tr>
                </tbody>
            </table>
        </Card>
    );
};

export default WidgetUnemploymentStatus;