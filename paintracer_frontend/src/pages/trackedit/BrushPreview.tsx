import { BrushShapes, BrushValues } from './BrushSelector';
import { CanvasProps } from './EditWindow'

function BrushPreview({ brushType, brushSize, brushShape, brushRotation, mousePos }: CanvasProps) {
    if (brushType == BrushValues.Start){
        return ( 
            <div style={{
                position: 'fixed',
                top: mousePos.Y,
                left: mousePos.X,
                width: brushSize*2,
                height: brushSize/2,
                border: '2px dashed black',
                backgroundColor: 'transparent',
                transform: `translate(-${brushSize}px,-${brushSize/4}px) rotate(${brushRotation/500}rad)`,
                pointerEvents: 'none',
                fontSize: `${brushSize}px`,
                lineHeight: 0.7,
                zIndex: 5
            }}>
            ^
            </div>
        );
    }
    if (brushType == BrushValues.Checkpoint){
        return ( 
            <div style={{
                position: 'fixed',
                top: mousePos.Y,
                left: mousePos.X,
                width: brushSize*2,
                height: 0,
                border: '2px dashed black',
                backgroundColor: 'transparent',
                transform: `translate(-${brushSize}px,0px) rotate(${brushRotation/500}rad)`,
                pointerEvents: 'none',
                zIndex: 5
            }}>
            </div>
        );
    }
    if (brushType == BrushValues.None){
        return ( 
            <>
            </> 
        );
    }

    if (brushShape == BrushShapes.Round){
        return(
            <div style={{
                position: 'fixed',
                top: mousePos.Y,
                left: mousePos.X,
                width: brushSize*2,
                height: brushSize*2,
                border: '2px dashed black',
                borderRadius: '50%',
                backgroundColor: 'transparent',
                transform: `translate(-${brushSize}px, -${brushSize}px)`,
                pointerEvents: 'none',
                zIndex: 5
            }}>
            </div>
        );
    }
    return(
        <div style={{
            position: 'fixed',
            top: mousePos.Y,
            left: mousePos.X,
            width: brushSize*2,
            height: brushSize*2,
            border: '2px dashed black',
            backgroundColor: 'transparent',
            transform: `translate(-${brushSize}px, -${brushSize}px)`,
            pointerEvents: 'none',
            zIndex: 5
        }}>
        </div>
    );
}

export default BrushPreview;