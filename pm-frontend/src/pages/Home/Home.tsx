import React from 'react';
import {Link} from 'react-router-dom';
import WidgetJobSearch from "./components/WidgetJobSearch/WidgetJobSearch.jsx";
import WidgetTodo from "./components/WidgetTodo/WidgetTodo.jsx";
import WidgetUnemploymentStatus from "./components/WidgetUnemploymentStatus/WidgetUnemploymentStatus.jsx";
import styles from "./styles.module.css";

const Home = () => {
    return (
        <div className={styles.widgetsContainer}>
            <WidgetTodo/>
            <WidgetJobSearch/>
            <WidgetUnemploymentStatus/>
        </div>
    );
};

export default Home;