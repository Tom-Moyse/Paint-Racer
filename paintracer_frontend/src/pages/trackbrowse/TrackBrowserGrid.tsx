import { useUserContext } from "../../utils/UserContext";
import axInstance from "../../utils/AxiosInstance";
import { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import TrackInfoModal from "./TrackInfoModal";
import { formatISO } from "../../utils/DateHandling"
import { TrackInfo } from "../trackrace/TrackRacePage";


function TrackBrowserGrid({ reqType, toggleRefresh, refreshKey }: 
    { reqType: 'all' | 'user', toggleRefresh: React.Dispatch<React.SetStateAction<boolean>>, refreshKey: boolean}) {
    const { userID } = useUserContext();
    const [errorMsg, setErrorMsg] = useState('');
    const [tracks, setTracks] = useState<TrackInfo[]>([]);
    const [totalTracks, setTotalTracks] = useState(0);
    const [page, setPage] = useState(1); // State for current page
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);
    const [trackInfo, setTrackInfo] = useState<TrackInfo | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        fetchTracks();
    }, [page, refreshKey]);

    const fetchTracks = () => {
        let apiURL: string;
        switch (reqType) {
            case 'all':
                apiURL = `game/track/read/recent/`;
                break;
            case 'user':
                apiURL = `game/track/read/user/${userID}/`;
                break;
            default:
                break;
        }
        const axGet = async () => {
            try {
                const resp = await axInstance.get(apiURL, {params:{page: page}});

                console.log(resp);
                if (resp.status === 200){
                    console.log("Success");
                    setTracks(resp.data.results);
                    setTotalTracks(resp.data.count); 
                    setNextPage(resp.data.next);
                    setPrevPage(resp.data.previous);
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

    const goToNextPage = () => setPage(prev => prev + 1);
    const goToPrevPage = () => setPage(prev => prev - 1);

    const openModal = (track: TrackInfo) => {
        setTrackInfo(track)
        setModalOpen(true);
    }

    const closeModal = () => {
        setModalOpen(false)
    }

    if (errorMsg !== ''){
        return (
        <>
            <h1>Track Browser</h1>
            <h3>{errorMsg}</h3>
        </>
        );
    }
    return (
        <div>
            <TrackInfoModal isOpen={modalOpen} closeModal={closeModal} trackInfo={trackInfo!} toggleRefresh={toggleRefresh}/>
            <ul className="TrackGrid">
            <button className="prevButton" onClick={goToPrevPage} disabled={!prevPage}>Previous</button>
            <button className="nextButton" onClick={goToNextPage} disabled={!nextPage}>Next</button>
                {tracks.map((track, index) => (
                    <li key={index}>
                        <h4>{track.name}</h4>
                        <p>{formatISO(track.created_at)}</p>
                        <button onClick={() => openModal(track)}>Info</button>
                    </li>
                ))}
            </ul>
    
            <div>
                
            </div>
    
            <p>Total Tracks: {totalTracks}</p>
        </div>
    );
}

export default TrackBrowserGrid;