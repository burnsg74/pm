import styles from "./styles.module.css";

const Card = ({title, children}) => {
    return (
        <div className={`${styles.card}`}>
            <div className={`${styles.cardHeader}`}> {title} </div>
            <div className={`${styles.cardBody}`}>
                {children}
            </div>
        </div>
    );
};

export default Card;