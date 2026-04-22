import { useData } from "../../../dataApi/dataContext"
import { type WeightLog } from "../../../dataApi/managers/WeightManager.ts"
import "./weightComponent.css"
import React, { useMemo, useState, type MouseEvent } from "react"
import { CustomButton, RulerPicker, SegmentedControl } from "../../../generics.tsx"
import "react-datepicker/dist/react-datepicker.css"
import { isSameDay } from "date-fns"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Datepicker } from "../../../datepicker/datepicker.tsx"
import Card from "../../../card"
import D3Chart from "../../../chart/chart"
import { HiX } from "react-icons/hi"
import { subDays, isAfter, startOfDay } from 'date-fns'
import Modal from "../../../modal.tsx"


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
			<div className="current-weight">
				{stats.currentAvg}
				<span className="stats">{Number(stats.diff) > 0 ? <TrendingUp strokeWidth="1.5" size="24" /> : <TrendingDown strokeWidth="1.5" size="24" />}{stats.diff}</span>
			</div>

			<div style={{ backgroundColor: "var(--color-bg)", borderRadius: 5, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }}>
				<SegmentedControl id="weight" options={modes} onChange={setMode} />
				<D3Chart data={filteredData} yAccessor="weight" isOnScreen />
			</div>
		</Card>
	)
}

const LogWeight = () => {
	const { weightLogs } = useData()
	const latestWeight = weightLogs.data[0]?.weight ?? 0;

	const [logValue, setLogValue] = useState<number>(latestWeight)
	const [showDatePicker, setShowDatePicker] = useState<boolean>(false)


	const [selectedDate, setSelectedDate] = useState<Date>(new Date())

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
			style={{ alignItems: "center" }}
		>
			<RulerPicker displayValue={logValue} setDisplayValue={setLogValue} date={selectedDate} onDateClick={() => setShowDatePicker(true)} />
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
					settingsLogo={<HiX fontSize={20} />}
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
