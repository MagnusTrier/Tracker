import "./App.css"
import { lazy, Suspense } from 'react'
import { SessionProvider, useSession } from "./components/sessionContext"
import { DataProvider } from "./components/dataContext"

const Card = lazy(() =>
	import("./components/generics").then(module => ({ default: module.Card }))
)

const DataReadyGatekeeper = lazy(() => import("./components/dataReadyGatekeeper"))
const LoadingScreen = lazy(() => import("./components/loading"))


const AppContent = () => {
	const { user, isLoading: authLoading, login } = useSession()

	if (authLoading) return (
		<Suspense fallback={<div>Loading...</div>}>
			<LoadingScreen message="Checking session..." />
		</Suspense>
	)


	if (!user) return <Login onLogin={login} />

	return (
		<DataProvider>
			<Suspense fallback={<div>Loading DataReadyGatekeeper...</div>}>
				<DataReadyGatekeeper />
			</Suspense>
		</DataProvider >
	)
}

const Login = (props: { onLogin: () => void }) => {
	return (
		<div
			className="login"
		>
			<Suspense fallback={<div>Loading card...</div>}>
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
			</Suspense>
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
