import React from 'react';
import WidgetJobSearch from "./components/WidgetJobSearch/WidgetJobSearch.jsx";
import WidgetUnemploymentStatus from "./components/WidgetUnemploymentStatus/WidgetUnemploymentStatus.jsx";
import styles from "./styles.module.css";

const Home = () => {
    return (
        <div className={styles.widgetsContainer}>
            <WidgetJobSearch/>
            <WidgetUnemploymentStatus/>
        </div>
    );
};

export default Home;