import { useState } from "react"
import { Swiper as ExternalSwiper, SwiperSlide } from "swiper/react"
import "./swiper.css"
import "swiper/css"

const Swiper = (props: { slides: React.ReactNode[] }) => {
	const [page, setPage] = useState<number>(0)
	return (
		<
			>
			<ExternalSwiper
				slidesPerView={1}
				threshold={10}
				onActiveIndexChange={(e) => setPage(e.activeIndex)}
				allowSlidePrev={page !== 0}
				allowSlideNext={page !== props.slides.length - 1}
				touchStartPreventDefault={false}
				className="swiper-container"
			>
				{
					props.slides.map((s, i) => (
						<SwiperSlide
							key={`slide-${i}`}
							className="swiper-slide"
						>
							{s}
						</SwiperSlide>
					))
				}
			</ExternalSwiper>
			<Paginator page={page} numPages={props.slides.length} />
		</>
	)
}


const Paginator = (props: { page: number, numPages: number }) => {
	return (
		<div className="paginator-display">
			<div>
				<div
					style={
						props.page === 0
							? { backgroundColor: "var(--color-primary)", scale: 1.1, boxShadow: "0px 0px 4px color-mix(in srgb, var(--color-primary), transparent 70%)" }
							: props.page === 1
								? { backgroundColor: "color-mix(in srgb, var(--color-primary), transparent 50%)", boxShadow: "0px 0px 4px color-mix(in srgb, var(--color-primary), transparent 90%)" }
								: {}
					}
				/>
			</div>
			{
				props.numPages > 2 &&
				<div>
					<div
						style={
							props.page > 1 && props.page < props.numPages - 1
								? { backgroundColor: "var(--color-primary)", scale: 1.1, boxShadow: "0px 0px 4px color-mix(in srgb, var(--color-primary), transparent 70%)" }
								: { backgroundColor: "color-mix(in srgb, var(--color-primary), transparent 50%)", boxShadow: "0px 0px 4px color-mix(in srgb, var(--color-primary), transparent 90%)" }
						}
					/>
				</div>
			}
			<div>
				<div
					style={
						props.page === props.numPages - 1
							? { backgroundColor: "var(--color-primary)", scale: 1.1, boxShadow: "0px 0px 4px color-mix(in srgb, var(--color-primary), transparent 70%)" }
							: props.page === props.numPages - 2
								? { backgroundColor: "color-mix(in srgb, var(--color-primary), transparent 50%)", boxShadow: "0px 0px 4px color-mix(in srgb, var(--color-primary), transparent 90%)" }
								: {}
					}
				/>
			</div>
		</div>
	)
}

export default Swiper
