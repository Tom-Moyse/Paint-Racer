import { useRef, useState, useEffect } from "react";
import { BrushShapes, BrushValues } from "./BrushSelector";
import { CanvasProps } from "./EditWindow";

const BrushColorMap = {
    [BrushValues.Grass]: 'rgb(20, 145, 47)',
    [BrushValues.Road]: 'rgb(121, 125, 133)',
    [BrushValues.Dirt]: 'rgb(138, 70, 45)',
    [BrushValues.Wall]: 'rgb(46, 44, 41)'
}

function BackgroundCanvas({ brushType, brushSize, brushShape, mousePos, reset }: CanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const mousePosRef = useRef(mousePos);
    const [mousePressed, setMousePressed] = useState<boolean>(false);

    useEffect(() => {
        mousePosRef.current = mousePos;
        handleMouseHeld();
    }, [mousePos]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = BrushColorMap[BrushValues.Grass];
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, [reset])

    const handleMouseHeld = () => {
        if(brushType === BrushValues.None || brushType === BrushValues.Start || brushType === BrushValues.Checkpoint || !mousePressed){
            return;
        }
        draw();
    }

    const handleClick = () => {
        if(brushType === BrushValues.None || brushType === BrushValues.Start || brushType === BrushValues.Checkpoint){
            return;
        }
        draw();
    }

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = mousePosRef.current.X - rect.left;
        const y = mousePosRef.current.Y - rect.top;

        if (brushType !== BrushValues.None && brushType !== BrushValues.Start && brushType !== BrushValues.Checkpoint){
            ctx.fillStyle = BrushColorMap[brushType];
        }

        if (brushShape === BrushShapes.Round){
            ctx.beginPath();
            ctx.arc(x, y, brushSize, 0, Math.PI * 2);
            ctx.fill();
        }
        else if (brushShape === BrushShapes.Square){
            ctx.fillRect(x - brushSize, y - brushSize, brushSize * 2, brushSize * 2);
        }
    }

    return ( 
        <canvas id="background-canvas" ref={canvasRef} width={800} height={600} onMouseDown={() => setMousePressed(true)} onMouseUp={() => setMousePressed(false)} onMouseLeave={() => setMousePressed(false)} onClick={handleClick}/>
    );
}

export default BackgroundCanvas;