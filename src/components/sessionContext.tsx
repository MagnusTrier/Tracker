import { createContext, useContext, useEffect, useState } from "react";
import { type Session, type User } from "@supabase/supabase-js"
import { supabase } from "../lib/supabase";

interface SessionContextType {
	user: User | null;
	session: Session | null;
	isLoading: boolean;
	login: () => Promise<void>;
	signOut: () => Promise<void>;
	error: string | null;
	clearError: () => void;
	showSettings: boolean;
	setShowSettings: (val: boolean) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null)
	const [session, setSession] = useState<Session | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)
	const [showSettings, setShowSettings] = useState<boolean>(false)

	useEffect(() => {

		const getInitialSession = async () => {
			const { data: { session } } = await supabase.auth.getSession()
			setSession(session)
			setUser(session?.user ?? null)
			setIsLoading(false)
		}

		getInitialSession()

		const hash = window.location.hash
		const params = new URLSearchParams(hash.replace("#", "?"))
		const errorDesc = params.get("error_description")

		if (errorDesc) {
			setError(errorDesc)
			window.history.replaceState(null, "", window.location.pathname)
		}

		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session)
			setUser(session?.user ?? null)
			setIsLoading(false)
		})

		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session)
			setUser(session?.user ?? null)
			setIsLoading(false)

			if (_event === "SIGNED_OUT") {
				setUser(null)
				setSession(null)
			}
		})

		return () => subscription.unsubscribe()
	}, [])

	const login = async () => {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: window.location.origin,
				queryParams: {
					prompt: "select_account",
					access_type: "offline",
				}
			}
		})

		if (error) {
			setError(error.message)
		}
	}

	const signOut = async () => {
		await supabase.auth.signOut()
	}

	const clearError = () => setError(null)

	const value = {
		user,
		session,
		isLoading,
		login,
		signOut,
		error,
		clearError,
		showSettings,
		setShowSettings
	}

	return (
		<SessionContext.Provider value={value}>
			{children}
		</SessionContext.Provider>
	)
}

export const useSession = () => {
	const context = useContext(SessionContext)
	if (context === undefined) {
		throw new Error("useSession must be used within SessionProvider")
	}
	return context
}

export const useUser = () => {
	const { user } = useSession()
	if (!user) {
		throw new Error("useUser must be used within a logged-in boundary")
	}
	return user
}
