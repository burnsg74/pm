import React, {useState} from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/reducers";
import { Link, useNavigate } from "react-router-dom";
import Table from 'react-bootstrap/Table';
import "./TimeBoxing.css";
import { useEffect } from "react";

const HomePage: React.FC = () => {
  const [draggedEvent, setDraggedEvent] = useState<string | null>(null);
  const [eventTimeline, setEventTimeline] = useState<Record<number, string>>({});

  const navigate = useNavigate();
  const count = useSelector((state: RootState) => state.counter.count);
  const dispatch = useDispatch();

  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const totalMinutesSinceStart = ((currentHour - 6) * 60) + currentMinute;
  const scrollPosition = Math.floor(totalMinutesSinceStart / 5);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, eventDescription: string) => {
    event.dataTransfer.setData("text/plain", eventDescription); // Optionally pass data
    setDraggedEvent(eventDescription);
  };

  const handleDragOver = (event: React.DragEvent<HTMLTableRowElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLTableRowElement>, timeSlotIndex: number) => {
    event.preventDefault();
    const eventDescription = draggedEvent || event.dataTransfer.getData("text"); // Retrieve the event details
    if (eventDescription) {
      setEventTimeline((prev) => ({
        ...prev,
        [timeSlotIndex]: eventDescription,
      }));
      setDraggedEvent(null);
    }
  };

  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
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

  React.useEffect(() => {
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
                        <div className="dropped-event">{eventTimeline[index]}</div>
                    ) : (
                        ""
                    )}
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
