import WidgetJobSearch from "./components/WidgetJobSearch/WidgetJobSearch.jsx";
import WidgetUnemploymentStatus from "./components/WidgetUnemploymentStatus/WidgetUnemploymentStatus.jsx";
import WidgetJobBoards from "./components/WidgetJobBoards/WidgetJobBoards";
import styles from "./styles.module.css";

const Home = () => {
    return (
        <div className={styles.widgetsContainer}>
            <WidgetJobSearch/>
            <WidgetUnemploymentStatus/>
            <WidgetJobBoards/>
        </div>
    );
};

export default Home;