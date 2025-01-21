import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../store/reducers";
import {useNavigate} from "react-router-dom";
import {WorkLog} from '../../store/reducers/workLogReducer';
import "./Home.css";

interface Worklog {
    id?: number|null;
    startAt: string;
    endAt: string;
    duration: number;
    subject: string;
    description: string;
    scratchpad: string;
    inProgress: boolean;
}

const HomePage: React.FC = () => {
    const [draggedEvent, setDraggedEvent] = useState<string | null>(null);
    const [worklogEvent, setWorklogEvent] = useState<string | null>(null);
    const [currentWorklog, setcurrentWorklog] = useState<Worklog | null>({
        id: 0,
        startAt: new Date().toISOString(),
        endAt:  new Date().toISOString(),
        duration: 1,
        subject: '',
        description: '',
        scratchpad: '',
        inProgress: true,
    });
    const [eventTimeline, setEventTimeline] = useState<Record<number, string>>({});

    const navigate = useNavigate();
    const count = useSelector((state: RootState) => state.counter.count);
    const dispatch = useDispatch();

    const workLogs = useSelector((state: RootState) => state.workLogs.workLogs);
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const totalMinutesSinceStart = ((currentHour - 6) * 60) + currentMinute;
    const scrollPosition = Math.floor(totalMinutesSinceStart / 5);
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const interval = setInterval(() => {
            setcurrentWorklog((prevWorklog) => {
                if (!prevWorklog) return null;
                return {
                    ...prevWorklog, duration: prevWorklog.duration + 1,
                };
            });
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        async function fetchData() {
            const query = `SELECT *
                           FROM main.work_log ORDER BY start_at DESC`;
            const response = await fetch(`${API_BASE_URL}/api/db`, {
                method: "POST", headers: {
                    "Content-Type": "application/json",
                }, body: JSON.stringify({query}),
            });
            return response.json();
        }

        fetchData()
            .then((data) => {
                if (Array.isArray(data)) {
                    const parsedWorkLogs: WorkLog[] = data.map((item) => ({
                        id: item.id,
                        startAt: item.start_at,
                        endAt: item.end_at,
                        duration: item.duration,
                        subject: item.subject,
                        description: item.description,
                        scratchpad: item.scratchpad,
                        inProgress: item.in_progress,
                    }));

                    dispatch({type: "SET_WORK_LOGS", payload: parsedWorkLogs});
                } else {
                    console.error("Invalid data format received from API", data);
                }
            })
            .catch((error: unknown) => {
                console.error(error);
            });
    }, []);

    // useEffect(() => {
    //   const initialWorkLogs: WorkLog[] = [
    //     {
    //       id: 1,
    //       startAt: '2023-10-05T09:00:00Z',
    //       endAt: '2023-10-05T10:30:00Z',
    //       duration: 90,
    //       subject: 'Daily Standup',
    //       description: 'Sprint planning and updates',
    //       scratchpad: '',
    //     },
    //   ];
    //   dispatch(setWorkLogs(initialWorkLogs));
    // }, [dispatch]);

    const handleDragStart = (event: React.DragEvent<HTMLDivElement>, eventDescription: string) => {
        event.dataTransfer.setData("text/plain", eventDescription);
        setDraggedEvent(eventDescription);
        return (<div className="grid-container">
                {/* Your component JSX goes here */}
            </div>);
    }

    const handleDragOver = (event: React.DragEvent<HTMLTableRowElement>) => {
        event.preventDefault();
    };

    const handleDrop = (event: React.DragEvent<HTMLTableRowElement>, timeSlotIndex: number) => {
        event.preventDefault();
        const eventDescription = draggedEvent || event.dataTransfer.getData("text");
        if (eventDescription) {
            setEventTimeline((prev) => ({
                ...prev, [timeSlotIndex]: eventDescription,
            }));
            setDraggedEvent(null);
        }
    };

    // React.useEffect(() => {
    //   const handleKeyPress = (event: KeyboardEvent) => {
    //     if (event.key === "1") {
    //       navigate("/jobdetails");
    //     }
    //     if (event.key === "2") {
    //       navigate("/calendar");
    //     }
    //   };
    //
    //   window.addEventListener("keydown", handleKeyPress);
    //
    //   return () => {
    //     window.removeEventListener("keydown", handleKeyPress);
    //   };
    // }, []);

    // React.useEffect(() => {
    //     const tableRow = document.querySelector(`.time-row-${scrollPosition}`);
    //     tableRow?.scrollIntoView({behavior: "smooth", block: "center"});
    // }, [scrollPosition]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setcurrentWorklog((prevWorklog) => {
            if (!prevWorklog) return null;
            return {
                ...prevWorklog,
                subject: event.target.value,
            };
        });
        console.log('handleChange', currentWorklog);
    };

    const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' ) {
            console.log('Saving worklog...', currentWorklog);

            const worklogPayload = {
                startAt: currentWorklog?.startAt,
                endAt: currentWorklog?.endAt,
                duration: currentWorklog?.duration,
                subject: currentWorklog?.subject,
                description: currentWorklog?.description,
                scratchpad: currentWorklog?.scratchpad,
                inProgress: currentWorklog?.inProgress,
            };

            try {
                const response = await fetch(`${API_BASE_URL}/api/worklogs`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(worklogPayload),
                });

                if (!response.ok) {
                    console.log('Failed to save worklog:', response);
                    throw new Error('Failed to save worklog');
                }

                const savedWorklog = await response.json();
                const worklog = {
                    id: savedWorklog.id,
                    startAt: savedWorklog.start_at,
                    endAt: savedWorklog.end_at,
                    duration: savedWorklog.duration,
                    subject: savedWorklog.subject,
                    description: savedWorklog.description,
                    scratchpad: savedWorklog.scratchpad,
                    inProgress: savedWorklog.in_progress,
                };

                console.log('Worklog saved to database:', worklog);

                dispatch({ type: 'ADD_WORK_LOG', payload: worklog });

                setcurrentWorklog({
                    id: 0,
                    startAt: new Date().toISOString(),
                    endAt: new Date().toISOString(),
                    duration: 1,
                    subject: '',
                    description: '',
                    scratchpad: '',
                    inProgress: true,
                });
            } catch (error) {
                console.error('Error saving worklog:', error);
            }
        }
    };

    return (<div className="grid-container">
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th>Start</th>
                        <th>Duration</th>
                        <th>Event</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>{currentWorklog?.startAt ? new Date(currentWorklog.startAt).toLocaleTimeString([], {
                            hour: '2-digit', minute: '2-digit', hour12: true
                        }) : ''}</td>
                        <td>{currentWorklog?.duration}m</td>
                        <td>
                            <input
                                name="worklogEvent"
                                type="text"
                                placeholder="Enter text here"
                                className="bottom-input"
                                style={{width: '100%'}}
                                value={currentWorklog?.subject ?? ''}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                            />
                        </td>
                    </tr>
{workLogs.map((workLog, index) => {
    const currentDate = new Date(workLog.startAt).toLocaleDateString();
    const previousDate = index > 0 ? new Date(workLogs[index - 1].startAt).toLocaleDateString() : null;
    const isNewDate = currentDate !== previousDate;

    return (
        <React.Fragment key={workLog.id}>
            {isNewDate && (
                <tr>
                    <td colSpan={3} style={{ fontWeight: 'bold' }}>
                        {currentDate}
                    </td>
                </tr>
            )}
            <tr>
                <td style={{width: '135px'}}>
                    {new Date(workLog.startAt).toLocaleTimeString([], {
                        hour: '2-digit', minute: '2-digit', hour12: true
                    })}
                </td>
                <td style={{width: '50px'}}>
                    {workLog.duration}m
                </td>
                <td>{workLog.subject} </td>
            </tr>
        </React.Fragment>
    );
})}

                    </tbody>
                </table>
    </div>)
}

export default HomePage;
