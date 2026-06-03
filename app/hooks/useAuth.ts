import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'



export const useAuth =() =>{
    
    const auth= getAuth()

    const login = async ({email, password}: {email: string, password: string})=> {
        //sign in with firebase auth
        await signInWithEmailAndPassword(auth, email, password)
    }
    return { login }
}