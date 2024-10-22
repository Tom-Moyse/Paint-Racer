import { useUserContext } from "../../utils/UserContext";
import { Link, useNavigate } from "react-router-dom";
import TrackBrowserGrid from "./TrackBrowserGrid";
import { useState } from "react";
import TrackSearch from "./TrackSearch";
import Navbar from "../../common/Navbar";
import "./TrackBrowser.css"

function TrackBrowserPage() {
    const { userID } = useUserContext();
    const [refresh, setRefresh] = useState(false);
    const navigate = useNavigate();

    if ( userID === undefined ){
        navigate('/')
    }

    return ( 
        <>
            <Navbar />
            <h1>Track Browser</h1>
            <TrackSearch toggleRefresh={setRefresh}/>
            <h3>Recent Tracks: </h3>
            <TrackBrowserGrid reqType="all" toggleRefresh={setRefresh} refreshKey={refresh}/>
            <h3>My Tracks: </h3>
            <TrackBrowserGrid reqType="user" toggleRefresh={setRefresh} refreshKey={refresh}/>
        </>
    );
}

export default TrackBrowserPage;