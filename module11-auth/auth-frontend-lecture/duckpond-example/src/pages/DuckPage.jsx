import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { getDuckById } from '../data/ducks';
const DuckPage = () => {
    const [currDuck, setCurrDuck] = useState({});
    const { duckId } = useParams();
    const navigate = useNavigate();
    console.log(duckId);
    const { name, imgUrl, quote } = currDuck;

    const handleGoBack = () => {
        navigate(-1);
    };

    useEffect(() => {
        let ignore = false;
        (async () => {
            try {
                const duckData = await getDuckById(duckId);
                if (!ignore) {
                    setCurrDuck(duckData);
                }
            } catch (error) {
                console.error(error);
            }
        })();

        return () => {
            ignore = true;
        };
    }, [duckId]);
    return (
        <div className='hero bg-base-100 min-h-screen'>
            <div className='hero-content flex-col lg:flex-row'>
                <img src={imgUrl} className='max-w-sm rounded-lg shadow-2xl' />
                <div>
                    <h1 className='text-5xl font-bold'>{name}</h1>
                    <p className='py-6'>{quote}</p>
                    <div className='flex gap-4'>
                        <button
                            onClick={handleGoBack}
                            className='btn btn-primary'
                        >
                            Go back
                        </button>
                        <Link to={`/ducks/${duckId}/edit`}>
                            <button className='btn btn-success'>
                                Edit Duck
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DuckPage;
