'use client'
import { destroyCookie, parseCookies, setCookie } from "nookies";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api } from "@/services/apiClient";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation'


type AuthContextData = {
    user: UserProps
    isAuthenticated: boolean
    singIn: (data: SingInProps) => Promise<void>
    signOut: () => void
    signUp: (data: SignUpProps) => Promise<void>
}

type UserProps = {
    id: string
    name: string
    email: string
}

type SingInProps = {
    email: string
    password: string
}

type AuthProviderProps = {
    children: ReactNode
}

type SignUpProps = {
    name: string
    email: string
    password: string
}

const AuthContext = createContext({} as AuthContextData);
export const useAuthContext = () => useContext(AuthContext)


export const AuthProvider = ({ children }: AuthProviderProps) => {
    const router = useRouter()

    async function signOut() {
        try {
            destroyCookie(undefined, '@nextauth.token')
            router.push('/')
        } catch {
            console.log('Erro ao deslogar')
        }
    }

    const [user, setUser] = useState<UserProps>({
        id: '',
        name: '',
        email: ''
    })
    const isAuthenticated = !!user

    async function singIn({ email, password }: SingInProps) {

        try {
            const res = await api.post('/login', {
                email, password
            })
            const { id, name, token } = res.data
            setCookie(undefined, '@nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30, // Expira em 1 mes
                path: '/' //Quais caminhos terao acesso ao cookie (todos)
            })

            setUser({ email, id, name })

            //pasar o token para proximas requisiçoes

            api.defaults.headers['Authorizarin'] = `Bearer ${token}`

            //redirect para dashboard
            router.push('/dashboard')
        } catch (error: any) {
            console.log("🚀 ~ file: AuthContext.tsx:60 ~ singIn ~ error:", error.message)
        }
    }

    async function signUp({ email, name, password }: SignUpProps) {
        try {
            await api.post('/user', {
                name, email, password
            })
            router.push('/')
        } catch (error) {
            toast({ description: 'Erro ao cadastrar' })
        }
    }

    const userData = async () => {
        try {
            const { '@nextauth.token': token } = parseCookies()

            if (token) {
                const res = await api.get('/me')
                const { id, name, email } = res.data
                setUser({ id, name, email })
            }

        } catch (error) {
            console.log("🚀 ~ file: AuthContext.tsx:100 ~ userDat ~ error:", error)
            signOut()
        }
    }

    useEffect(() => {
        userData()
    }, [])

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, singIn, signOut, signUp }}>
            {children}
        </AuthContext.Provider>
    )
}
