import {useEffect, useState} from "react";
import styles from "./styles.module.css";
import GaugeChart from "./components/GaugeChart/GaugeChart.tsx";

const UnemploymentStatus = () => {

    const MILLISECONDS_IN_ONE_DAY = 1000 * 60 * 60 * 24; // ms in secs * secs in min * min in hours * hours in days
    // const TOTAL_MONTHS_OF_UNEMPLOYMENT = 12;
    const TOTAL_WEEKS = 26;
    const [weeksLeft, setWeeksLeft] = useState(0);
    const [weeksPassed, setWeeksPassed] = useState(0);
    const [percentLeft, setPercentLeft] = useState(100);

    useEffect(() => {
        const startDate = new Date("2024-12-11");
        const totalDaysDuration = TOTAL_WEEKS * 7; // 26 weeks * 7 days = 182 days
        const today = new Date(new Date().setHours(0, 0, 0, 0));

        // Days elapsed and remaining
        const daysPassed = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / MILLISECONDS_IN_ONE_DAY));
        const daysLeft = Math.max(0, totalDaysDuration - daysPassed);

        // Calculate weeks passed, weeks left, and percentage left
        const weeksPassed = Math.floor(daysPassed / 7);
        const weeksLeft = Math.ceil(daysLeft / 7); // Rounding up weeks for partial ones
        const percentLeft = Math.ceil((weeksLeft / TOTAL_WEEKS) * 100);

        setWeeksPassed(weeksPassed); // Set weeks that have passed
        setWeeksLeft(weeksLeft); // Set remaining weeks
        setPercentLeft(percentLeft); // Update percentage left

    }, []);

    return (<div className='card'>
        <div className='cardHeader'>
            Unemployment Status
        </div>
        <div className='cardBody'>
            <GaugeChart percentLeft={percentLeft}/>
            <table className={styles.unemploymentTable}>
                <tbody>
                <tr>
                    <th>Amount:</th>
                    <td>$836.00 / $752.40</td>
                </tr>
                <tr>
                    <th>Total Weeks:</th>
                    <td>26 Weeks</td>
                </tr>
                <tr>
                    <th>Weeks Passed:</th>
                    <td>{weeksPassed} Weeks</td>
                </tr>
                <tr>
                    <th>Weeks Left:</th>
                    <td>{weeksLeft} Weeks</td>
                </tr>
                </tbody>
            </table>
          <hr/>
          <a href="https://frances.oregon.gov/" target={"_blank"}>https://frances.oregon.gov/</a>
        </div>
    </div>);
};

export default UnemploymentStatus;