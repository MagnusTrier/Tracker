import { useEffect, useState, lazy, Suspense, useMemo } from "react"
import { useSession } from "./sessionContext"
import { useData, type Exercise } from "./dataContext"
import { AnimatePresence, motion } from "motion/react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Virtual } from "swiper/modules"

const WeightComponent = lazy(() => import("./weight/weightComponent"))
const LoadingScreen = lazy(() => import("./loading"))
const ExerciseComponent = lazy(() => import("./exercise/exerciseComponent"))

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

	const slides = useMemo(() => {
		return ["weight-component", ...exercises.values]
	}, [exercises.values])

	const sliderStyle = {
		active: {
			backgroundColor: "color-mix(in srgb, var(--color-primary), transparent 0%)",
			width: 40,
			height: 5,
			boxShadow: "0px 0px 10px color-mix(in srgb, var(--color-primary), transparent 50%)"
		},
		isNext: {
			backgroundColor: "color-mix(in srgb, var(--color-primary), transparent 60%)",
			width: 30,
			height: 4,
			boxShadow: "0px 0px 10px color-mix(in srgb, var(--color-primary), transparent 80%)"
		},
		inactive: {
			backgroundColor: "var(--color-border)",
			width: 30,
			height: 4,
			boxShadow: "0px 0px 8px transparent"
		}
	}

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
						animate={!showSettings ? { opacity: 1, y: 0, visibility: "visible" } : { opacity: 0, y: "100vh", visibility: "hidden" }}
						transition={{ ease: "easeInOut", duration: 0.5 }}
						className="app-container-inner"
					>
						<Swiper
							className="swiper-container"
							slidesPerView={1}
							threshold={10}
							onSlideChange={(e) => setPage(e.activeIndex)}
							allowSlidePrev={page !== 0}
							allowSlideNext={page !== slides.length - 1}
							modules={[Virtual]}
							virtual
						>
							{
								slides.map((s, i) => (
									<SwiperSlide
										key={`slide-${i}`}
										virtualIndex={i}
										className="swiper-slide"
									>
										<Suspense fallback={<div>Loading...</div>}>
											{
												typeof s === "string" && s === "weight-component"
													?
													<WeightComponent />
													:
													<ExerciseComponent exercise={s as Exercise} />
											}
										</Suspense>
									</SwiperSlide>
								))
							}
						</Swiper>
						<div className="paginator-display">
							<motion.div animate={page === 0 ? sliderStyle.active : page === 1 ? sliderStyle.isNext : sliderStyle.inactive} />
							<motion.div animate={(page !== 0 && page !== slides.length - 1) ? sliderStyle.active : (page === 0 || page === slides.length - 1) ? sliderStyle.isNext : sliderStyle.inactive} />
							<motion.div animate={page === slides.length - 1 ? sliderStyle.active : page === slides.length - 2 ? sliderStyle.isNext : sliderStyle.inactive} />
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	)
}

export default DataReadyGatekeeper
