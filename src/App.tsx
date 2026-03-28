import "./App.css"
import { SessionProvider } from "./components/sessionContext"
import { DataProvider } from "./components/dataContext"
import SplashScreen from "./components/splashScreen"

function App() {
	return (
		<SessionProvider>
			<DataProvider>
				<SplashScreen />
			</DataProvider>
		</SessionProvider>
	)
}

export default App
