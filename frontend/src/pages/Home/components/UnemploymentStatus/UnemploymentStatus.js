"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var styles_module_css_1 = require("./styles.module.css");
var GaugeChart_tsx_1 = require("./components/GaugeChart/GaugeChart.tsx");
var UnemploymentStatus = function () {
    var MILLISECONDS_IN_ONE_DAY = 1000 * 60 * 60 * 24; // ms in secs * secs in min * min in hours * hours in days
    // const TOTAL_MONTHS_OF_UNEMPLOYMENT = 12;
    var TOTAL_WEEKS = 26;
    var _a = (0, react_1.useState)(0), weeksLeft = _a[0], setWeeksLeft = _a[1];
    var _b = (0, react_1.useState)(0), weeksPassed = _b[0], setWeeksPassed = _b[1];
    var _c = (0, react_1.useState)(100), percentLeft = _c[0], setPercentLeft = _c[1];
    (0, react_1.useEffect)(function () {
        var startDate = new Date("2024-12-11");
        var totalDaysDuration = TOTAL_WEEKS * 7; // 26 weeks * 7 days = 182 days
        var today = new Date(new Date().setHours(0, 0, 0, 0));
        // Days elapsed and remaining
        var daysPassed = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / MILLISECONDS_IN_ONE_DAY));
        var daysLeft = Math.max(0, totalDaysDuration - daysPassed);
        // Calculate weeks passed, weeks left, and percentage left
        var weeksPassed = Math.floor(daysPassed / 7);
        var weeksLeft = Math.ceil(daysLeft / 7); // Rounding up weeks for partial ones
        var percentLeft = Math.ceil((weeksLeft / TOTAL_WEEKS) * 100);
        setWeeksPassed(weeksPassed); // Set weeks that have passed
        setWeeksLeft(weeksLeft); // Set remaining weeks
        setPercentLeft(percentLeft); // Update percentage left
    }, []);
    return (<div className='card'>
        <div className='cardHeader'>
            Unemployment Status
        </div>
        <div className='cardBody'>
            <GaugeChart_tsx_1.default percentLeft={percentLeft}/>
            <table className={styles_module_css_1.default.unemploymentTable}>
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
        </div>
    </div>);
};
exports.default = UnemploymentStatus;
