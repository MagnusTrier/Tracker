import { useState, useEffect, useMemo, useRef, useLayoutEffect, useCallback, memo } from "react"
import { useMotionValue, useSpring, useTransform, useMotionValueEvent, motion, AnimatePresence, LayoutGroup } from "motion/react"
import { useDrag } from "@use-gesture/react"
import { ScaleLoader } from "react-spinners"
import { ArrowBigRight, X } from "lucide-react"

export const Slider = (props: { onConfirm: () => void, active: boolean }) => {
	const [trackWidth, setTrackWidth] = useState<number>(0)
	const trackRef = useRef<HTMLDivElement>(null)

	const x = useMotionValue(0)
	const springX = useSpring(x, { stiffness: 400, damping: 40 })

	useLayoutEffect(() => {
		if (!trackRef.current) return
		const observer = new ResizeObserver((entries) => {
			setTrackWidth(entries[0].contentRect.width)
		})
		observer.observe(trackRef.current)
		return () => observer.disconnect()
	}, [])

	const HANDLE_SIZE = 50
	const PADDING = 8
	const maxDrag = trackWidth - HANDLE_SIZE - PADDING * 2

	const textOpacity = useTransform(x, [0, maxDrag * 0.7], [1, 0])
	const background = useTransform(
		x,
		[0, maxDrag],
		[
			"radial-gradient(circle at 0% 0%, #0c0e12 0%, #0c0e12 30%, #0c0e12 100%)",
			"radial-gradient(circle at 0% 0%, #acacff 0%, rgb(143,150,255) 30%, #7070ff 100%)"
		]
	) as any;

	const bind = useDrag(({ offset: [ox], last }) => {
		const currentX = Math.max(0, Math.min(ox, maxDrag))

		if (last) {
			if (currentX > maxDrag * 0.85) {
				x.set(maxDrag)
			} else {
				x.set(0)
			}
		} else {
			x.set(currentX)
		}
	}, {
		from: () => [x.get(), 0],
		bounds: { left: 0, right: maxDrag }
	}) as any


	useMotionValueEvent(springX, "change", (latest) => {
		if (latest >= maxDrag * 0.99) {
			props.onConfirm()
		}
	})

	return (
		<div
			ref={trackRef}
			className="slider-container"
			style={{ pointerEvents: !props.active ? "none" : "all" }}
		>
			<motion.div
				className="slider-track"
				style={{ background }}
			>
				<motion.div
					style={{ opacity: textOpacity }}
					className="slider-text"
				>
					SLIDE TO START
				</motion.div>
				<motion.div
					{...bind()}
					style={{
						x: springX,
						width: HANDLE_SIZE,
						height: HANDLE_SIZE,
						borderColor: props.active ? "var(--action-primary)" : "",
						color: props.active ? "var(--text-primary)" : "var(--text-muted)"
					}}
					className="slider-handle"
				>
					<ArrowBigRight strokeWidth="1.5" />
				</motion.div>
			</motion.div>
		</div>

	)

}

type ButtonText = string | React.ReactNode

interface BaseButtonProps {
	onClick: (e: React.MouseEvent, setLoading: (val: boolean) => void) => void
	style?: React.CSSProperties
	theme?: "default" | "error" | "neutral"
}

interface DisabledButtonProps extends BaseButtonProps {
	disabled: true
	text: {
		default: ButtonText
		disabled?: ButtonText
	}
}

interface EnabledButtonProps extends BaseButtonProps {
	disabled?: false
	text: {
		default: ButtonText
		disabled?: ButtonText
	}
}

type CustomButtonProps = EnabledButtonProps | DisabledButtonProps

export const CustomButton = (props: CustomButtonProps) => {
	const [loading, setLoading] = useState<boolean>(false)
	const { disabled, text, onClick, style, theme = "default" } = props

	useEffect(() => {
		if (disabled) setLoading(false)
	}, [disabled])

	return (
		<div
			className={` button  ${disabled ? "disabled" : "clickable"} ${theme}`}
			style={style}
			onClick={(e) => !disabled && onClick(e, setLoading)}
		>
			{disabled
				? (text.disabled || text.default)
				: loading
					? <ScaleLoader height={18.5} radius={2} color="#000" />
					: text.default
			}
		</div>
	)
}


const TabItem = memo(({
	tab,
	isActive,
	onClick,
	id,
	className,
	indicatorClass
}: {
	tab: string;
	isActive: boolean;
	onClick: () => void;
	id: string | number;
	className: string;
	indicatorClass: string;
}) => (
	<div
		role="tab"
		aria-selected={isActive}
		className={`${className} ${isActive ? "active" : ""}`}
		onClick={onClick}
		style={{ position: 'relative', cursor: 'pointer' }}
	>
		{/* We keep the text on a higher z-index than the pill */}
		<span style={{ position: 'relative', zIndex: 2 }}>{tab}</span>

		{isActive && (
			<motion.div
				layoutId={`active-pill-${id}`}
				className={indicatorClass}
				transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
				style={{
					position: 'absolute',
					inset: 0,
					zIndex: 1,
					willChange: 'transform' // Force GPU acceleration for the spring
				}}
			/>
		)}
	</div>
));

TabItem.displayName = "TabItem";

interface SegmentedControlProps {
	options: string[]
	value: string
	onChange: (val: string) => void
	id: string | number
	tabListClass?: string
	tabItemClass?: string
	activeIndicatorClass?: string
}

export const SegmentedControl = ({
	options,
	value,
	onChange,
	id,
	tabListClass = "segmented-control-tab-list",
	tabItemClass = "segmented-control-tab-item",
	activeIndicatorClass = "segmented-control-active-indicator action-button-primary"
}: SegmentedControlProps) => {

	const handleTabClick = useCallback((tab: string) => {
		if (tab !== value) onChange(tab);
	}, [onChange, value]);

	return (
		<LayoutGroup id={`group-${id}`}>
			<div className={tabListClass} role="tablist" style={{ display: 'flex' }}>
				{options.map((tab) => (
					<TabItem
						key={tab}
						id={id}
						tab={tab}
						isActive={value === tab}
						onClick={() => handleTabClick(tab)}
						className={tabItemClass}
						indicatorClass={activeIndicatorClass}
					/>
				))}
			</div>
		</LayoutGroup>
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
	mode?: "text" | "dob" | "height"
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
				const h = digits.slice(0, -1)
				return h ? `${h} CM` : ""
			}

			const h = digits.slice(0, 3)
			return h ? `${h} CM` : ""
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
				backgroundColor: "var(--surface-main)",
				color: "var(--text-muted)"
			}}
		>
			<X size="20" />
		</div>
	)
}
