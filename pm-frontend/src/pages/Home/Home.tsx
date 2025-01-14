import React, {useState} from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/reducers";
import { Link, useNavigate } from "react-router-dom";
import Table from 'react-bootstrap/Table';
import "./Home.css";
import { useEffect } from "react";
import {bottom} from "@popperjs/core";

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
        <div className="fixed-bottom" style={{bottom: '30px'}}>
          <div className="bottom-content">
            <h6>Monday, Jan 13th</h6>
            <span> {new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }).toLowerCase()} &gt; </span>
            <input type="text" placeholder="Enter text here" className="bottom-input" style={{width: '90%'}}/>
          </div>
        </div>
      </div>
  );
};

export default HomePage;
