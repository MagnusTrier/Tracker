import { useEffect, useState, lazy, useMemo, startTransition } from "react"
import { useSession } from "./sessionContext"
import { useData, type Exercise } from "./dataContext"
import { AnimatePresence, motion } from "motion/react"
import { Swiper, SwiperSlide } from "swiper/react"


const WeightComponent = lazy(() => import("./weight/weightComponent"))
const ExerciseComponent = lazy(() => import("./exercise/exerciseComponent"))

const MountAppContent = () => {
	const { showSettings } = useSession()
	const { exercises } = useData()

	const [page, setPage] = useState<number>(0)
	const [mountPage, setMountPage] = useState<number>(0)


	const slides = useMemo(() => {
		return ["weight-component", ...exercises.values]
	}, [exercises.values])

	return (
		<AnimatePresence >
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
						onSlideChange={(e) => startTransition(() => { setPage(e.activeIndex) })}
						allowSlidePrev={page !== 0}
						allowSlideNext={page !== slides.length - 1}
						onSlideChangeTransitionEnd={(e) => { startTransition(() => { setMountPage(e.activeIndex) }) }}
						touchStartPreventDefault={false}
					>
						{
							slides.map((s, i) => (
								<SwiperSlide
									key={`slide-${i}`}
									className="swiper-slide"
								>
									<DelayedMount isVisible={Math.abs(i - mountPage) <= 1} index={i}>
										{
											typeof s === "string" && s === "weight-component"
												?
												<WeightComponent />
												:
												<ExerciseComponent exercise={s as Exercise} />
										}
									</DelayedMount>
								</SwiperSlide>
							))
						}
					</Swiper>
					<Paginator page={page} numPages={slides.length} />
				</motion.div>
			</div>
		</AnimatePresence >
	)
}

const DelayedMount = (props: { isVisible: boolean, children: React.ReactNode, index?: number }) => {
	const [shouldRender, setShouldRender] = useState(false)

	useEffect(() => {
		let timer: any

		if (props.isVisible) {
			timer = setTimeout(() => setShouldRender(true), 0)
		} else {
			timer = setTimeout(() => setShouldRender(false), 0)
		}

		return () => clearTimeout(timer)
	}, [props.isVisible])

	return shouldRender ? props.children : <div className="skeleton-loader" />
}

const Paginator = (props: { page: number, numPages: number }) => {
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
		<div className="paginator-display">
			<motion.div
				initial={sliderStyle.active}
				animate={
					props.page === 0
						?
						sliderStyle.active
						:
						props.page === 1
							?
							sliderStyle.isNext
							:
							sliderStyle.inactive
				}
			/>
			<motion.div
				initial={sliderStyle.isNext}
				animate={
					(props.page !== 0 && props.page !== props.numPages - 1)
						?
						sliderStyle.active
						:
						(props.page === 0 || props.page === props.numPages - 1)
							?
							sliderStyle.isNext
							: sliderStyle.inactive
				}
			/>
			<motion.div
				initial={sliderStyle.inactive}
				animate={
					props.page === props.numPages - 1
						?
						sliderStyle.active
						:
						props.page === props.numPages - 2
							?
							sliderStyle.isNext
							:
							sliderStyle.inactive
				}
			/>
		</div>
	)

}

export default MountAppContent
