import JobBoards from "./components/JobBoards/JobBoards.jsx";
import JobSearch from "./components/JobSearch/JobSearch.jsx";
import UnemploymentStatus from "./components/UnemploymentStatus/UnemploymentStatus.jsx";
import styles from "./styles.module.css"

const Home = () => {
    return (
        <div className={styles.container}>
            <JobSearch/>
            <UnemploymentStatus/>
            <JobBoards/>
        </div>
    );
};

export default Home;