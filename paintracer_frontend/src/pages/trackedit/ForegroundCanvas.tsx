import React, { createContext, useEffect, useRef } from "react";
import { BrushValues } from "./BrushSelector";
import { ForegroundCanvasProps } from "./EditWindow";
import finishImage from "../../assets/img/CheckerboardArrow_pattern.png";


function ForegroundCanvas({ brushType, brushSize, brushRotation, saveCheckpoint, saveFinish, reset }: ForegroundCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, [reset])

    const drawStart = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
        const img = new Image();
        img.src = finishImage;

        const width = brushSize * 2;
        const height = brushSize / 2;

        img.onload = () => {
            ctx.save();
            // Move the origin to the center of the image
            ctx.translate(x, y);
            
            // Rotate the canvas
            ctx.rotate(brushRotation / 500);
            
            // Draw the image with the top-left corner offset to the left and up by half the image size
            ctx.drawImage(img, -width / 2, -height / 2, width, height);
            ctx.restore();
        }
    };

    const drawCP = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
        const width = brushSize * 2;
        const height = 3;

        ctx.save();
        // Move the origin to the center of the image
        ctx.translate(x, y);
        
        // Rotate the canvas
        ctx.rotate(brushRotation / 500);
        
        // Draw the image with the top-left corner offset to the left and up by half the image size
        ctx.fillStyle = 'blue'
        ctx.fillRect(-width / 2, -height / 2, width, height);
        ctx.restore();

    };

    const passDownMouseEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if(brushType !== BrushValues.Checkpoint && brushType !== BrushValues.Start && brushType !== BrushValues.None){
            const eventTarget = e.currentTarget;
            eventTarget.style.pointerEvents = 'none';
            const lowerCanvas = document.elementFromPoint(e.clientX, e.clientY);
            if (lowerCanvas instanceof HTMLCanvasElement){
                const newEvent = new MouseEvent(e.type, {
                    clientX: e.clientX,
                    clientY: e.clientY,
                    bubbles: true,
                    cancelable: true,
                    view: window,
                });
                lowerCanvas.dispatchEvent(newEvent);
            }
            setTimeout(() => {
                eventTarget.style.pointerEvents = 'auto';
            }, 0);
            return;
        }
    }

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        console.log("Foreground Canvas registering click", brushType);

        if(brushType !== BrushValues.Checkpoint && brushType !== BrushValues.Start && brushType !== BrushValues.None){
            passDownMouseEvent(e);
            return;
        }
        
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (brushType === BrushValues.Start){
            drawStart(ctx, x, y);
            saveFinish(x, y, brushRotation / 500, brushSize);
        }

        if (brushType === BrushValues.Checkpoint){
            drawCP(ctx, x, y);
            saveCheckpoint(x, y, brushRotation / 500, brushSize);
        }
    }


    return ( 
        <canvas id="foreground-canvas" ref={canvasRef} width={800} height={600} 
        onClick={handleClick} onMouseDown={passDownMouseEvent} onMouseLeave={passDownMouseEvent} onMouseUp={passDownMouseEvent}/>
    );
}

export default ForegroundCanvas;