import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { TrackData } from "../trackedit/EditWindow";
import finishImage from "../../assets/img/Checkerboard_pattern.png";
import carImage from "../../assets/img/CarSprite.png";
import { KeyInputs } from "./RaceWindow";
import { BrushValues } from "../trackedit/BrushSelector";
import { Point, rotateLine, rotatePoint, doIntersect } from "./GameUtils";

interface CarInfo{
    position: Point;
    corners: Point[];
    rotation: number;
    velocity: [number, number];
    maxspeed: number;
    accel: number;
}

interface CheckpointStruct{
    endpoint1: Point;
    endpoint2: Point;
    hit: boolean;
}

function mapPixDataBrushValue(pixData: Uint8ClampedArray): BrushValues{
    // See BGCanvas Color Map for pixel values
    if (pixData[0] === 20 && pixData[1] === 145 && pixData[2] === 47){ return BrushValues.Grass; }
    if (pixData[0] === 121 && pixData[1] === 125 && pixData[2] === 133){ return BrushValues.Road; }
    if (pixData[0] === 138 && pixData[1] === 70 && pixData[2] === 45){ return BrushValues.Dirt; }
    if (pixData[0] === 46 && pixData[1] === 44 && pixData[2] === 41){ return BrushValues.Wall; }
    return BrushValues.None
}

function genCheckpoints(td: TrackData): CheckpointStruct[]{
    let result: CheckpointStruct[] = [];
    td.checkpoints.forEach(cp => {
        const ends = rotateLine(cp.position[0], cp.position[1], cp.size*2, cp.rotation);
        result.push({endpoint1: ends.endpoint1, endpoint2: ends.endpoint2, hit: false})
    });
    return result
}

function genCornerPositions(pos: Point, rot: number, hwidth=16, hheight=32){
    const initPoints= [
        {x: pos.x + hwidth, y: pos.y + hheight}, 
        {x: pos.x + hwidth, y: pos.y - hheight}, 
        {x: pos.x - hwidth, y: pos.y + hheight}, 
        {x: pos.x - hwidth, y: pos.y - hheight}, 
    ];

    const rotatedPoints = initPoints.map(p => {
        return rotatePoint(p.x, p.y, pos.x, pos.y, rot)
    })

    return rotatedPoints;
}

function GameScreen({ imageURL, trackData, userInputs, start, reset, lapincrement }: 
    { imageURL: string, trackData: TrackData, userInputs: KeyInputs, start: boolean, reset: boolean , lapincrement: () => void}) {
    const foregroundCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const fgctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const bgctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const carImageRef = useRef<HTMLImageElement | null>(null);
    const finishImageRef = useRef<HTMLImageElement | null>(null);
    const carInfoRef = useRef<CarInfo>({position: {x: 0, y: 0}, rotation: 0, velocity: [0,0], maxspeed: 0, accel: 0, corners: genCornerPositions({x: 0, y: 0}, 0)});
    const userInputRef = useRef(userInputs);
    const requestRef = useRef(0);
    const startRef = useRef(start)
    const resetRef = useRef(reset);
    const lastTimeRef = useRef<number | null>(null);
    const checkpointRef = useRef<CheckpointStruct[]>([]);
    const finishRef = useRef<CheckpointStruct | null>(null);

    const drawStart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rot: number) => {
        const img = finishImageRef.current;
        if (!img) return false; // Make sure the image is loaded

        const width = size * 2;
        const height = size / 2;


        ctx.save();
        // Move the origin to the center of the image
        ctx.translate(x, y);
        
        // Rotate the canvas
        ctx.rotate(rot);
        
        // Draw the image with the top-left corner offset to the left and up by half the image size
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        ctx.restore();
        return true;
    };

    const drawCP2 = (ctx: CanvasRenderingContext2D, cp: CheckpointStruct) => {
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = cp.hit ? 'yellow' : 'blue';
        ctx.moveTo(cp.endpoint1.x, cp.endpoint1.y);
        ctx.lineTo(cp.endpoint2.x, cp.endpoint2.y);
        ctx.stroke();
    }

    const drawCar = (ctx: CanvasRenderingContext2D, x: number, y: number, rot: number) => {
        const img = carImageRef.current;
        if (!img) return false; // Make sure the image is loaded

        const width = 32;
        const height = 64;

        ctx.save();

        ctx.translate(x, y);
        ctx.rotate(rot);
        
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        ctx.restore();
        return true;
    }

    const gameUpdate = (timestamp: number) => {
        //const starttime = performance.now();
        if (!lastTimeRef.current) {
            lastTimeRef.current = timestamp; // Initialize on the first frame
        }
    
        const dt = (timestamp - lastTimeRef.current) / 1000; // Calculate time difference between frames
        lastTimeRef.current = timestamp; // Update the lastTime for the next frame

        //console.log(dt);
        const fgcanvas = foregroundCanvasRef.current;
        if (!fgcanvas) return;

        const fgctx = fgctxRef.current;
        if (!fgctx) return;

        const bgcanvas = backgroundCanvasRef.current;
        if (!bgcanvas) return;

        const bgctx = bgctxRef.current;
        if (!bgctx) return;

        const finish = finishRef.current;
        if (!finish) return;
        
        //Update
        const car = carInfoRef.current;
        const inputs = userInputRef.current;
        const vel = car.velocity;
        const prevSpeed = Math.sqrt((vel[0] ** 2) + (vel[1] ** 2));
        const dirx = Math.cos(car.rotation - (Math.PI / 2));
        const diry = Math.sin(car.rotation - (Math.PI / 2));
        const prevPos = car.position;
        const prevCorners = car.corners;
        const prevRotation = car.rotation;

        //Detect Surface
        car.maxspeed = 100;
        car.accel = 50;
        const pixData = bgctx.getImageData(car.position.x, car.position.y, 1, 1).data;
        let drag = 0;
        let turnForce = 3;
        switch (mapPixDataBrushValue(pixData)){
            case BrushValues.Road:
                car.maxspeed = 800;
                car.accel = 800;
                drag = 0.02;
                turnForce = 4;
                break;
            case BrushValues.Grass:
                car.maxspeed = 300;
                car.accel = 200;
                drag = 0.03;
                turnForce = 2;
                break;
            case BrushValues.Dirt:
                car.maxspeed = 300;
                car.accel = 250;
                drag = 0.002;
        }

        //Update Acceleration
        let accel = 0;
        if (inputs.forward && !inputs.backward){
            accel = car.accel;
            car.rotation += inputs.right ? dt*turnForce : 0
            car.rotation -= inputs.left ? dt*turnForce : 0
        }
        else if (inputs.backward && !inputs.forward){
            accel = -car.accel;
            car.rotation += inputs.left ? dt*turnForce : 0
            car.rotation -= inputs.right ? dt*turnForce : 0
        }
        else if (!inputs.forward && !inputs.backward){
            car.rotation += (inputs.right ? dt * turnForce : inputs.left ? -dt * turnForce : 0);
        }
        //console.log(accel * dirx, accel * diry);
        //Update Velocity
        let velx = vel[0] + (accel * dirx * dt);
        let vely = vel[1] + (accel * diry * dt);
        const speed = Math.sqrt((velx ** 2) + (vely ** 2));
        if (speed > car.maxspeed){
            velx *= car.maxspeed / speed;
            vely *= car.maxspeed / speed;
        }

        velx *= 1 - drag;
        vely *= 1 - drag;

        //Update Position
        const x = car.position.x + (velx * dt);
        const y = car.position.y + (vely * dt);
        

        // Update Position + Vel
        car.position = {x: x, y: y};
        car.velocity = [velx, vely];
        car.corners = genCornerPositions(car.position, car.rotation, 14, 28);
        let crashed = false
        // Reset Position + Vel if collision
        for (let i = 0; i < 4; i++) {
            const corner = car.corners[i];
            let cornerPixel = bgctx.getImageData(corner.x, corner.y, 1, 1).data;
            if (mapPixDataBrushValue(cornerPixel) === BrushValues.Wall){
                car.position = prevPos;
                car.corners = prevCorners;
                car.velocity = [0, 0];
                car.rotation = prevRotation;
                console.log("Crash detected");
                crashed = true
                break;
            }
        }
        // Canvas border collision
        if (!crashed && (car.position.x > fgcanvas.width || car.position.x < 0 || car.position.y > fgcanvas.height || car.position.y < 0)){
            car.position = prevPos;
            car.corners = prevCorners;
            car.velocity = [0, 0];
            car.rotation = prevRotation;
            console.log("Border Crash detected");
            crashed = true
        }
        
        // Check Intersections
        // Mark checkpoints as hit
        const checkpoints = checkpointRef.current;
        let allHit = true;
        checkpoints.forEach(cps => {
            car.corners.forEach((corner, i) => {
                //console.log(corner, prevCorners[i], cps, doIntersect(cps.endpoint1, cps.endpoint2, corner, prevCorners[i]));
                cps.hit ||= doIntersect(cps.endpoint1, cps.endpoint2, corner, prevCorners[i]);
            })
            allHit &&= cps.hit;
        });

        // Check finish collision
        if (allHit){
            for (let i = 0; i < 4; i++){
                if (doIntersect(car.corners[i], prevCorners[i], finish!.endpoint1, finish!.endpoint2)){
                    lapincrement();
                    checkpoints.forEach(cps => cps.hit = false);
                    break;
                }
            }
        }


        //Draw
        fgctx.clearRect(0, 0, fgcanvas.width, fgcanvas.height);

        let start = trackData.finish!;
        drawStart(fgctx, start.position[0], start.position[1], start.size, start.rotation);

        // checkpoints.forEach(cp => {
        //     drawCP(fgctx, cp.position[0], cp.position[1], cp.size, cp.rotation);
        // });
        checkpoints.forEach(cp => {
            drawCP2(fgctx, cp);
        });
        
        drawCar(fgctx, car.position.x, car.position.y, car.rotation);

        //console.log(`${performance.now()-starttime}`);
        if (!resetRef.current){
            requestRef.current = requestAnimationFrame(gameUpdate);
        }
        
        //requestRef.current = requestAnimationFrame(gameUpdate);
    }

    useEffect(() => {
        startRef.current = start;
        resetRef.current = reset;
        if (start){
            requestRef.current = requestAnimationFrame(gameUpdate); // Start animation
            
            // Cleanup function to cancel the animation frame
            return () => {if (requestRef.current) {cancelAnimationFrame(requestRef.current);}}
        } 
        if (reset){
            console.log("Resetting!");
            cancelAnimationFrame(requestRef.current);
            carInfoRef.current = {...carInfoRef.current, velocity: [0,0], position: {x: trackData.finish!.position[0], y: trackData.finish!.position[1]}, rotation: trackData.finish!.rotation}
            checkpointRef.current = genCheckpoints(trackData);
        }
        
    }, [start, reset]);

    useEffect(() => {
        carInfoRef.current = {...carInfoRef.current, position: {x: trackData.finish!.position[0], y: trackData.finish!.position[1]}, rotation: trackData.finish!.rotation, corners: genCornerPositions({x: trackData.finish!.position[0], y: trackData.finish!.position[1]}, trackData.finish!.rotation)}
        checkpointRef.current = genCheckpoints(trackData);
        const ends = rotateLine(trackData.finish!.position[0], trackData.finish!.position[1], trackData.finish!.size*2, trackData.finish!.rotation);
        finishRef.current = {endpoint1: ends.endpoint1, endpoint2: ends.endpoint2, hit: false}
        // Draw single frame pre-start
        const fgctx = fgctxRef.current;
        if (!fgctx){ return; }
        console.log(trackData);
        // Hack to wait for image load for successful draw call
        genCheckpoints(trackData).forEach(cp => {
            drawCP2(fgctx, cp);
        });
        const dstartInterval = setInterval(() => {
            if (drawStart(fgctx, trackData.finish!.position[0], trackData.finish!.position[1], trackData.finish!.size, trackData.finish!.rotation)){
                const dcarInterval = setInterval(() => {
                    if (drawCar(fgctx, carInfoRef.current.position.x, carInfoRef.current.position.y, carInfoRef.current.rotation)){
                        clearInterval(dcarInterval);
                    }
                }, 100);
                clearInterval(dstartInterval);
            }
        }, 100);

        console.log(1);
    }, [trackData])

    useEffect(() => {
        userInputRef.current = userInputs;
    }, [userInputs])

    useEffect(() => {
        const canvas = backgroundCanvasRef.current;
        if (!canvas) return;

        const ctx = bgctxRef.current;
        if (!ctx) return;

        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.src = imageURL;

        image.onload = function() {
            ctx.drawImage(image, 0, 0);
        };
    }, [imageURL]);


    useEffect(() => {
        const car = new Image();
        car.src = carImage;

        const fin = new Image();
        fin.src = finishImage;

        car.onload = () => {
            carImageRef.current = car;
        }
        fin.onload = () => {
            finishImageRef.current = fin;
        }

        fgctxRef.current = foregroundCanvasRef.current!.getContext('2d');
        bgctxRef.current = backgroundCanvasRef.current!.getContext('2d');
    }, []);

    return (
        <div className="canvas-container">
            <canvas id="foreground-canvas" ref={foregroundCanvasRef} width={800} height={600}/>
            <canvas id="background-canvas" ref={backgroundCanvasRef} width={800} height={600}/>
        </div>
        
    );
}

export default GameScreen;