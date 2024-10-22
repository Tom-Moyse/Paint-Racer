import React, { useEffect, useRef, useState } from "react";
import BrushSelector, { BrushShapes, BrushValues } from "./BrushSelector";
import BackgroundCanvas from "./BackgroundCanvas";
import ForegroundCanvas from "./ForegroundCanvas";
import ScrollWheelHandler from "./ScrollWheelHandler";
import BrushPreview from "./BrushPreview"
import "./canvas.css";
import "./EditWindow.css"

interface MousePos {
    X: number;
    Y: number;
}

export interface CanvasProps {
    mousePos: MousePos;
    brushType: BrushValues;
    brushSize: number;
    brushShape: BrushShapes;
    brushRotation: number;
    reset: boolean;
}

export interface ForegroundCanvasProps extends CanvasProps {
    saveCheckpoint: (x: number, y: number, rot: number, brushSize: number) => void;
    saveFinish: (x: number, y: number, rot: number, brushSize: number) => void;
}

interface CheckpointInfo {
    position: [number, number];
    rotation: number;
    size: number;
}

export interface TrackData {
    checkpoints: CheckpointInfo[];
    finish: null | CheckpointInfo;
}

function EditWindow({ saveHandler }: { saveHandler: (td: TrackData) => void}) {
    const [brush, setBrush] = useState(BrushValues.None);
    const [brushSize, setBrushSize] = useState(20);
    const [brushShape, setBrushShape] = useState(BrushShapes.Round)
    const [brushRotation, setBrushRotation] = useState(0);
    const [virtualMousePos, setVirtualMousePos] = useState<MousePos>({X: 0, Y: 0});
    const trueMousePos = useRef<MousePos>({X: 0, Y: 0});
    const mouseLockPos = useRef<MousePos>({X: 0, Y: 0});
    const mouseLocked = useRef(false);
    const [trackData, setTrackData] = useState<TrackData>({checkpoints: [], finish: null})
    const [fgReset, setFgReset] = useState(false);
    const [bgReset, setBgReset] = useState(false);

    const saveCheckpoint = (x: number, y: number, rot: number, brushSize: number) => {
        const newCP = {position: [x, y], rotation: rot, size: brushSize} as CheckpointInfo;

        setTrackData((prev) => ({finish: prev.finish, checkpoints: [...(prev.checkpoints), newCP]}));
        trackData.checkpoints.push();
        console.log(trackData);
    }

    const saveFinish = (x: number, y: number, rot: number, brushSize: number) => {
        trackData.finish = {position: [x, y], rotation: rot, size: brushSize};
    }

    const resetForeground = () => {
        setTrackData({checkpoints: [], finish: null});
        setFgReset((prev) => !prev);
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        trueMousePos.current = {X: e.clientX, Y: e.clientY}
        if (!mouseLocked.current) {
            setVirtualMousePos({X: e.clientX, Y: e.clientY});
            return
        }
        // Find locked axis based upon smaller delta
        const dx = Math.abs(e.clientX - mouseLockPos.current.X);
        const dy = Math.abs(e.clientY - mouseLockPos.current.Y);
        //console.log(dx, dy);
        if (dx >= dy){
            setVirtualMousePos({X: e.clientX, Y: mouseLockPos.current.Y});
        }
        else{
            setVirtualMousePos({X: mouseLockPos.current.X, Y: e.clientY});
        }
    }

    useEffect(() => {
        const handleShiftDown = (e: KeyboardEvent) => {
            if (e.key === "Shift" && !mouseLocked.current) { 
                console.log("Spam")
                mouseLocked.current = true;
                mouseLockPos.current = trueMousePos.current;
            }
        };
        const handleShiftUp = (e: KeyboardEvent) => {
            if (e.key === "Shift") { mouseLocked.current = false; }
        };

        document.addEventListener('keydown', handleShiftDown);
        document.addEventListener('keyup', handleShiftUp);

        return () => {
            document.removeEventListener('keydown', handleShiftDown);
            document.removeEventListener('keyup', handleShiftUp);
        }
    }, [])

    return (
        <div>
            <BrushSelector selected={brush} setSelected={setBrush} setSize={setBrushSize} shape={brushShape} setShape={setBrushShape}/>
            <p style={{margin: '0.5em 0'}}>Hold shift to lock mouse to axis: {mouseLocked.current ? 'Locked' : 'Unlocked'}</p>
            <div className={brush===BrushValues.None || mouseLocked.current ? 'canvas-container' : 'canvas-container no-cursor'} onMouseMove={(e) => handleMouseMove(e)}>
                <BackgroundCanvas brushType={brush} brushSize={brushSize} brushRotation={brushRotation} brushShape={brushShape} mousePos={virtualMousePos} reset={bgReset}/>
                <ForegroundCanvas brushType={brush} brushSize={brushSize} brushRotation={brushRotation} brushShape={brushShape} mousePos={virtualMousePos} 
                    saveCheckpoint={saveCheckpoint} saveFinish={saveFinish} reset={fgReset}/>
            </div>
            <BrushPreview brushType={brush} brushSize={brushSize} brushShape={brushShape} brushRotation={brushRotation} mousePos={virtualMousePos} reset={false}/>
            <ScrollWheelHandler setRotation={setBrushRotation}/>
            <button onClick={() => saveHandler(trackData)}
                disabled={trackData.finish === null || trackData.checkpoints.length === 0}>Save</button>
            <button onClick={resetForeground}>Reset Foreground</button>
            <button onClick={() => setBgReset((prev) => !prev)}>Reset Background</button>
        </div>
    );
}

export default EditWindow;