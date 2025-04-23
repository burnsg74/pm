import { FC, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from 'react';
import styles from "./styles.module.css";
import {useAppSelector, useAppDispatch} from '@store/hooks';
import {selectAllBookmarks, addBookmark} from '@store/bookmarkSlice';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus} from '@fortawesome/free-solid-svg-icons';

const JobBoards: FC = () => {
    const jobBoardBookmarks = useAppSelector(state =>
        selectAllBookmarks(state)
    );
    const dispatch = useAppDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBookmark, setNewBookmark] = useState({
        name: '',
        url: '',
        group: 'Job Boards'
    });

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setNewBookmark({
            name: '',
            url: '',
            group: 'Job Boards'
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewBookmark(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveBookmark = async () => {
        if (!newBookmark.name || !newBookmark.url) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL;
            const query = `INSERT INTO Bookmark (name, url, \`group\`) VALUES ('${newBookmark.name}', '${newBookmark.url}', '${newBookmark.group}')`;

            const response = await fetch(`${API_BASE_URL}/api/db-query`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save bookmark');
            }

            // Get the inserted bookmark ID
            const getBookmarkQuery = `SELECT * FROM Bookmark WHERE name = '${newBookmark.name}' AND url = '${newBookmark.url}' ORDER BY bookmark_id DESC LIMIT 1`;
            const getResponse = await fetch(`${API_BASE_URL}/api/db-query`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: getBookmarkQuery
                })
            });

            if (!getResponse.ok) {
                throw new Error('Failed to retrieve saved bookmark');
            }

            const data = await getResponse.json();
            if (data && data.length > 0) {
                // Add to Redux
                dispatch(addBookmark({
                    name: newBookmark.name,
                    url: newBookmark.url,
                    group: newBookmark.group
                }));
            }

            handleCloseModal();
        } catch (error) {
            console.error('Error saving bookmark:', error);
            alert('Failed to save bookmark. Please try again.');
        }
    };

    return (
        <div className='card'>
            <div className='cardHeader'>
                <div className={styles.headerContent}>
                    <span>Job Boards</span>
                    <FontAwesomeIcon onClick={handleOpenModal} icon={faPlus} className={styles.addButton}/>
                </div>
            </div>
            <div className='cardBody'>
                <ul className={styles.jobBoardLinks}>
                    {jobBoardBookmarks.map((bookmark: { bookmark_id: Key | null | undefined; url: string | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }) => (
                        <li key={bookmark.bookmark_id}>
                            <a
                                href={bookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {bookmark.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3>Add New Job Board</h3>
                            <button 
                                className={styles.closeButton}
                                onClick={handleCloseModal}
                            >
                                &times;
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label htmlFor="name">Name:</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={newBookmark.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter job board name"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="url">URL:</label>
                                <input
                                    type="text"
                                    id="url"
                                    name="url"
                                    value={newBookmark.url}
                                    onChange={handleInputChange}
                                    placeholder="Enter job board URL"
                                />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button 
                                className={styles.cancelButton}
                                onClick={handleCloseModal}
                            >
                                Cancel
                            </button>
                            <button 
                                className={styles.saveButton}
                                onClick={handleSaveBookmark}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobBoards;