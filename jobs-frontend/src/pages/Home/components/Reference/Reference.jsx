import {Link} from "react-router-dom";
import styles from "./styles.module.css"

const Reference = () => {
    return (<div className='card'>
            <div className='cardHeader'>
                Reference
            </div>
            <div className='cardBody'>
                <Link to="/notes">Notes</Link>
            </div>
        </div>
    );
};

export default Reference;