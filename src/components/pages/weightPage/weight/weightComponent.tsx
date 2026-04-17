import { useData } from "../../../dataApi/dataContext"
import { type WeightLog } from "../../../dataApi/managers/WeightManager.ts"
import "./weightComponent.css"
import React, { useMemo, useState, type MouseEvent } from "react"
import { CustomButton, RulerPicker, SegmentedControl } from "../../../generics.tsx"
import "react-datepicker/dist/react-datepicker.css"
import { format, isSameDay } from "date-fns"
import { RiDeleteBin5Line, RiCloseLine } from "react-icons/ri";
import { motion, AnimatePresence } from "motion/react"
import { ScaleLoader } from "react-spinners"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Datepicker } from "../../../datepicker/datepicker.tsx"
import Card from "../../../card"
import D3Chart from "../../../chart/chart"
import { HiX } from "react-icons/hi"
import { subDays, isAfter, startOfDay } from 'date-fns'
import Modal from "../../../modal.tsx"


const WeightComponent = (props: { isOnScreen: boolean }) => {
	return (
		<div className="swiper-inner">
			<WeightAnalytics isOnScreen={props.isOnScreen} />
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

const WeightAnalytics = (props: { isOnScreen: boolean }) => {

	const { weightLogs } = useData()
	const stats = useMemo(() =>
		calculateAverages(weightLogs.data),
		[weightLogs.data]
	)
	const [mode, setMode] = useState<string>("7D")
	const [showHistory, setShowHistory] = useState<boolean>(false)

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
			onSettingsClick={() => setShowHistory(true)}

		>
			<div className="current-weight-container">
				<span className="current-weight">
					{stats.currentAvg}
					<span> KG</span>
				</span>
				<span className="stats">{Number(stats.diff) > 0 ? <TrendingUp strokeWidth="1.5" size="24" /> : <TrendingDown strokeWidth="1.5" size="24" />}{stats.diff}</span>
			</div>

			<div style={{ backgroundColor: "var(--color-dark)", borderRadius: 8 }}>
				<SegmentedControl id="weight" options={modes} onChange={setMode} />
				<D3Chart data={filteredData} yAccessor="weight" isOnScreen={props.isOnScreen} />
			</div>
			<Modal
				visible={showHistory}
				setVisible={setShowHistory}
			>
				<Card
					header="HISTORY"
					subHeader="BROWSE YOUR LOGGING HISTORY"
					settingsLogo={<HiX fontSize={20} />}
					onSettingsClick={() => setShowHistory(false)}
					contentStyle={{ overflowY: "auto", overflowX: "hidden" }}
				>
					<WeightAnalyticsSettings />
				</Card>
			</Modal>
		</Card>
	)
}

const WeightAnalyticsSettings = () => {
	const { weightLogs } = useData()

	const deleteLog = (id: string) => {
		weightLogs.manager.deleteWeightLog(id)
	}

	const logList = useMemo(() => {
		return weightLogs.data.map((log) => (
			<WeightLogItem
				key={log.id}
				item={log}
				onClick={deleteLog}
			/>
		))
	}, [weightLogs.data])

	if (!weightLogs.data.length) return (
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
	const latestWeight = weightLogs.data[0]?.weight ?? 0;

	const [logValue, setLogValue] = useState<number>(latestWeight)
	const [showDatePicker, setShowDatePicker] = useState<boolean>(false)


	const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

	const isDateAlreadyLogged = selectedDate
		? weightLogs.data.some(log => isSameDay(log.date, selectedDate))
		: false;

	const handlePostWeight = async (e: MouseEvent, setLoading: (val: boolean) => void) => {
		e.preventDefault()
		e.stopPropagation()

		if (selectedDate && !isDateAlreadyLogged) {
			setLoading(true)
			weightLogs.manager.addWeight(logValue, selectedDate)
		}
	}

	return (
		<Card
			header="LOG WEIGHT"
			subHeader="SLIDE TO ADJUST YOUR DAILY ENTRY"
			contentStyle={{
				alignItems: "center",
				overflow: "visible"
			}}
			hideSettings
		>
			<RulerPicker displayValue={logValue} setDisplayValue={setLogValue} date={selectedDate} onDateClick={() => setShowDatePicker(true)} />
			<CustomButton
				text={{
					default: "SAVE ENTRY",
					disabled: "ALREADY LOGGED"
				}}
				disabled={isDateAlreadyLogged}
				onClick={handlePostWeight}
				style={{ marginTop: 9 }}
			/>
			<Modal
				visible={showDatePicker}
				setVisible={setShowDatePicker}
			>
				<Card
					header="CALENDAR"
					subHeader="SELECT THE DATE YOU WANT TO LOG"
					settingsLogo={<HiX fontSize={20} />}
					onSettingsClick={() => setShowDatePicker(false)}
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
