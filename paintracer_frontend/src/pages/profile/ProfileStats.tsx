import { useEffect, useState } from "react";
import axInstance from "../../utils/AxiosInstance";
import { AxiosError } from "axios";
import { useUserContext } from "../../utils/UserContext";
import { formatISO } from "../../utils/DateHandling";

interface StatInfo {
    authored_playcount: number;
    distinct_playcount: number;
    playcount: number;
    tracks_authored: number;
    wr_count: number;
}
interface UserInfo {
    username: string;
    email: string;
    created_at: string;
}

function ProfileStats() {
    const [statInfo, setStatInfo] = useState<StatInfo | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
    const [errorMsg, setErrorMsg] = useState('');
    const { userID } = useUserContext();

    useEffect(() => {
        fetchStats();
    }, [])

    const fetchStats = () => {
        const axGet = async () => {
            try {
                const resp = await axInstance.get(`users/stats/${userID}`);

                console.log(resp);
                if (resp.status === 200){
                    console.log("Read stats")
                    setStatInfo(resp.data.stats)
                    setUserInfo(resp.data.info)
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

    if (errorMsg !== ''){
        return (
            <div>{errorMsg}</div>
        )
    }

    return ( 
        <div>
            {userInfo !== null && 
            <ul>
                <li>Username: {userInfo.username}</li>
                <li>Email: {userInfo.email}</li>
                <li>Date Joined: {formatISO(userInfo.created_at)}</li>
            </ul>
            }
            {statInfo !== null && 
            <ul>
                <li>Number of Plays: {statInfo.playcount}</li>
                <li>Number of Unique Tracks Played: {statInfo.distinct_playcount}</li>
                <li>Number of World Records: {statInfo.wr_count}</li>
                <li>Number of Tracks Created: {statInfo.tracks_authored}</li>
                <li>Number of Plays from others on Your Tracks: {statInfo.authored_playcount}</li>
            </ul>
            }
        </div>
    );
}

export default ProfileStats;