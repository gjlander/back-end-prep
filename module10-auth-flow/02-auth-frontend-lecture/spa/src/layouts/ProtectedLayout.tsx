import { Outlet, Navigate } from 'react-router';
import { useAuth } from '@/context';

const ProtectedLayout = () => {
	const { signedIn } = useAuth();

	if (signedIn) {
		return <Outlet />;
	} else {
		return <Navigate to='/login' />;
	}
};

export default ProtectedLayout;
