import styles from './TopNav.module.css';
import { Link } from "react-router-dom"

const TopNav = () => {

    return (
      <div className={`${styles.container}`}>
          <Link to="/">🏠</Link>
          <Link to="/settings">Settings</Link>
      </div>
    );
};

export default TopNav;