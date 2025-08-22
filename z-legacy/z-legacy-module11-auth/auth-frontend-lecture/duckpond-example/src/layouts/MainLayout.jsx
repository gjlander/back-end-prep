import { Outlet } from 'react-router';
import AuthContextProvider from '../context/AuthContextProvider';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = () => {
    return (
        <AuthContextProvider>
            <div className='bg-slate-600 text-gray-300 flex flex-col min-h-screen'>
                <Navbar />
                <main className='flex-grow flex flex-col justify-between py-4'>
                    <Outlet />
                </main>
                <Footer />
            </div>
        </AuthContextProvider>
    );
};

export default MainLayout;
