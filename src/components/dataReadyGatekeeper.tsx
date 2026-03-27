import { useEffect, useState, lazy, Suspense } from "react"
import { useSession } from "./sessionContext"
import { useData } from "./dataContext"
import { AnimatePresence, motion } from "motion/react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Card } from "./generics"

const WeightComponent = lazy(() => import("./weight/weightComponent"))
const LoadingScreen = lazy(() => import("./loading"))

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
					<Suspense fallback={<div>Loading...</div>}>
						<LoadingScreen message="Syncing your logs..." />
					</Suspense>
				</motion.div>
			) : (
				<div
					className="app-container"
				>
					<motion.div
						key="app-content"
						initial={{ opacity: 0, y: 10 }}
						animate={!showSettings ? { opacity: 1, y: 0, visibility: "visible" } : { opacity: 0, y: "100%", visibility: "hidden" }}
						transition={{ ease: "easeInOut", duration: 0.5 }}
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
								<Suspense fallback={<div>Loading Chart...</div>}>
									<WeightComponent />
								</Suspense>
							</SwiperSlide>
							<SwiperSlide
								key="slide-2"
								className="swiper-slide"
							>
								<Card
									key="card 1"
									header="Card 1"
									subHeader="This is my very special card"
									settings={<span>This is the settings for Card 1</span>}
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

export default DataReadyGatekeeper
