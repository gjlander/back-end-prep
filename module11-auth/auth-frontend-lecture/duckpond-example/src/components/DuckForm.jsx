import { useState } from 'react';

const DuckForm = ({ setDucks }) => {
    const [form, setForm] = useState({
        name: '',
        imgUrl: '',
        quote: '',
    });

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newDuck = { ...form, _id: crypto.randomUUID() };
        setDucks((prev) => {
            const updatedDucks = [...prev, newDuck];
            localStorage.setItem('ducks', JSON.stringify(updatedDucks));
            return updatedDucks;
        });
        setForm({
            name: '',
            imgUrl: '',
            quote: '',
        });
    };
    return (
        <section className='flex flex-col items-center gap-4 border-2 rounded-lg p-4 mx-8'>
            <h2 className='text-4xl'>Add a new duck to my pond!</h2>
            <form
                onSubmit={handleSubmit}
                id='add-form'
                className='flex flex-col gap-4 w-3/4'
            >
                <label className='w-full flex gap-2 items-baseline'>
                    <span className='text-xl'>Name:</span>
                    <input
                        value={form.name}
                        onChange={handleChange}
                        name='name'
                        type='text'
                        placeholder="What is your duck's name?"
                        className='bg-inherit border-solid border-2 border-slate-700 rounded-lg p-2 flex-grow'
                    />
                </label>
                <label className='w-full flex gap-2 items-baseline'>
                    <span className='text-xl'>Image:</span>
                    <input
                        value={form.imgUrl}
                        onChange={handleChange}
                        name='imgUrl'
                        // type='url'
                        placeholder='What does your duck look like?'
                        className='bg-inherit border-solid border-2 border-slate-700 rounded-lg p-2 w-full'
                    />
                </label>
                <label className='w-full flex gap-2 items-baseline'>
                    <span className='text-xl'>Quote:</span>
                    <input
                        value={form.quote}
                        onChange={handleChange}
                        name='quote'
                        type='text'
                        placeholder='What does your duck say?'
                        className='bg-inherit border-solid border-2 border-slate-700 rounded-lg p-2 w-full'
                    />
                </label>
                <button
                    id='submit-btn'
                    type='submit'
                    className='bg-green-600 p-2 rounded-lg font-bold'
                >
                    Add duck
                </button>
            </form>
        </section>
    );
};
export default DuckForm;
