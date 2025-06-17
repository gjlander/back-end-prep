import { useAuth } from '../context/context';
import { Link, NavLink, useNavigate } from 'react-router';
const Navbar = (/*{ signedIn, setSignedIn, user, setUser }*/) => {
    const { signedIn, setSignedIn, user, setUser } = useAuth();
    const navigate = useNavigate();
    const handleSignOut = () => {
        localStorage.removeItem('token');
        setSignedIn(false);
        setUser(null);
        setTimeout(() => {
            navigate('/');
        }, 1000);
    };
    return (
        <div className='navbar bg-slate-800 '>
            <div className='navbar-start'>
                <Link className='font-bold' to='/'>
                    The Duck Pond
                </Link>
            </div>

            <div className='navbar-end'>
                {user && <p className='mr-2'>Welcome back, {user.firstName}</p>}
                <ul className='menu menu-horizontal items-baseline gap-2'>
                    <li>
                        <NavLink to='/'>Home</NavLink>
                    </li>

                    {signedIn ? (
                        <>
                            <li>
                                <NavLink to='/mypond'>My Pond</NavLink>
                            </li>
                            <li>
                                <button
                                    className='btn btn-primary'
                                    onClick={handleSignOut}
                                >
                                    Sign Out
                                </button>
                            </li>
                        </>
                    ) : (
                        <li>
                            <Link to='/signin'>
                                <button
                                    className='btn btn-primary'
                                    // onClick={handleSignIn}
                                >
                                    Sign In
                                </button>
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Navbar;
