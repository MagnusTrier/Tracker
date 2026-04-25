import "./App.css"
import { useEffect } from "react"
import { SessionProvider } from "./components/sessionContext"
import { DataProvider } from "./components/dataApi/dataContext"
import SplashScreen from "./components/splashScreen"
import { BrowserRouter } from "react-router-dom";

function App() {
	useEffect(() => {
		const handler = (e: TouchEvent) => {
			if (e.touches[0].pageX < 30) e.preventDefault();
		};
		window.addEventListener('touchstart', handler, { passive: false });
		return () => window.removeEventListener('touchstart', handler);
	}, []);
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
