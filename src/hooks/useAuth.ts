import { useAuth as useAuthContext } from '../contexts/AuthContext';

export const useAuth = useAuthContext;

export type { User, AuthState, AuthContextType } from '../contexts/AuthContext';