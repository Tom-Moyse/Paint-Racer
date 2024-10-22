import { useUserContext } from "../../utils/UserContext";
import { useNavigate } from "react-router-dom";
import ProfileStats from "./ProfileStats";
import { useEffect, useState } from "react";
import axInstance from "../../utils/AxiosInstance";
import { AxiosError } from "axios";
import Navbar from "../../common/Navbar";
import "./ProfilePage.css";

function ProfilePage() {
    const { userID, setUserID } = useUserContext();
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (userID === undefined) {
            navigate('/');
        }
    }, [userID]);

    const handleLogout = () => {
        setUserID(undefined);
    }

    const handleDeleteAccount = () => {
        console.log("Deleting account");
        const axDelete = async () => {
            try {
                const resp = await axInstance.delete(`users/delete/${userID}`);

                console.log(resp);
                if (resp.status === 204){
                    console.log("User Deleted");
                    handleLogout();
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

    if (errorMsg !== ''){
        return (
            <>
            {errorMsg}
            </>
        )
    }

    return ( 
        <>
            <Navbar />
            <h1>User Profile</h1>
            <ProfileStats />
            <button onClick={handleLogout}>Logout</button>
            <button onClick={handleDeleteAccount}>Delete Account</button>
        </>
    );
}

export default ProfilePage;