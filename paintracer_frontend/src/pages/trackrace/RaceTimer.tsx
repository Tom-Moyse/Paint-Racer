import { useState, useEffect, useRef } from 'react';

export const formatTime = (time: number) => {
    const milliseconds = Math.floor(time % 1000 / 10);  // Only two digits for ms
    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / 60000) % 60);
    
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`;
};

function RaceTimer({ start, stop, reset, savetime }){
    const [time, setTime] = useState(0);  // Store time in milliseconds
    const timeRef = useRef(0);
    const [isRunning, setIsRunning] = useState(false);  // Control start/stop
    const intervalRef = useRef<number | undefined>(undefined);  // To store the interval ID

    useEffect(() => {
        if (start && !isRunning) {
            setIsRunning(true);
            const startTime = Date.now() - time;
            intervalRef.current = setInterval(() => {
                setTime(Date.now() - startTime);
                timeRef.current = (Date.now() - startTime);
            }, 10);
        } else if (stop && isRunning) {
            console.log("Saving Time!");
            setIsRunning(false);
            clearInterval(intervalRef.current);
        } else if (reset) {
            setTime(0);
            clearInterval(intervalRef.current);
            setIsRunning(false);
        }
        return () => clearInterval(intervalRef.current); // Cleanup on unmount
    }, [start, stop, reset]); // React when any prop changes

    useEffect(() => {
        console.log("Mounting", time, timeRef.current);

        return () => {
            console.log("Unmounting", time, timeRef.current);
            if (timeRef.current !== 0){ savetime(timeRef.current); }
        }
    }, [])

    return <h3>{formatTime(time)}</h3>;
};

export default RaceTimer;