import { useOutsideClick } from "../lib/outsideClick"
import { useState, useEffect } from "react"
import { useSession } from "./sessionContext"
import { createPortal } from "react-dom"
import { HiOutlineDotsHorizontal } from "react-icons/hi"
import { IoCalendarClearOutline } from "react-icons/io5"
import { useMotionValue, useSpring, useTransform, useMotionValueEvent, motion } from "framer-motion"
import { useDrag } from "@use-gesture/react"
import { format } from "date-fns"

interface CardProps {
	header?: string | React.ReactNode
	subHeader?: React.ReactNode
	children: React.ReactNode
	settings?: React.ReactNode
	contentStyle?: React.CSSProperties
	settingsStyle?: React.CSSProperties
	hideSettings?: boolean
	ref?: React.RefObject<HTMLDivElement | null>
	id?: string
	onSettingsClick?: () => void
}

export const Card = (props: CardProps) => {
	const { showSettings, setShowSettings } = useSession()

	const [visible, setVisible] = useState<boolean>(false)
	const isSettingsCard = props.settings === undefined


	useEffect(() => {
		!showSettings && setVisible(false)
	}, [showSettings])

	const toggleSettings = (e?: React.MouseEvent) => {
		e?.stopPropagation()
		e?.preventDefault()
		setVisible(!isSettingsCard)
		setShowSettings(!isSettingsCard)
	}

	const ref = useOutsideClick<HTMLDivElement>(() => setShowSettings(false))

	return (
		<>
			<div
				id={props.id}
				ref={props.ref}
				className="blur card"
			>
				<div
					className="header-row"
				>
					{

						props.header &&
						<h1>
							<HeaderIcon />
							{props.header}

							{
								!props.hideSettings &&

								<div
									className="settings-icon"
									style={isSettingsCard ? {
										color: "var(--color-text)",
										borderColor: "var(--color-primary)",
										boxShadow: "0 0 14px color-mix(in srgb, var(--color-primary), transparent 70%)"
									} : {}}
									onClick={props.onSettingsClick ?? toggleSettings}
								>
									<HiOutlineDotsHorizontal />
								</div>
							}
						</h1>

					}
				</div>
				{
					props.subHeader &&
					<h2>
						{props.subHeader}
					</h2>
				}
				<div
					className="card-content"
					style={props.contentStyle}
				>
					{props.children}
				</div>
			</div>
			{
				!isSettingsCard &&
				createPortal(
					<motion.div
						key="settings-tray"
						className="settings-container"
						initial={{ opacity: 0, visibility: "hidden" }}
						animate={visible ? { opacity: 1, y: 0, visibility: "visible", } : { opacity: 0, y: "-100%", visibility: "hidden" }}
						transition={{ ease: "easeInOut", duration: 0.5 }}
					>
						<Card
							id="datepicker-portal"
							ref={ref}
							header="SETTINGS"
							subHeader={
								<span>
									SETTINGS FOR <span style={{ color: "var(--color-primary)" }}>
										{props.header}
									</span>

								</span>
							}
							contentStyle={props.settingsStyle}
						>
							{props.settings}
						</Card>
					</motion.div>,
					document.body
				)
			}
		</>
	)
}

interface HeaderIconProps {
	style?: React.CSSProperties
}

export const HeaderIcon = ({ style }: HeaderIconProps) => {
	return (
		<svg width="24" height="24" viewBox="0 0 48 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
			<g filter="url(#filter0_d_1_14)">
				<circle cx="15" cy="15" r="5" fill="var(--color-primary)" />
			</g>
			<g filter="url(#filter1_d_1_14)">
				<circle cx="24" cy="29" r="5" fill="var(--color-primary)" />
			</g>
			<g filter="url(#filter2_d_1_14)">
				<circle cx="33" cy="15" r="5" fill="var(--color-primary)" />
			</g>
			<defs>
				<filter id="filter0_d_1_14" x="0" y="0" width="30" height="30" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
					<feOffset />
					<feGaussianBlur stdDeviation="5" />
					<feComposite in2="hardAlpha" operator="out" />
					<feColorMatrix type="matrix" values="0 0 0 0 0.54902 0 0 0 0 0.54902 0 0 0 0 1 0 0 0 0.5 0" />
					<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_14" />
					<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_14" result="shape" />
				</filter>
				<filter id="filter1_d_1_14" x="9" y="14" width="30" height="30" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
					<feOffset />
					<feGaussianBlur stdDeviation="5" />
					<feComposite in2="hardAlpha" operator="out" />
					<feColorMatrix type="matrix" values="0 0 0 0 0.54902 0 0 0 0 0.54902 0 0 0 0 1 0 0 0 0.5 0" />
					<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_14" />
					<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_14" result="shape" />
				</filter>
				<filter id="filter2_d_1_14" x="18" y="0" width="30" height="30" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
					<feOffset />
					<feGaussianBlur stdDeviation="5" />
					<feComposite in2="hardAlpha" operator="out" />
					<feColorMatrix type="matrix" values="0 0 0 0 0.54902 0 0 0 0 0.54902 0 0 0 0 1 0 0 0 0.5 0" />
					<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_14" />
					<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_14" result="shape" />
				</filter>
			</defs>
		</svg>
	)
}

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
		default: string,
		disabled: string,
	}
	disabled: boolean
	onClick: (e: React.MouseEvent) => void
	style?: React.CSSProperties
}

export const CustomButton = (props: CustomButtonProps) => {
	return (
		<div
			className={`custom-button ${props.disabled ? "" : "active"}`}
			style={props.style}
			onClick={props.onClick}
		>
			<span>{props.disabled ? props.text.disabled : props.text.default}</span>
		</div>
	)
}
