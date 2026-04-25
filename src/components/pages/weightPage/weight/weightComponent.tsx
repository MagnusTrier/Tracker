import { useData } from "../../../dataApi/dataContext"
import { type WeightLog } from "../../../dataApi/managers/WeightManager.ts"
import "./weightComponent.css"
import React, { useMemo, useState, useRef } from "react"
import { CustomButton, SegmentedControl } from "../../../generics.tsx"
import "react-datepicker/dist/react-datepicker.css"
import { isSameDay } from "date-fns"
import { Datepicker } from "../../../datepicker/datepicker.tsx"
import Card from "../../../card"
import D3Chart from "../../../chart/chart"
import { subDays, isAfter, startOfDay } from 'date-fns'
import Modal from "../../../modal.tsx"
import { useMotionValue, useSpring, useMotionValueEvent, useTransform, motion } from "motion/react"
import { useDrag } from "@use-gesture/react"
import { format } from "date-fns"


const WeightComponent = () => {
	return (
		<div className="swiper-inner">
			<WeightAnalytics />
			<LogWeight />
		</div>
	)
}

const calculateAverages = (data: WeightLog[]) => {
	const getAvg = (arr: any[]) =>
		arr.length ? arr.reduce((sum, item) => sum + item.weight, 0) / arr.length : 0;

	const lastSevenEntries = data.slice(0, 7);
	const previousSevenEntries = data.slice(7, 14);

	const currentAvg = getAvg(lastSevenEntries);
	const previousAvg = getAvg(previousSevenEntries);

	return {
		currentAvg: currentAvg.toFixed(2),
		previousAvg: previousAvg.toFixed(2),
		diff: (currentAvg - previousAvg).toFixed(2)
	};
};

const modes = ["7D", "14D", "30D", "ALL"]

const WeightAnalytics = () => {

	const { weightLogs } = useData()

	const stats = useMemo(() =>
		calculateAverages(weightLogs.data),
		[weightLogs.data]
	)
	const [mode, setMode] = useState<string>("7D")

	const filteredData = useMemo(() => {
		const now = new Date()
		if (mode === "ALL") return weightLogs.data
		let daysToSub = 6
		if (mode === "14D") daysToSub = 13
		if (mode === "30D") daysToSub = 29
		const cutoff = startOfDay(subDays(now, daysToSub))
		return weightLogs.data.filter(item => {
			return isAfter(item.date, cutoff)
		})
	}, [mode, weightLogs.data])

	return (
		<Card
			header="CURRENT WEIGHT"
			subHeader="AVERAGE WEIGHT FROM THE PAST 7 DAYS"
			style={{ flexShrink: 1 }}
		>
			<div
				className="current-weight"
				style={{
					"--content-before": `"${stats.currentAvg}"`,
					"--content-after": '"KG"',
					"--icon": Number(stats.diff) < 0
						? 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYyOWQiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXRyZW5kaW5nLWRvd24taWNvbiBsdWNpZGUtdHJlbmRpbmctZG93biI+PHBhdGggZD0iTTE2IDE3aDZ2LTYiLz48cGF0aCBkPSJtMjIgMTctOC41LTguNS01IDVMMiA3Ii8+PC9zdmc+")'
						: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYyOWQiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXRyZW5kaW5nLXVwLWljb24gbHVjaWRlLXRyZW5kaW5nLXVwIj48cGF0aCBkPSJNMTYgN2g2djYiLz48cGF0aCBkPSJtMjIgNy04LjUgOC41LTUtNUwyIDE3Ii8+PC9zdmc+")'
				} as React.CSSProperties}
			>
				{stats.diff}
			</div>
			<div style={{ backgroundColor: "var(--surface-main)", borderRadius: 5, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }}>
				<SegmentedControl id="weight" options={modes} value={mode} onChange={setMode} />
				<D3Chart data={filteredData} yAccessor="weight" isOnScreen />
			</div>
		</Card>
	)
}

const RANGE_MIN = 50
const RANGE_MAX = 99.9
const TICK_SPACING = 20
const TOTAL_TICKS = (RANGE_MAX - RANGE_MIN) * 10


const LogWeight = () => {
	const { weightLogs } = useData()
	const latestWeight = weightLogs.data[0]?.weight ?? 0;

	const [showDatePicker, setShowDatePicker] = useState<boolean>(false)


	const [selectedDate, setSelectedDate] = useState<Date>(new Date())

	const isDateAlreadyLogged = selectedDate
		? weightLogs.data.some(log => isSameDay(log.date, selectedDate))
		: false;

	const handlePostWeight = async (e: React.MouseEvent, setLoading: (val: boolean) => void) => {
		e.preventDefault()
		e.stopPropagation()

		if (selectedDate && !isDateAlreadyLogged && displayRef.current) {
			setLoading(true)
			weightLogs.manager.addWeight(Number(displayRef.current.innerText), selectedDate)
		}
	}

	const displayRef = useRef<HTMLDivElement>(null)

	const INITIAL_OFFSET = (latestWeight - RANGE_MIN) * 10 * -TICK_SPACING
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
		const val = Math.round(latest * 10) / 10;
		if (displayRef.current) {
			displayRef.current.innerText = val.toFixed(1);
		}
	});

	const bind = useDrag(({ offset: [x], last }) => {
		const minScroll = -TOTAL_TICKS * TICK_SPACING;
		const maxScroll = 0;

		if (last) {
			const snappedValue = Math.round(x / TICK_SPACING) * TICK_SPACING;
			offset.set(Math.max(minScroll, Math.min(maxScroll, snappedValue)));
		} else {
			offset.set(Math.max(minScroll, Math.min(maxScroll, x)));
		}
	}, {
		from: () => [offset.get(), 0],
		rubberband: true,
		preventWindowScrollPropagation: true,
	});

	const initialScrolledTicks = Math.abs(INITIAL_OFFSET / TICK_SPACING);
	const initialCenter = Math.round(initialScrolledTicks / 10) * 10;

	const [visibleRange, setVisibleRange] = useState({
		start: Math.max(0, initialCenter - 10),
		end: Math.min(TOTAL_TICKS, initialCenter + 10)
	});

	useMotionValueEvent(springOffset, "change", (latestX) => {
		const scrolledTicks = Math.abs(latestX / TICK_SPACING);
		const centerIndex = Math.round(scrolledTicks / 10) * 10;

		const start = Math.max(0, centerIndex - 10);
		const end = Math.min(TOTAL_TICKS, centerIndex + 10);

		if (start !== visibleRange.start) {
			setVisibleRange({ start, end });
		}
	});

	const windowedLabels = useMemo(() => {
		const arr = [];
		for (let i = visibleRange.start; i <= visibleRange.end; i += 10) {
			arr.push(
				<div
					key={i}
					className="tick-label-container"
					style={{ left: i * TICK_SPACING }}
				>
					{(RANGE_MIN + i / 10).toFixed(0)}
				</div>
			);
		}
		return arr;
	}, [visibleRange]);

	return (
		<Card
			header="LOG WEIGHT"
			subHeader="SLIDE TO ADJUST YOUR DAILY ENTRY"
			style={{ alignItems: "center", marginTop: 0 }}
		>
			<div
				className="date action-button-primary"
				onClick={() => setShowDatePicker(true)}
			>
				{format(selectedDate, "MMM d").toUpperCase()}
			</div>
			<div className="value-display" ref={displayRef}>
				{latestWeight}
			</div>
			<div
				{...bind()}
				className="touch-area swiper-no-swiping"
			>
				<motion.div
					className="ruler-track"
					style={{
						x: springOffset,
						width: TOTAL_TICKS * TICK_SPACING,
					}}
				>
					{windowedLabels}
				</motion.div>
			</div>
			<CustomButton
				text={{
					default: "SAVE ENTRY",
					disabled: "ALREADY LOGGED"
				}}
				disabled={isDateAlreadyLogged}
				onClick={handlePostWeight}
				style={{ marginTop: 12, width: 200 }}
			/>
			<Modal
				visible={showDatePicker}
				onOverlayClick={() => setShowDatePicker(false)}
				page={0}
				direction={0}
			>
				<Card
					header="CALENDAR"
					subHeader="SELECT THE DATE YOU WANT TO LOG"
				>
					<Datepicker
						key="datepicker"
						selectedDate={selectedDate}
						onSelect={(d) => { setSelectedDate(d); }}
						excludeDates={weightLogs.data.map(val => val.date)}
					/>
				</Card>
			</Modal>
		</Card >
	)
}

export default React.memo(WeightComponent)
