import {Link} from "react-router-dom";
import {useEffect, useState} from "react";
import styles from './TopNav.module.css';

function TopNav() {

    const [countdown, setCountdown] = useState("");

    useEffect(() => {
        const targetTime = new Date();
        targetTime.setHours(14, 15, 0, 0);

        const updateCountdown = () => {
            const now = new Date();
            const difference = targetTime.getTime() - now.getTime();

            if (difference <= 0) {
                setCountdown("Time to pick up Ethan!");
                clearInterval(interval);
                return;
            }

            const hours = Math.floor(difference / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setCountdown(
                `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
            );
        };

        const interval = setInterval(updateCountdown, 1000);
        updateCountdown();

        // Cleanup interval on unmount
        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <nav className={`${styles.navbarTop}`}>
                <div className={`${styles.navbarColumn}`}>
                    <Link to="/" className={`${styles.link}`}>
                        Home
                    </Link>
                     {/*Areas*/}
                    <Link to="/areas" className={`${styles.link}`}>
                        Areas
                    </Link>
                    <Link to="/projects" className={`${styles.link}`}>
                        Projects
                    </Link>

                    {/*<Link to="/notes" className={`${styles.link}`}>*/}
                    {/*    Notes*/}
                    {/*</Link>*/}
                    {/*<Link to="/tinymce" className={`${styles.link}`}>*/}
                    {/*    TinyMCE*/}
                    {/*</Link>*/}
                    <Link to="/calendar" className={`${styles.link}`}>
                        Calendar
                    </Link>
                    <Link to="/jobs" className={`${styles.link}`}>
                        Jobs
                    </Link>
                    {/*<Link to="/timeboxing" className={`${styles.link}`}>*/}
                    {/*    Timeboxing*/}
                    {/*</Link>*/}
                </div>
                <div className={`${styles.navbarColumn}`}>
                    {/*Pick up Ethan: {countdown}*/}
                </div>
                <div className={`${styles.navbarColumn}`}>
                    <Link to="/calendar" className={`${styles.link}`}>
                        {new Date().toLocaleString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        })}
                    </Link>
                </div>
        </nav>
);
}

export default TopNav;
