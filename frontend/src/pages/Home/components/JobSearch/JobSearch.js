"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_router_dom_1 = require("react-router-dom");
var jobCountersSlice_1 = require("@store/jobCountersSlice");
var styles_module_css_1 = require("./styles.module.css");
var react_redux_1 = require("react-redux");
var JobSearch = function () {
    var jobsCounters = (0, react_redux_1.useSelector)(jobCountersSlice_1.selectJobCounters);
    return (<div className='card'>
            <div className='cardHeader'>
                <react_router_dom_1.Link to={'/jobs/New'}>Job Search </react_router_dom_1.Link>
            </div>
            <div className='cardBody'>
                <table className={"".concat(styles_module_css_1.default.jobSearchTable)}>
                    <tbody>
                        <tr>
                            <th><react_router_dom_1.Link to={'/jobs/New'}>New : </react_router_dom_1.Link></th>
                            <td> {jobsCounters.New} </td>
                        </tr>
                        <tr>
                            <th><react_router_dom_1.Link to={'/jobs/Saved'}>Saved : </react_router_dom_1.Link></th>
                            <td> {jobsCounters.Saved} </td>
                        </tr>
                        <tr>
                            <th><react_router_dom_1.Link to={'/jobs/Applied'}>Applied : </react_router_dom_1.Link></th>
                            <td> {jobsCounters.Applied} </td>
                        </tr>
                        <tr>
                            <th><react_router_dom_1.Link to={'/jobs/Deleted'}>Deleted : </react_router_dom_1.Link></th>
                            <td> {jobsCounters.Deleted} </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>);
};
exports.default = JobSearch;
