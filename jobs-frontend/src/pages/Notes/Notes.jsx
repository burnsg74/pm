import {useEffect, useState} from "react";
import styles from "./styles.module.css";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Notes = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchNotes = async (endpoint) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch notes: ${response.statusText}`);
            }

            const data = await response.text();
            setContent(data);
        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes("/api/notes/html");
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (<div className={styles.container}>
            <nav className={styles.navbar}>
                <ul className={styles.breadcrumb}>
                    <li><a href="/">Home</a></li>
                    <li>Notes</li>
                </ul>
                <span className={styles['nav-status']}>
                              <button onClick={handleEditMode} className={styles.toggleButton}>
                {isEditing ? "View HTML" : "Edit"}
            </button>
            </span>
            </nav>
            <div className={styles.contentContainer}>
                <div
                    dangerouslySetInnerHTML={{__html: content}}
                    className={styles.htmlViewer}
                />
            </div>
        </div>

    );
};

export default Notes;