import { useState, useEffect } from 'react';

import Header from '../components/Header';
import DuckPond from '../components/DuckPond';

import { getDucks } from '../data/ducks';
const Home = () => {
    const [ducks, setDucks] = useState([]);

    useEffect(() => {
        let ignore = false;
        (async () => {
            try {
                const allDucks = await getDucks();
                if (!ignore) {
                    setDucks(allDucks);
                }
            } catch (error) {
                console.error(error);
            }
        })();

        return () => {
            ignore = true;
        };
    }, []);

    return (
        <>
            <Header />
            <DuckPond ducks={ducks} />
        </>
    );
};

export default Home;
