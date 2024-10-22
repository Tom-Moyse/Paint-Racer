import React, { useState } from "react";
import TrackInfoModal from "./TrackInfoModal";
import axInstance from "../../utils/AxiosInstance";
import { AxiosError } from "axios";
import { useUserContext } from "../../utils/UserContext";
import { TrackInfo } from "../trackrace/TrackRacePage";

function TrackSearch({ toggleRefresh }:
    { toggleRefresh: React.Dispatch<React.SetStateAction<boolean>>}
) {
    const { userID } = useUserContext();
    const [modalOpen, setModalOpen] = useState(false);
    const [trackInfo, setTrackInfo] = useState<TrackInfo | null>(null);
    const [trackID, setTrackID] = useState("");
    const [errorMsg, setErrorMsg] = useState('');

    const closeModal = () => {
        setModalOpen(false)
    }
    
    const searchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        setErrorMsg('');
        e.preventDefault();
        const axGet = async () => {
            try {
                const resp = await axInstance.get(`game/track/read/${trackID}`);

                console.log(resp);
                if (resp.status === 200){
                    console.log("Success");
                    if (resp.data.author===userID || resp.data.visibility !=='private'){
                        setTrackInfo(resp.data);
                        setModalOpen(true);
                    }
                    else{
                        setErrorMsg("Track is Private");
                    }
                }
            } catch (err){
                if (err instanceof AxiosError){
                    setErrorMsg(err.response?.data.detail);
                }
                console.error(err);
            }
        }
        axGet();
    }

    return ( 
        <div>
            <form onSubmit={(e) => searchSubmit(e)}>
                <label htmlFor="trackID">Track ID: </label>
                <input type="number" id="trackID" name="trackID" onChange={(e) => setTrackID(e.target.value)}/>
                <input type="submit" />
            </form>
            <p>{errorMsg}</p>
            <TrackInfoModal isOpen={modalOpen} closeModal={closeModal} trackInfo={trackInfo!} toggleRefresh={toggleRefresh}/>
        </div>
    );
}

export default TrackSearch;