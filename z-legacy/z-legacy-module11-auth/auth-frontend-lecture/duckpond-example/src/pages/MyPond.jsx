import { useState } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../context/context';
import DuckPond from '../components/DuckPond';
import DuckForm from '../components/DuckForm';

const MyPond = () => {
    const [myDucks, setMyDucks] = useState(
        JSON.parse(localStorage.getItem('myDucks')) || []
    );
    const { signedIn } = useAuth();

    if (!signedIn) return <Navigate to='/signin' />;
    return (
        <>
            <DuckForm setDucks={setMyDucks} />
            <DuckPond ducks={myDucks} />
        </>
    );
};

export default MyPond;
