const BASE_URL = 'https://duckpond-89zn.onrender.com/ducks';

const getDucks = async () => {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error(`${res.status}. Something went wrong!`);

    const data = await res.json();
    // console.log(data);

    return data;
};

const getDuckById = async (id) => {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) throw new Error(`${res.status}. Something went wrong!`);

    const data = await res.json();

    return data;
};

export { getDucks, getDuckById };
