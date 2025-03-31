import { Link } from 'react-router-dom';
import styles from "../TopNav/TopNav.module.css";

function TopNav() {
    return (
        <div className={`${styles.container}`}>
        <nav className={`${styles.navContainer}`}>
            <Link to="/" className={`${styles.link}`} style={{textDecoration: "none", padding: 0}}>
                <img src="/images/logo.png" alt="Logo" style={{width: "20px"}} className={`${styles.logo}`}/>
                <span style={{fontStyle: "italic", marginLeft: "10px", color: "#fdfdf", fontWeight: 700}}>
                PM
                </span>
            </Link>
            <span style={{paddingLeft: 5}}> | </span>
            <div className={`${styles.links}`}>
            <Link to="/jobs" className={`${styles.link}`}>Jobs</Link>
            </div>
        </nav>
        </div>
    );
}

export default TopNav;