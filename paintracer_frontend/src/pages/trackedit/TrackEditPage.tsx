import { useState } from 'react';
import EditWindow, { TrackData } from './EditWindow';
import SaveForm, { TrackForm } from './SaveForm';
import { AxiosError } from 'axios';
import axInstance from '../../utils/AxiosInstance';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../utils/UserContext';
import Navbar from '../../common/Navbar';

function TrackEditPage() {
    const [formOpen, setFormOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [trackData, setTrackData] = useState<TrackData | null>(null);
    const navigate = useNavigate();
    const { userID } = useUserContext();

    const saveHandler = (trackdata: TrackData) => {
        console.log(trackdata);
        setTrackData(trackdata);
        setFormOpen(true);
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>, formData: TrackForm) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('name', formData.name);
        fd.append('description', formData.description);
        fd.append('visibility', formData.visibility);
        if (userID !== undefined) { fd.append('author', userID.toString()); }
        fd.append('trackdata', JSON.stringify(trackData));
        
        const axPost = async () => {
            try{
                console.log(fd);
                const resp = await axInstance.post("game/track/create/", fd);
                
                if (resp.status === 201){
                    console.log("Track Uploaded");
                    navigate("/tracks");
                }
            }
            catch (err){
                if (err instanceof AxiosError && err.response?.data){
                    const errMessages: string[] = [];
                    for (const [_, message] of Object.entries(err.response.data)) {
                        if (Array.isArray(message)) {
                          // Concatenate all messages for the specific field
                          errMessages.push(message[0]);
                        }
                    }
                    // Currently doesn't place on newlines
                    setErrorMsg(errMessages.join('\n'));
                    return;
                }

                console.error(err);
            }
        }
        const canvas = document.getElementById('background-canvas') as HTMLCanvasElement;

        canvas.toBlob((blob) => {
            if (blob !== null){ fd.append('image', blob, 'trackimage.png'); }
            axPost();
        })
    }

    return ( 
        <>
            <Navbar />
            <h1>Track Editor</h1>
            <EditWindow saveHandler={saveHandler}/>
            <SaveForm isOpen={formOpen} closeModal={() => setFormOpen(false)} errorMsg={errorMsg} handleSubmit={handleSubmit}/>
        </>
    );
}

export default TrackEditPage;