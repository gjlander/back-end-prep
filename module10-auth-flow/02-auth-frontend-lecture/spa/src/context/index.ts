import { createContext, use } from 'react';
import AuthProvider from './AuthProvider';

const AuthContext = createContext<AuthContextType | null>(null);

const useAuth = (): AuthContextType => {
	const context = use(AuthContext);
	if (!context) throw new Error('useAuth must be used within an AuthProvider');
	return context;
};

export { AuthContext, useAuth, AuthProvider };
