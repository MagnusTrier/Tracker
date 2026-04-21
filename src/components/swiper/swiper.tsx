import { useState } from "react"
import { Swiper as ExternalSwiper, SwiperSlide } from "swiper/react"
import "./swiper.css"
import "swiper/css"

const Swiper = (props: { slides: React.ReactNode[], circuit?: boolean }) => {
	const [page, setPage] = useState<number>(0)

	return (
		<>
			<ExternalSwiper
				slidesPerView={1}
				threshold={10}
				onActiveIndexChange={(e) => setPage(e.realIndex)}
				allowSlidePrev={props.circuit ? true : page !== 0}
				allowSlideNext={props.circuit ? true : page !== props.slides.length - 1}
				touchStartPreventDefault={false}
				className="swiper-container"
				loop={props.circuit}
			>
				{props.slides.map((s, i) => (
					<SwiperSlide key={`slide-${i}`} className="swiper-slide">
						{s}
					</SwiperSlide>
				))}
			</ExternalSwiper>
			<Paginator page={page} numPages={props.slides.length} circuit={props.circuit} />
		</>
	)
}

const Paginator = (props: { page: number, numPages: number, circuit?: boolean }) => {
	const isNeighbor = (i: number) => {
		const num = Math.abs(props.page - i)
		return num === 1 || (props.circuit && (props.numPages % num) === 1)
	}
	return (
		<div className="paginator-display">
			{
				Array.from({ length: props.numPages }, (_, i) =>
					<div key={`item-${i}`} >
						<div
							style={
								props.page === i
									? { backgroundColor: "var(--color-primary)", scale: 1.1, boxShadow: "0px 0px 4px color-mix(in srgb, var(--color-primary), transparent 70%)" }
									: isNeighbor(i)
										? { backgroundColor: "color-mix(in srgb, var(--color-primary), transparent 50%)", boxShadow: "0px 0px 4px color-mix(in srgb, var(--color-primary), transparent 90%)" }
										: {}
							}
						/>
					</div>
				)
			}
		</div>
	)
}

export default Swiper
