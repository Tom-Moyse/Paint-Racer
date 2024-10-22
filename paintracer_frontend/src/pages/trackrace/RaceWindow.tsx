import { useEffect, useState } from "react";
import RaceTimer, { formatTime } from "./RaceTimer";
import LapCounter from "./LapCounter"
import GameScreen from "./GameScreen";
import { TrackInfo } from "./TrackRacePage";
import InputHandler from "./InputHandler";
import "../trackedit/canvas.css";

export interface KeyInputs{
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
}

export 

function RaceWindow({ trackInfo, submitCallback }: { trackInfo: TrackInfo, submitCallback: (time: number) => void}) {
    const [started, setStarted] = useState(false);
    const [reset, setReset] = useState(false);
    const [finish, setFinish] = useState(false);
    const [lapNum, setLapNum] = useState(0);
    const [finalTime, setFinalTime] = useState(0);

    const [inputs, setInputs] = useState<KeyInputs>({forward: false, backward: false, left: false, right: false});
    

    const handleStart = () => {
        setStarted(true);
        setReset(false);
        setFinish(false);
    }

    const handleRestart = () => {
        setStarted(false);
        setReset(true);
        setFinish(false);
        setInputs({forward: false, backward: false, left: false, right: false});
        setLapNum(0);
        setFinalTime(0);
    }

    const incrementLap = () => {
        setLapNum((num) => {
            if(num < 2){
                return num+1;
            }else{
                setFinish(true);
                setStarted(false);
                setReset(false);
                return num;
            }
        });
    }

    const handleSubmit = () => {
        console.log("Submitting: ", finalTime);
        submitCallback(finalTime);
    }

    if ( trackInfo !== null){
        if (!finish){
            return ( 
                <>  
                    <InputHandler inputSetter={setInputs}/>
                    <div>
                        <RaceTimer start={started} stop={finish} reset={reset} savetime={setFinalTime}/>
                        <LapCounter lapNum={lapNum}/>
                        <p>{inputs.forward ? 'Forward: true' : 'Forward: false'}, {inputs.backward ? 'Back: true' : 'Back: false'}, {inputs.left ? 'Left: true' : 'Left: false'}, {inputs.right ? 'Right: true' : 'Right: false'}</p>
                    </div>
                    <GameScreen trackData={trackInfo.trackdata} imageURL={trackInfo.image} userInputs={inputs} start={started} reset={reset} lapincrement={incrementLap}/>
                    <button onClick={handleStart}>Start</button>
                    <button onClick={handleRestart}>Restart</button>
                </> 
            );
        }
        return (
            <>
            <div>
                <h3>{formatTime(finalTime)}</h3>
                <LapCounter lapNum={lapNum}/>
            </div>
            <button onClick={handleSubmit}>Submit Time</button>
            <button onClick={handleRestart}>Restart</button>
            </>
        );
    }
    else{
        return (
            <>
                <div>
                    <RaceTimer start={started} stop={false} reset={reset} savetime={setFinalTime}/>
                    <LapCounter lapNum={lapNum}/>
                </div>
            </> 
        );
    }
    
}

export default RaceWindow;