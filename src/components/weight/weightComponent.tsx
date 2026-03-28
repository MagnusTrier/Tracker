import { useData, type WeightLog } from "../dataContext"
import "./weighComponent.css"
import React, { useEffect, useMemo, useState, type MouseEvent } from "react"
import { CustomButton, RulerPicker } from "../generics.tsx"
import { useOutsideClick } from "../../lib/outsideClick.ts"
import "react-datepicker/dist/react-datepicker.css"
import { format, isSameDay } from "date-fns"
import { RiDeleteBin5Line, RiCloseLine } from "react-icons/ri";
import { motion, AnimatePresence } from "motion/react"
import { ScaleLoader } from "react-spinners"
import { IoIosTrendingDown, IoIosTrendingUp } from "react-icons/io"
import { createPortal } from "react-dom"
import { Datepicker } from "../datepicker/datepicker.tsx"
import Card from "../card"
import D3Chart from "../chart/chart"


const WeightComponent = () => {
	return (
		<>
			<CurrentWeight />
			<WeightAnalytics />
			<LogWeight />
		</>
	)
}

const CurrentWeight = () => {
	const { weightLogs } = useData()
	const stats = useMemo(() =>
		calculateAverages(weightLogs.values),
		[weightLogs.values]
	)

	return (
		<Card
			hideSettings
			header={<span style={{ color: "var(--color-primary)", textShadow: "0 0 15px color-mix(in srgb, var(--color-primary), transparent 50%)" }}>CURRENT WEIGHT</span>}
			contentStyle={{ marginBottom: -4 }}
		>
			<div className="current-weight-container">
				<span className="current-weight">
					{stats.currentAvg}
					<span> KG</span>
				</span>
				<span className="stats">{Number(stats.diff) > 0 ? <IoIosTrendingUp style={{ fontSize: 24 }} /> : <IoIosTrendingDown style={{ fontSize: 24 }} />}{stats.diff}</span>
			</div>

		</Card>

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

import { subDays, isAfter, startOfDay } from 'date-fns'

const modes = ["7D", "14D", "30D", "ALL"]

const WeightAnalytics = () => {
	const { weightLogs } = useData()
	const [mode, setMode] = useState<string>("7D")
	const [isReady, setIsReady] = useState<boolean>(true)

	useEffect(() => {
		const timer = setTimeout(() => setIsReady(true), 400)
		return () => clearTimeout(timer)
	}, [])

	const filteredData = useMemo(() => {
		const now = new Date()
		if (mode === "ALL") return weightLogs.values
		let daysToSub = 7
		if (mode === "14D") daysToSub = 14
		if (mode === "30D") daysToSub = 30
		const cutoff = startOfDay(subDays(now, daysToSub))
		return weightLogs.values.filter(item => {
			return isAfter(item.date, cutoff)
		})
	}, [mode, weightLogs.values])

	return (
		<Card
			header="WEIGHT ANALYTICS"
			settings={(isOpen) => isOpen ? <WeightAnalyticsSettings /> : null}
			settingsStyle={{ overflow: "hidden" }}
			settingsSubheader="YOUR WEIGHT LOG HISTORY"
		>
			<div style={navWrapper}>
				<ul style={tabsList}>
					{modes.map((item) => {
						const isActive = mode === item
						return (
							<li
								key={item}
								onClick={() => setMode(item)}
								style={{
									...tabItem,
									color: isActive ? "var(--color-primary)" : "var(--text-dim)"
								}}
							>
								<span style={{ zIndex: 2 }}>{item}</span>

								{isActive && (
									<motion.div
										layoutId="active-pill"
										style={activeIndicator}
										transition={{
											type: "spring",
											bounce: 0.2,
											duration: 0.5
										}}
									/>
								)}
							</li>
						)
					})}
				</ul>
			</div>
			<div className="chart">
				{
					isReady &&
					<D3Chart data={filteredData} yAccessor="weight" />
				}
			</div>
		</Card>
	)
}


const navWrapper: React.CSSProperties = {
	background: "var(--color-dark)",
	borderRadius: "10px",
	marginTop: 6,
}

const tabsList: React.CSSProperties = {
	display: "flex",
	listStyle: "none",
	margin: 0,
	position: "relative",
	padding: "6px",
}

const tabItem: React.CSSProperties = {
	flex: 1,
	padding: "5px 0",
	fontSize: "12px",
	fontWeight: 600,
	textAlign: "center",
	cursor: "pointer",
	position: "relative",
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	transition: "color 0.2s ease",
	WebkitTapHighlightColor: "transparent",
}

const activeIndicator: React.CSSProperties = {
	position: "absolute",
	inset: 0,
	background: "color-mix(in srgb, var(--color-primary), transparent 90%)",
	borderRadius: "10px",
	border: "1px solid color-mix(in srgb, var(--color-primary), transparent 80%)",
	zIndex: 1,
	boxShadow: "0 0 4px color-mix(in srgb, var(--color-primary), transparent 80%)",
}


const WeightAnalyticsSettings = () => {
	const { weightLogs } = useData()

	const deleteLog = (id: string) => {
		weightLogs.manager.delete(id, { minTime: 1000 })
	}

	const logList = useMemo(() => {
		return weightLogs.values.map((log) => (
			<WeightLogItem
				key={log.id}
				item={log}
				onClick={deleteLog}
			/>
		))
	}, [weightLogs.values])

	if (!weightLogs.values.length) return (
		<div
			className="date-container"
			style={{
				display: "flex",
				alignItems: "center",
				paddingLeft: 10,
				height: 60,
				backgroundColor: "var(--color-dark)",
				color: "var(--text-dim)"
			}}
		>
			You have not logged any weight yet
		</div>
	)

	return (
		<div
			className="weight-log-item-container"
		>
			<AnimatePresence mode="popLayout">
				{logList}
			</AnimatePresence>
		</div>
	)
}

const WeightLogItem = (props: { item: WeightLog, onClick: (val: string) => void }) => {
	const [showPrompt, setShowPrompt] = useState<boolean>(false)
	const [loading, setLoading] = useState<boolean>(false)

	return (
		<motion.div
			className="weight-log-item"
			exit={{
				opacity: 0,
				x: "-100%",
				transition: { ease: "easeInOut" }
			}}
		>
			<div className="date-container">
				<span>{format(props.item.date, "EEEE").toUpperCase()}</span>
				<span>{format(props.item.date, "PP").toUpperCase()}</span>
			</div>
			<div className="weight">{props.item.weight.toFixed(1)}<span>KG</span></div>
			<div className="delete">
				<div
					onClick={(e) => {
						e.preventDefault()
						e.stopPropagation()
						setShowPrompt(true)
					}}
				>
					<RiDeleteBin5Line />
				</div>
			</div>
			<motion.div
				className="confirm-delete"
				animate={{ opacity: showPrompt ? 1 : 0, visibility: showPrompt ? "visible" : "hidden" }}
			>
				{

					loading
						?
						<ScaleLoader
							height={15}
							radius={2}
							color="var(--color-primary)"
						/>
						:
						<>
							<div
								style={{ "--color": "var(--color-neutral)" } as React.CSSProperties}
								onClick={(e) => {
									e.preventDefault()
									e.stopPropagation()
									setShowPrompt(false)
								}}
							>
								<RiCloseLine />
							</div>
							<div
								style={{ "--color": "var(--color-error)" } as React.CSSProperties}
								onClick={(e) => {
									e.preventDefault()
									e.stopPropagation()
									setLoading(true)
									props.onClick(props.item.id)
								}}
							>
								<RiDeleteBin5Line />
							</div>
						</>
				}
			</motion.div>
		</motion.div>
	)
}

const LogWeight = () => {
	const { weightLogs } = useData()
	const latestWeight = weightLogs.values[0]?.weight ?? 0;

	const [logValue, setLogValue] = useState<number>(latestWeight)
	const [showDatePicker, setShowDatePicker] = useState<boolean>(false)


	const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

	const isDateAlreadyLogged = selectedDate
		? weightLogs.values.some(log => isSameDay(log.date, selectedDate))
		: false;

	const handlePostWeight = async (e: MouseEvent, setLoading: (val: boolean) => void) => {
		e.preventDefault()
		e.stopPropagation()

		if (selectedDate) {
			setLoading(true)
			weightLogs.manager.post(
				{ weight: logValue, date: selectedDate },
				{
					minTime: 1000
				})
		}

	}

	const ref = useOutsideClick<HTMLDivElement>(() => setShowDatePicker(false))

	return (
		<Card
			header="LOG WEIGHT"
			subHeader="SLIDE TO ADJUST YOUR DAILY ENTRY"
			contentStyle={{
				alignItems: "center",
				overflow: "visible"
			}}
			onSettingsClick={() => setShowDatePicker((prev) => !prev)}
			settings=""
		>
			<RulerPicker displayValue={logValue} setDisplayValue={setLogValue} date={selectedDate} />
			<CustomButton
				text={{
					default: "SAVE ENTRY",
					disabled: "ALREADY LOGGED"
				}}
				disabled={isDateAlreadyLogged}
				onClick={handlePostWeight}
			/>
			{
				createPortal(
					<AnimatePresence>
						{

							showDatePicker &&
							<motion.div
								key="datepicker-modal"
								className="datepicker-container"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3, ease: "easeInOut" }}
							>
								<Datepicker
									key="datepicker"
									ref={ref}
									selectedDate={selectedDate}
									onSelect={(d) => { setSelectedDate(d); }}
									excludeDates={weightLogs.values.map(val => val.date)}
								/>
							</motion.div>
						}
					</AnimatePresence>
					, document.getElementById("portal-root")!
				)
			}
		</Card >
	)
}

export default React.memo(WeightComponent)
