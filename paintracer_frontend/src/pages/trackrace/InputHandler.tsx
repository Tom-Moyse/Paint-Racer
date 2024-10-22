import { useEffect } from "react";
import { KeyInputs } from "./RaceWindow";

function InputHandler({ inputSetter }: { inputSetter: React.Dispatch<React.SetStateAction<KeyInputs>>}) {
    const handleKeyPress = (e: KeyboardEvent, pressed: boolean) => {
        switch (e.key){
            case 'w':
                inputSetter((prev) => ({...prev, forward: pressed}))
                break;
            case 'a':
                inputSetter((prev) => ({...prev, left: pressed}))
                break;
            case 's':
                inputSetter((prev) => ({...prev, backward: pressed}))
                break;
            case 'd':
                inputSetter((prev) => ({...prev, right: pressed}))
                break;
        }
    }

    const keyDepressed = (e: KeyboardEvent) => { handleKeyPress(e, true);}
    const keyLifted = (e: KeyboardEvent) => { handleKeyPress(e, false);}

    useEffect(() => {
        window.addEventListener('keydown', keyDepressed);
        window.addEventListener('keyup', keyLifted);

        return () => {
            window.removeEventListener('keydown', keyDepressed);
            window.removeEventListener('keyup', keyLifted);
        };
    }, [])

    return null
}

export default InputHandler;