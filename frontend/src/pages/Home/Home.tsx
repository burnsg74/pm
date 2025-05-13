import { FC } from "react";
import styles from "./styles.module.css";
import UnemploymentStatus from "./components/UnemploymentStatus/UnemploymentStatus.tsx";
import JobSearch from "./components/JobSearch/JobSearch.tsx"

const Home: FC = () => {
    return (
        <div className={styles.container}>
          <UnemploymentStatus/>
          <JobSearch/>
        </div>
    );
};

export default Home;