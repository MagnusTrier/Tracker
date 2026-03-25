import "./App.css"
import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from "swiper/react"
import { WeightComponent } from "./components/weight/weightComponent"
import { SessionProvider, useSession } from "./components/sessionContext"
import { DataProvider, useData } from "./components/dataContext"
import { motion, AnimatePresence } from "motion/react"
import { Card } from "./components/generics.tsx"
import { PropagateLoader } from "react-spinners"

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

const DataReadyGatekeeper = () => {
	const { showSettings } = useSession()
	const { exercises, sets, weightLogs } = useData()
	const [gracePeriodFinished, setGracePeriodFinished] = useState(false)

	const [page, setPage] = useState<number>(0)

	useEffect(() => {
		const timer = setTimeout(() => setGracePeriodFinished(true), 1000)
		return () => clearTimeout(timer)
	}, [])

	const isDataLoading = exercises.isLoading || sets.isLoading || weightLogs.isLoading
	const showLoader = isDataLoading || !gracePeriodFinished

	return (
		<AnimatePresence >
			{showLoader ? (
				<motion.div
					key="loader"
					initial={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ ease: "easeInOut" }}
				>
					<LoadingScreen message="Syncing your logs..." />
				</motion.div>
			) : (
				<div
					className="app-container"
				>
					<motion.div
						key="app-content"
						initial={{ opacity: 0, scale: 0.98, y: 10 }}
						animate={showSettings ? { opacity: 0, y: "50%" } : { opacity: 1, y: 0 }}
						transition={{ ease: "easeInOut" }}
						className="app-container-inner"
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
			)}
		</AnimatePresence>
	)
}

const LoadingScreen = (props: { message: string }) => {
	return (
		<div
			className="loading-screen"
		>
			<PropagateLoader
				size={20}
				color="var(--color-primary)"
				className="loading-screen-spinner"
			/>
			<span>{props.message}</span>
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
