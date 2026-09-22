import { signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

export function useAuth() {
  const login = () => signInWithPopup(auth, googleProvider)
  const logout = () => signOut(auth)
  return { login, logout }
}
