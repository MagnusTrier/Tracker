import { useState, useEffect, useMemo } from "react"
import { IoCalendarClearOutline } from "react-icons/io5"
import { useMotionValue, useSpring, useTransform, useMotionValueEvent, motion, AnimatePresence } from "framer-motion"
import { useDrag } from "@use-gesture/react"
import { format } from "date-fns"
import { ScaleLoader } from "react-spinners"
import { X } from "lucide-react"

const RANGE_MIN = 70
const RANGE_MAX = 100
const TICK_SPACING = 20

const TOTAL_TICKS = (RANGE_MAX - RANGE_MIN) * 10

export const RulerPicker = (props: { displayValue: number, setDisplayValue: (val: number) => void, date: Date | null, onDateClick: () => void }) => {

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
				<div className="date action-button-primary" onClick={props.onDateClick}>
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
	disabled?: boolean
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
			className={`custom-button ${props.disabled ? "" : "active clickable"}`}
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
						onClick={() => { setActiveTab(tab); props.onChange(tab) }}
					>
						<span style={{ zIndex: 2, position: "relative" }}>{tab}</span>

						{activeTab === tab && (
							<motion.div
								layoutId={`active-pill-${props.id}`}
								transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
								className="segmented-control-active-indicator action-button-primary"
							/>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export const PageContainer = (props: { children: React.ReactNode, style?: React.CSSProperties }) => {
	return (
		<motion.div
			className="page"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			style={props.style}
		>
			{props.children}
		</motion.div>
	)
}

interface FastInputProps {
	initialValue: string
	onChange: (val: string) => void
	placeholder?: string
	className?: string
	style?: React.CSSProperties
	mode?: "text" | "dob" | "height" // New prop
	onBlur?: () => void
}

export const FastInput = ({ initialValue, onChange, className, placeholder, style, mode = "text", onBlur }: FastInputProps) => {
	const [value, setValue] = useState(initialValue)

	const formatValue = (val: string, isDeleting: boolean): string => {
		const digits = val.replace(/\D/g, "")

		if (mode === "dob") {
			const d = digits.slice(0, 8)

			// 1. Validate Day (01-31)
			let day = d.slice(0, 2)
			if (day.length === 2 && parseInt(day) > 31) day = "31"
			if (day.length === 2 && parseInt(day) === 0) day = "01"

			// 2. Validate Month (01-12)
			let month = d.slice(2, 4)
			if (month.length === 2 && parseInt(month) > 12) month = "12"
			if (month.length === 2 && parseInt(month) === 0) month = "01"

			let year = d.slice(4, 8)
			if (year.length === 4 && parseInt(year) > 2020) year = "2020"

			// Formatting logic that respects backspacing
			if (d.length <= 2) return day
			if (d.length <= 4) return `${day} / ${month}`
			return `${day} / ${month} / ${year}`
		}

		if (mode === "height") {
			if (isDeleting) {
				const h = digits.slice(0, -1);
				return h ? `${h} CM` : "";
			}

			const h = digits.slice(0, 3);
			return h ? `${h} CM` : "";
		}

		return val.toUpperCase()
	}

	const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const input = e.target
		const rawValue = input.value

		const isDeleting = (e.nativeEvent as any).inputType === "deleteContentBackward"

		const nextValue = formatValue(rawValue, isDeleting)

		setValue(nextValue)
		onChange(nextValue)
	}

	return (
		<input
			type={mode === "text" ? "text" : "tel"}
			className={className}
			value={value}
			onChange={handleTextChange}
			autoCapitalize={mode === "text" ? "characters" : "off"}
			placeholder={placeholder}
			style={{ ...style }}
			onFocus={(e) => e.target.select()}
			onBlur={onBlur}
		/>
	)
}


interface AnimatedListProps<T> {
	items: T[]
	renderItem: (item: T) => React.ReactNode
	itemHeight?: number
	emptyMessage?: string
	wrapperClass?: string
}

export const AnimatedList = <T extends { id: string | number }>({
	items,
	renderItem,
	itemHeight = 70,
	emptyMessage = "NO ITEMS FOUND",
	wrapperClass
}: AnimatedListProps<T>) => {

	const listHeight = useMemo(() => {
		const count = items.length > 0 ? items.length : 1
		return itemHeight * count
	}, [items.length, itemHeight])

	return (
		<div className={wrapperClass || "animated-list-wrapper"}>
			<motion.div
				animate={{ height: listHeight }}
				style={{ width: "100%" }}
				transition={{ duration: 0.3 }}
			>
				<AnimatePresence mode="popLayout" initial={false}>
					{items.length > 0 ? (
						items.map((item) => (
							<motion.div
								key={item.id}
								layout="position"
								transition={{ duration: 0.2 }}
								className="animated-list-item"
								style={{ "--item-height": `${itemHeight}px` } as React.CSSProperties}
							>
								{renderItem(item)}
							</motion.div>
						))
					) : (
						<motion.div
							key="empty-state"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="no-items"
							style={{ "--item-height": `${itemHeight}px` } as React.CSSProperties}
						>
							{emptyMessage}
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>
		</div>
	)
}


export const CloseModalButton = (props: { onClick: () => void }) => {
	return (
		<div
			onClick={props.onClick}
			className="clickable"
			style={{
				height: 35,
				aspectRatio: 1,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				borderRadius: 10,
				position: "absolute",
				right: 12,
				top: 12,
				backgroundColor: "var(--color-bg)",
				color: "var(--text-dim)"
			}}
		>
			<X size="20" />
		</div>
	)
}
