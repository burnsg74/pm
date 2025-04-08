import {Card} from "react-bootstrap";
import styles from "./styles.module.css"

const WidgetJobBoards = () => {

    return (
        <Card>
            <Card.Header as="h5">Job Boards</Card.Header>
            <Card.Body>

                <ol className={styles.jobBoardLinks}>
                    <li>
                        <a
                            href="https://www.linkedin.com/jobs/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            LinkedIn
                        </a>
                    </li>
                    <li>
                        <a
                            href="http://www.indeed.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Indeed
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://www.glassdoor.com/Community/index.htm"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Glassdoor
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://www.ziprecruiter.com/jobseeker/home"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            ZipRecruiter
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://www.monster.com/jobs/search?q=Full+Stack+Developer&where=Remote&page=1&so=m.s.sh"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Monster Jobs
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://remote.co/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Remote.co
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://weworkremotely.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            We Work Remotely
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://www.simplyhired.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            SimplyHired
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://www.flexjobs.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            FlexJobs
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://wellfound.com/jobs"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Wellfound
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://www.dice.com/home-feed"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Dice.com
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://larajobs.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Laravel Job Board
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://www.techcareers.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            TechCareers
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://www.hackerrank.com/apply"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            HackerRank
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://app.9am.works/job-search?page=1&smartFilter=1&tab=all"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            9am
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://www.welcometothejungle.com/en"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Welcome to the Jungle
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://www.trueup.io/myjobs"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            TrueUp
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://lensa.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Lensa
                        </a>
                    </li>
                </ol>
            </Card.Body>
        </Card>
    );
};

export default WidgetJobBoards;