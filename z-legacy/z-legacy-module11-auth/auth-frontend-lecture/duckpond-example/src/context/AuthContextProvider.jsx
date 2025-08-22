import { useState, useEffect } from 'react';
import { AuthContext } from '../context/context';
import { me } from '../data/auth';
const AuthContextProvider = ({ children }) => {
    const [signedIn, setSignedIn] = useState(false);
    const [user, setUser] = useState();
    const [checkSession, setCheckSession] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            try {
                const data = await me();

                setUser(data);
                setSignedIn(true);
            } catch (error) {
                console.error(error);
            } finally {
                setCheckSession(false);
            }
        };

        if (checkSession) getUser();
    }, [checkSession]);
    return (
        <AuthContext.Provider
            value={{
                signedIn,
                setSignedIn,
                user,
                setUser,
                setCheckSession,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;
