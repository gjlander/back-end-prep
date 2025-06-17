import { BrowserRouter, Routes, Route } from 'react-router';
import './styles.css';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import MyPond from './pages/MyPond';
import DuckPage from './pages/DuckPage';
import SignIn from './pages/SignIn';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<MainLayout />}>
                    <Route index element={<Home />} />
                    <Route path='mypond' element={<MyPond />} />
                    <Route path='signin' element={<SignIn />} />
                    <Route path='register' element={<Register />} />
                    <Route path='ducks/:duckId' element={<DuckPage />} />
                </Route>
                <Route path='*' element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
