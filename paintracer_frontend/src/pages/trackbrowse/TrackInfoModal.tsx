import React, { useEffect, useState } from 'react';
import { useUserContext } from "../../utils/UserContext";
import axInstance from '../../utils/AxiosInstance';
import '../trackedit/modal.css'
import { AxiosError } from 'axios';
import { formatDuration, formatISO } from "../../utils/DateHandling"
import { Link } from 'react-router-dom';
import { TrackInfo } from '../trackrace/TrackRacePage';

export interface TrackTime{
    duration: number;
    created_at: string;
    profile_name: string;
}

function TrackInfoModal({ isOpen, closeModal, trackInfo, toggleRefresh }:
    { isOpen: boolean, closeModal: () => void, trackInfo: TrackInfo, toggleRefresh: React.Dispatch<React.SetStateAction<boolean>>}
) {
    const { userID } = useUserContext();
    const [userTime, setUserTime] = useState(null);
    const [userTimeDate, setUserTimeDate] = useState<string | null>(null);
    const [trackTimes, setTrackTimes] = useState<TrackTime[]>([]);
    const [visibility, setVisibility] = useState<string | null>(null);

    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (trackInfo === null){ return; }
        readUserTime();
        readTrackTimes();
        setVisibility(trackInfo.visibility);
    }, [trackInfo])

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setVisibility(e.target.value);
    }

    const handleVisibilityUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const axPut = async () => {
            try {
                const resp = await axInstance.put(`game/track/update/${trackInfo.id}/`, {visibility: visibility});

                console.log(resp);
                if (resp.status === 200){
                    console.log("Success Updating Visibility");
                    toggleRefresh((prev) => !prev);
                    closeModal();
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
        axPut();
    }

    const handleDelete = () => {
        const axDelete = async () => {
            try {
                const resp = await axInstance.delete(`game/track/delete/${trackInfo.id}/`);

                console.log(resp);
                if (resp.status === 204){
                    console.log("Success Deleting Track");
                    toggleRefresh((prev) => !prev);
                    closeModal();
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
        axDelete();
    }

    const readUserTime = () => {
        const axGet = async () => {
            try {
                const resp = await axInstance.get(`game/trackrecord/read/${trackInfo.id}/${userID}/`);

                console.log(resp);
                if (resp.status === 200){
                    console.log("Success Reading User Time");
                    setUserTime(resp.data.duration);
                    setUserTimeDate(resp.data.created_at);
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
        axGet();
    }

    const readTrackTimes = () => {
        const axGet = async () => {
            try {
                const resp = await axInstance.get(`game/trackrecord/read/${trackInfo.id}/`);

                console.log(resp);
                if (resp.status === 200){
                    console.log("Success Reading Track Time");
                    setTrackTimes(resp.data)
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
        axGet();
    }
    if (!isOpen) return null;

    if (errorMsg !== ''){
        return (
        <>
            <h1>Track Modal</h1>
            <h3>{errorMsg}</h3>
        </>
        );
    }

    return ( 
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={closeModal}>
                    &times; {/* Close button */}
                </button>
                <h2>Track Info</h2>
                <h3>{trackInfo.name} (TID: {trackInfo.id})</h3>
                <p>Author: {trackInfo.author_name}</p>
                <img src={trackInfo.image} width={300}></img>
                <p>{trackInfo.description}</p>
                <h3 style={{marginBottom: 0, textDecoration: 'underline'}}>Best Times</h3>
                {trackTimes.length > 0 ? 
                <ul className='TrackModalTimes'>
                    <li>Rank</li>
                    <li>Time</li>
                    <li>Date Set</li>
                    <li>User</li>
                    {trackTimes.slice(0, 5).map((trackTime, index) => (
                        <React.Fragment key={index}>
                        <li>{index + 1}</li>
                        <li>{formatDuration(trackTime.duration)}</li>
                        <li>{formatISO(trackTime.created_at)}</li>
                        <li>{trackTime.profile_name}</li>
                        </React.Fragment>
                    ))}
                </ul>
                : <p>No Times submitted</p>}
                {userTime !== null && <p>Your Best Time: {formatDuration(userTime)} Date Set: {formatISO(userTimeDate!)}</p>}
                {userID === trackInfo.author && visibility !== null && 
                <>
                <form onSubmit={(e) => handleVisibilityUpdate(e)}>
                    <label htmlFor="visibilityInput">Track Visibility: </label>
                    <select id="visibilityInput" name="visibility" onChange={handleChange} value={visibility}>
                        <option value="private">Private</option>
                        <option value="unlisted">Unlisted</option>
                        <option value="public">Public</option>
                    </select>
                    <input type="submit" value="Submit" />
                </form>
                <button onClick={handleDelete}>Delete Track</button>
                </>
                }
                <div style={{marginTop: '10px'}}>
                    <button><Link to={`/trackrace/${trackInfo.id}`}>Play</Link></button>
                </div>
            </div>
        </div>
    );
}

export default TrackInfoModal;