import { Dropdown } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGrip } from "@fortawesome/free-solid-svg-icons";
import styles from "../TopNav/TopNav.module.css";
import { setSession } from "../../store/reducers/sessionReducer";

const areas = [
    {
        key: "JOB",
        title: "Job Search"
    },
    {
        key: "BUDGET",
        title: "Budget"
    },
    {
        key: "SWIFTERM",
        title: "SwiftERM"
    }
];

function TopNav() {
    const dispatch = useDispatch();
    const currentArea = useSelector((state) => state.session.area);

    const handleAreaSelect = (area) => {
        dispatch(setSession({ area: area }));
    };

    return (
        <div className={styles.dropdownContainer}>
            <Dropdown className={`px-2`} autoClose="outside">
                <Dropdown.Toggle
                    className={`nav-link py-0 ${styles.dropdownToggle}`}
                    variant=""
                >
                    <FontAwesomeIcon icon={faGrip} />
                    &nbsp; &nbsp; {currentArea?.title || 'Select an Area'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {areas.map((area) => (
                        <Dropdown.Item
                            key={area.key}
                            onClick={() => handleAreaSelect(area)}
                        >
                            {area.title}
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
}

export default TopNav;