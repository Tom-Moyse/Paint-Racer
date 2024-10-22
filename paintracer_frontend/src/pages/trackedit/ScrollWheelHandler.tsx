import React, { useEffect } from 'react';

function ScrollWheelHandler({ setRotation }: { setRotation: React.Dispatch<React.SetStateAction<number>> }) {
    const handleWheel = (event: WheelEvent) => {
        // Update scroll amount based on the scroll delta
        console.log("Handling Scroll!", event.deltaY);
        setRotation((prevRotation: number) => prevRotation + event.deltaY);
    };

    useEffect(() => {
        // Add event listener for wheel events
        window.addEventListener('wheel', handleWheel, { passive: true });
        
        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('wheel', handleWheel);
        };
    }, []);

    return null;
}

export default ScrollWheelHandler;