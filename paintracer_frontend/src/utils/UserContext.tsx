import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
    userID: number | undefined;
    setUserID: React.Dispatch<React.SetStateAction<number | undefined>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);
export const UserContextProvider: React.FC<{ children: ReactNode}> = ({ children }) => {
    const [userID, setUserID] = useState<number | undefined>(() => {
        const storedUserID = localStorage.getItem('userID');
        return storedUserID ? Number(storedUserID) : undefined; // Convert to number or return undefined
    });

    useEffect(() => {
        if (userID !== undefined) {
            localStorage.setItem('userID', userID.toString());
        } else {
            localStorage.removeItem('userID'); // Clear if userID is undefined
        }
    }, [userID]);

    return (
        <UserContext.Provider value={{ userID, setUserID }}>
        { children }
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (context === undefined){
        throw new Error("Cannot access context from outside provider")
    }
    return context;
};