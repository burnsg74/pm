import JobBoards from "./components/JobBoards/JobBoards.tsx";
import JobSearch from "./components/JobSearch/JobSearch.jsx";
import Reference from "./components/Reference/Reference.jsx";
import UnemploymentStatus from "./components/UnemploymentStatus/UnemploymentStatus.jsx";
import styles from "./styles.module.css"

const Home = () => {
    return (<div className={styles.container}>
            <JobSearch/>
            <UnemploymentStatus/>
            <JobBoards/>
            <Reference/>
        </div>);
};

export default Home;