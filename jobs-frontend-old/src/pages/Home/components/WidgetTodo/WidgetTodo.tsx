import React, {useState, useRef, useEffect} from "react";
import { useSelector,useDispatch} from "react-redux";
import Card from "../Card/Card.jsx";
import styles from "./styles.module.css";
import {Link} from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const WidgetTodo = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const firstInputRef = useRef<HTMLInputElement>(null);
    const taskCounters = useSelector((state: any) => state.taskCounters.counters);
    const dispatch = useDispatch();

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Gather values from the form
        const formData = new FormData(e.currentTarget);
        const newTask = {
            title: formData.get("title"),
            description: formData.get("description"),
            status: formData.get("status"),
            due_date: formData.get("due_date"),
            priority: formData.get("priority"),
            recurring: formData.get("recurring"),
        };

        try {
            const query = `
                INSERT INTO tasks (title, description, status, due_date, priority, recurring)
                VALUES ('${newTask.title}',
                        '${newTask.description}',
                        '${newTask.status}',
                        '${newTask.due_date}',
                        '${newTask.priority}',
                        '${newTask.recurring}');
            `;
            const payload = {
                query,
            }

            const response = await fetch(`${API_BASE_URL}/api/db`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorDetails = await response.json();
                console.error("Error:", errorDetails);
                alert("Failed to save task.");
                return;
            }

            if (newTask.status && taskCounters[newTask.status] !== undefined) {
                dispatch({
                    type: 'INCREMENT_COUNTER',
                    payload: {
                        counter: newTask.status,
                    },
                });
            }


            console.log("Task saved successfully!");
        } catch (error) {
            console.error("Error:", error);
            alert("Unable to save task.");
        }


        closeModal();
    };

    useEffect(() => {
        if (isModalOpen && firstInputRef.current) {
            firstInputRef.current.focus();
        }
    }, [isModalOpen]);

    return (
        <Card title="TODO">
            <div>
                <table className={`${styles.cardTable}`}>
                    <tbody>
                    <tr>
                        <th>Backlog:</th>
                        <td>{taskCounters.Backlog}</td>
                        <td>
                            <button className={styles.addButton} onClick={openModal}>Add</button>
                        </td>
                    </tr>
                    <tr>
                        <th>In Progress</th>
                        <td>{taskCounters["In Progress"]}</td>
                    </tr>
                    <tr>
                        <th>Done</th>
                        <td>{taskCounters.Done}</td>
                    </tr>
                    <tr>
                        <th>Hold</th>
                        <td>{taskCounters.Hold}</td>
                    </tr>
                    </tbody>
                </table>
                <hr/>
                <Link to={'/kanban'} >Kanban Board</Link>
                <Link to={'/calendar'} >Calendar</Link>
            </div>
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Add Task</h2>
                            <button
                                aria-label="Close"
                                className={styles.closeButton}
                                onClick={closeModal}
                            >
                                ❌
                            </button>
                        </div>
                        <form onSubmit={handleFormSubmit}>
                            <div>
                                <label>
                                    Title:
                                    <input
                                        ref={firstInputRef}
                                        type="text"
                                        name="title"
                                        required
                                        className={styles.modalInput}
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    Description:
                                    <textarea
                                        name="description"
                                        className={styles.modalTextArea}
                                    ></textarea>
                                </label>
                            </div>
                            <div>
                                <label>
                                    Status:
                                    <select
                                        name="status"
                                        required
                                        className={styles.modalSelect}
                                    >
                                        <option value="Backlog">Backlog</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Done">Done</option>
                                        <option value="Hold">Hold</option>
                                    </select>
                                </label>
                            </div>
                            <div>
                                <label>
                                    Due Date:
                                    <input
                                        type="date"
                                        name="due_date"
                                        className={styles.modalInput}
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    Priority:
                                    <select
                                        name="priority"
                                        required
                                        className={styles.modalSelect}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </label>
                            </div>
                            {/*<div>*/}
                            {/*    <label>*/}
                            {/*        Recurring:*/}
                            {/*        <input*/}
                            {/*            type="text"*/}
                            {/*            name="recurring"*/}
                            {/*            placeholder="E.g., Daily, Weekly"*/}
                            {/*            className={styles.modalInput}*/}
                            {/*        />*/}
                            {/*    </label>*/}
                            {/*</div>*/}
                            <div className={styles.modalFooter}>
                                <button
                                    type="submit"
                                    className={styles.addButton}
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </Card>
    );
};

export default WidgetTodo;