import { useEffect, useState } from "react";
import axInstance from "../../utils/AxiosInstance";
import { useParams, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import RaceWindow from "./RaceWindow";
import { useUserContext } from "../../utils/UserContext";
import { TrackData } from "../trackedit/EditWindow";
import Navbar from "../../common/Navbar";

export interface TrackInfo {
    id: number;
    author: number;
    author_name: string;
    visibility: "private" | "unlisted" | "public";
    name: string;
    description: string;
    image: string;
    trackdata: TrackData;
    created_at: string;
}

function TrackRacePage() {
    const { id } = useParams();
    const { userID } = useUserContext();
    const [trackInfo, setTrackInfo] = useState<null | TrackInfo>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const axGet = async () => {
            try {
                const resp = await axInstance.get(`game/track/read/${id}/`);
                setTrackInfo(resp.data);
                console.log(resp.data);
            } catch (err){
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
        };

        axGet();
    }, [])

    const submitTime = (time: number) => {
        let data = {profile: userID, duration: time}
        const axPost = async () => {
            try {
                const resp = await axInstance.post(`game/trackrecord/create/${id}/`, data);

                console.log(resp);
                if (resp.status === 201){
                    console.log("Success");
                    navigate('/tracks');
                }
            } catch (err){
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
        axPost();
    }

    if (trackInfo !== null && (trackInfo.visibility === "private" && trackInfo.author !== userID)){
        return (
            <><h1>Track is Private and not yours :D</h1><h3>Current user ID: {userID}</h3></>
        )
    }
    if (trackInfo === null){
        return (
            <>
            <h1>Race on Track</h1>
            <h3>{errorMsg}</h3>
        </> 
        );
    }
    return ( 
        <>
            <Navbar />
            <h1>Race on Track</h1>
            <RaceWindow trackInfo={trackInfo} submitCallback={submitTime}/>
        </> 
    );
}

export default TrackRacePage;