import { useState, useEffect } from "react"
import { IoCalendarClearOutline } from "react-icons/io5"
import { useMotionValue, useSpring, useTransform, useMotionValueEvent, motion } from "framer-motion"
import { useDrag } from "@use-gesture/react"
import { format } from "date-fns"
import { ScaleLoader } from "react-spinners"

const RANGE_MIN = 70
const RANGE_MAX = 100
const TICK_SPACING = 20

const TOTAL_TICKS = (RANGE_MAX - RANGE_MIN) * 10

export const RulerPicker = (props: { displayValue: number, setDisplayValue: (val: number) => void, date: Date | null }) => {

	const INITIAL_OFFSET = (props.displayValue - RANGE_MIN) * 10 * -TICK_SPACING
	const offset = useMotionValue(INITIAL_OFFSET)

	const springOffset = useSpring(offset, {
		stiffness: 150,
		damping: 25,
		mass: 0.8
	})

	const numericValue = useTransform(
		springOffset,
		[0, -TOTAL_TICKS * TICK_SPACING],
		[RANGE_MIN, RANGE_MAX]
	)

	useMotionValueEvent(numericValue, "change", (latest) => {
		props.setDisplayValue(Math.round(latest * 10) / 10)
	})

	const bind = useDrag(({ offset: [x], last, memo }) => {
		const minScroll = -TOTAL_TICKS * TICK_SPACING
		const maxScroll = 0

		if (last) {
			const snappedValue = Math.round(x / TICK_SPACING) * TICK_SPACING
			offset.set(Math.max(minScroll, Math.min(maxScroll, snappedValue)))
		} else {
			offset.set(Math.max(minScroll, Math.min(maxScroll, x)))
		}

		return memo
	}, {
		from: () => [offset.get(), 0],
		rubberband: true,
	})

	return (
		<div className="slider-slide-container">

			{
				props.date &&
				<div className="date">
					<IoCalendarClearOutline fontSize={15} />
					{format(props.date, "MMM d").toUpperCase()}
				</div>
			}
			<div className="value-display">
				{props.displayValue.toFixed(1)}
				<span>KG</span>
			</div>
			<div className="scroller-wrapper">
				<div className="center-indicator" />
				<div {...bind()} className="touch-area swiper-no-swiping">
					<motion.div
						className="ruler-track"
						style={{ x: springOffset }}
					>
						{[...Array(TOTAL_TICKS + 1)].map((_, i) => {
							const val = RANGE_MIN + i / 10
							const isMajor = i % 10 === 0
							return (
								<div key={i} className="tick-item" style={{ width: TICK_SPACING }}>
									<div className={`tick-line ${isMajor ? 'major' : 'minor'}`} />
									{isMajor && (
										<span className="tick-label">{val.toFixed(0)}</span>
									)}
								</div>
							)
						})}
					</motion.div>
				</div>
			</div>
		</div>
	)
}

interface CustomButtonProps {
	text: {
		default: string | React.ReactNode,
		disabled: string | React.ReactNode,
	}
	disabled: boolean
	onClick: (e: React.MouseEvent, setLoading: (val: boolean) => void) => void
	style?: React.CSSProperties
}

export const CustomButton = (props: CustomButtonProps) => {
	const [loading, setLoading] = useState<boolean>(false)

	useEffect(() => {
		if (props.disabled) {
			setLoading(false)
		}
	}, [props.disabled])

	return (
		<div
			className={`custom-button ${props.disabled ? "" : "active"}`}
			style={props.style}
			onClick={(e) => props.onClick(e, setLoading)}
		>
			{
				props.disabled
					?
					<span>
						{props.text.disabled}
					</span>
					:
					loading ?
						<ScaleLoader
							height={18.5}
							radius={2}
							color="#000"
						/> :
						<span>{props.text.default}</span>
			}
		</div>
	)
}

interface SegmentedControlProps {
	options: any[]
	onChange: (val: any) => void
	id: string | number
	containerClass?: string
	tabListClass?: string
	tabItemClass?: string
	activeIndicatorClass?: string
}

export const SegmentedControl = (props: SegmentedControlProps) => {
	const [activeTab, setActiveTab] = useState(props.options[0]);
	return (
		<div
			key={props.id}
			className={props.containerClass ?? "segmented-control-container"}
		>
			<div
				className={props.tabListClass ?? "segmented-control-tab-list"}
			>
				{props.options.map((tab) => (
					<div
						key={tab}
						className={props.tabItemClass ?? `segmented-control-tab-item ${activeTab === tab && "active"}`}
						onClick={() => { setActiveTab(tab) }}
					>
						<span style={{ zIndex: 2, position: "relative" }}>{tab}</span>

						{activeTab === tab && (
							<motion.div
								layoutId={`active-pill-${props.id}`}
								transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
								className="segmented-control-active-indicator"
								onLayoutAnimationComplete={() => {
									props.onChange(tab)
								}}
							/>
						)}
					</div>
				))}
			</div>
		</div>
	);
};
