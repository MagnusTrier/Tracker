import "./App.css"
import { lazy, Suspense } from 'react'
import { SessionProvider, useSession } from "./components/sessionContext"
import LoadingScreen from "./components/loading"
import { DataProvider } from "./components/dataContext"
import Card from "./components/card"

const DataReadyGatekeeper = lazy(() => import("./components/dataReadyGatekeeper"))


const AppContent = () => {
	const { user, isLoading: authLoading, login } = useSession()

	if (authLoading) return (
		<LoadingScreen message="Checking session..." />
	)

	if (!user) return <Login onLogin={login} />

	return (
		<DataProvider>
			<Suspense fallback={<LoadingScreen message="Connecting to database..." />}>
				<DataReadyGatekeeper />
			</Suspense>
		</DataProvider>
	)
}

const Login = (props: { onLogin: () => void }) => {
	return (
		<div
			className="login"
		>
			<Card
				header="Welcome to Tracker"
				subHeader="Since you're new here you need to log in"
				contentStyle={{ alignItems: "center" }}
				hideSettings
			>
				<button
					className="active"
					onClick={props.onLogin}
				>
					<span>LOG IN</span>
				</button>
			</Card>
		</div>
	)
}

function App() {
	return (
		<SessionProvider>
			<AppContent />
		</SessionProvider>
	)
}

export default App
