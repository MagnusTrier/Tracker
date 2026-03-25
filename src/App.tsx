import "./App.css"
import { useState } from 'react';
import { Swiper, SwiperSlide } from "swiper/react"
import { WeightComponent } from "./components/weight/weightComponent";
import { SessionProvider, useSession } from "./components/sessionContext";
import { DataProvider, useData } from "./components/dataContext";
import { Login } from "./components/login/login"
import { LoadingScreen } from "./components/loadingScreen/loadingScreen";
import { motion } from "motion/react"
import { Card } from "./components/generics.tsx"

const AppContent = () => {
	const { user, isLoading: authLoading, login } = useSession()

	if (authLoading) return <LoadingScreen message="Checking session..." />

	if (!user) return <Login onLogin={login} />

	return (
		<DataProvider>
			<DataReadyGatekeeper />
		</DataProvider>
	)
}

const DataReadyGatekeeper = () => {
	const { showSettings } = useSession()
	const { exercises, sets, weightLogs } = useData()

	const [page, setPage] = useState<number>(0)

	const isLoading = exercises.isLoading || sets.isLoading || weightLogs.isLoading

	if (isLoading) return <LoadingScreen message="Syncing your logs..." />

	return (
		<div
			className="app-container"
		>
			<motion.div
				className="app-container-inner"
				animate={showSettings ? { opacity: 0, y: "35%" } : { opacity: 1, y: 0 }}
				transition={{ ease: "easeInOut" }}
			>
				<Swiper
					className="swiper-container"
					slidesPerView={1}
					threshold={10}
					onSlideChange={(e) => setPage(e.activeIndex)}
					allowSlidePrev={page !== 0}
				>
					<SwiperSlide
						key="slide-1"
						className="swiper-slide"
					>
						<WeightComponent />
					</SwiperSlide>
					<SwiperSlide
						key="slide-2"
						className="swiper-slide"
					>
						<Card
							header="Card 1"
							subHeader="This is my very special card"
							settings={<span>This is the settings for Card 1</span>}
						>
							<span>ree</span>
						</Card>
						<Card
							header="Card 2"
							subHeader="This is my very special card"
							settings={<span>This is the settings for Card 2</span>}
						>
							<span>ree</span>
						</Card>
					</SwiperSlide>
				</Swiper>
				<div className="paginator-display">
				</div>
			</motion.div>
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

export default App;
