import styles from './Footer.module.css';
import React, { useState, useEffect } from 'react';

const Footer = () => {
    const [time, setTime] = useState('');
    const [timeUntil2PM, setTimeUntil2PM] = useState('');

    useEffect(() => {
        const updateElapsedTime = () => {
            const now = new Date();
            const todayStart = new Date();
            todayStart.setHours(6, 0, 0, 0);
            const elapsedMilliseconds = now.getTime() - todayStart.getTime();
            if (elapsedMilliseconds < 0) {
                setTime('00:00:00');
                return;
            }
            const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
            const hours = String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, '0');
            const seconds = String(elapsedSeconds % 60).padStart(2, '0');
            setTime(`${hours}:${minutes}:${seconds}`);
        };

        const updateTimeUntil2PM = () => {
            const now = new Date();
            const twoPM = new Date();
            twoPM.setHours(14, 0, 0, 0);

            if (now.getTime() > twoPM.getTime()) {
                setTimeUntil2PM('00:00:00');
                return;
            }

            const remainingMilliseconds = twoPM.getTime() - now.getTime();
            const remainingSeconds = Math.floor(remainingMilliseconds / 1000);
            const hours = String(Math.floor(remainingSeconds / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((remainingSeconds % 3600) / 60)).padStart(2, '0');
            const seconds = String(remainingSeconds % 60).padStart(2, '0');
            setTimeUntil2PM(`${hours}:${minutes}:${seconds}`);
        };

        const interval = setInterval(() => {
            updateElapsedTime();
            updateTimeUntil2PM();
        }, 1000);

        updateElapsedTime();
        updateTimeUntil2PM();

        return () => clearInterval(interval);
    }, []);

    return (
        <footer className={`${styles.footer}`}>
            <div className={`${styles.footerColumns}`}>
                <div className={`${styles.column} ${styles.left}`}>
                    {time}
                </div>
                <div className={`${styles.column} ${styles.center}`}>
                    {/* TODO: Current and next tasks */}
                </div>
                <div className={`${styles.column} ${styles.right}`}>
                    {timeUntil2PM}
                </div>
            </div>
        </footer>
    );
};

export default Footer;