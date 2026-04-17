import "./App.css"
import { SessionProvider } from "./components/sessionContext"
import { DataProvider } from "./components/dataApi/dataContext"
import SplashScreen from "./components/splashScreen"
import { BrowserRouter } from "react-router-dom";

function App() {
	window.addEventListener('touchstart', (e: any) => {
		if (e.pageX < 30) {
			e.preventDefault()
		}
	}, { passive: false });
	return (
		<BrowserRouter>
			<SessionProvider>
				<DataProvider>
					<SplashScreen />
				</DataProvider>
			</SessionProvider>
		</BrowserRouter>
	)
}

export default App
