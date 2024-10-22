export enum BrushValues {
    None = 'none',
    Road = 'road',
    Dirt = 'dirt',
    Grass = 'grass',
    Wall = 'wall',
    Start = 'start',
    Checkpoint = 'checkpoint'
}

export enum BrushShapes {
    Round = 'round',
    Square = 'square'
}

interface BrushSelectorProps {
    selected: BrushValues;
    setSelected: (value: BrushValues) => void;
    setSize: (value: number) => void;
    shape: BrushShapes;
    setShape: (value: BrushShapes) => void;
}

function BrushSelector({ selected, setSelected, setSize, shape, setShape }: BrushSelectorProps) {
    return ( 
        <div id="BrushSelector">
            <div id="NoneDiv">
                <p>Deselect Brush</p>
                <button className={selected===BrushValues.None ? 'selected' : ''} onClick={() => setSelected(BrushValues.None)}>None</button>
            </div>
            <div id="BackgroundDiv">
                <p>Background Brushes</p>
                <button className={selected===BrushValues.Road ? 'selected' : ''} onClick={() => setSelected(BrushValues.Road)}>Road</button>
                <button className={selected===BrushValues.Grass ? 'selected' : ''} onClick={() => setSelected(BrushValues.Grass)}>Grass</button>
                <button className={selected===BrushValues.Dirt ? 'selected' : ''} onClick={() => setSelected(BrushValues.Dirt)}>Dirt</button>
                <button className={selected===BrushValues.Wall ? 'selected' : ''} onClick={() => setSelected(BrushValues.Wall)}>Wall</button>
            </div>
            <div id="ForegroundDiv">
                <p>Foreground Brushes</p>
                <button className={selected===BrushValues.Start ? 'selected' : ''} onClick={() => setSelected(BrushValues.Start)}>Start</button>
                <button className={selected===BrushValues.Checkpoint ? 'selected' : ''} onClick={() => setSelected(BrushValues.Checkpoint)}>Checkpoint</button>
            </div>
            <div id="BrushTypeDiv">
                <p>Brush Attributes</p>
                <button className={shape===BrushShapes.Round ? 'selected' : ''} onClick={() => setShape(BrushShapes.Round)}>Round</button>
                <button className={shape===BrushShapes.Square ? 'selected' : ''} onClick={() => setShape(BrushShapes.Square)}>Square</button>
                <div>
                <label htmlFor="brushsize">Size:</label>
                <input id="brushsize" type="range" min={5} max={150} step={1} defaultValue={20} onChange={(e) => setSize(parseInt(e.target.value))}/>
                </div>
            </div>
        </div>
    );
}

export default BrushSelector;