import React, {useState, useEffect} from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Table from 'react-bootstrap/Table';
import "./TimeBoxing.css";

const HomePage = () => {
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [eventTimeline, setEventTimeline] = useState({});

  const navigate = useNavigate();
  const count = useSelector((state) => state.counter.count);
  const dispatch = useDispatch();

  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const totalMinutesSinceStart = ((currentHour - 6) * 60) + currentMinute;
  const scrollPosition = Math.floor(totalMinutesSinceStart / 5);

  const handleDragStart = (event, eventDescription) => {
    event.dataTransfer.setData("text/plain", eventDescription);
    setDraggedEvent(eventDescription);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event, timeSlotIndex) => {
    event.preventDefault();
    const eventDescription = draggedEvent || event.dataTransfer.getData("text");
    if (eventDescription) {
      setEventTimeline((prev) => ({
        ...prev,
        [timeSlotIndex]: eventDescription,
      }));
      setDraggedEvent(null);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "1") {
        navigate("/jobdetails");
      }
      if (event.key === "2") {
        navigate("/calendar");
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  useEffect(() => {
    const tableRow = document.querySelector(`.time-row-${scrollPosition}`);
    tableRow?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [scrollPosition]);

  return (
      <div className="grid-container">
        <div>
          <h4>Draggable Events</h4>
          <div
              className="draggable-event"
              draggable
              onDragStart={(e) => handleDragStart(e, "Meeting")}
          >
            Meeting
          </div>
          <div
              className="draggable-event"
              draggable
              onDragStart={(e) => handleDragStart(e, "Task")}
          >
            Task
          </div>
          <div
              className="draggable-event"
              draggable
              onDragStart={(e) => handleDragStart(e, "Workshop")}
          >
            Workshop
          </div>
        </div>
        <Table striped bordered hover>
          <thead>
          <tr>
            <th>Time</th>
            <th>Description</th>
          </tr>
          </thead>
          <tbody>
          {Array.from({length: ((15 - 6) * 12)}).map((_, index) => {
            const isCurrentTime = index === scrollPosition;
            const hour = Math.floor((index * 5) / 60) + 6;
            const minute = (index * 5) % 60;
            if (minute !== 0) return null;
            const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

            return (
                <tr key={index}
                    className={`time-row-${index} ${isCurrentTime ? "current-time-row" : ""}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                >
                  <td style={{padding: 0}}>{time}</td>
                  <td style={{padding: 0, ...(isCurrentTime ? {backgroundColor: "red"} : {})}}>
                    {eventTimeline[index] ? (
                        <div>{eventTimeline[index]}</div>
                    ) : null}
                  </td>
                </tr>
            );
          })}
          </tbody>
        </Table>
      </div>
  );
};

export default HomePage;