import { useData, type WeightLog } from "../dataContext"
import { D3Chart } from "../chart/chart"
import "./weighComponent.css"
import { useEffect, useRef, useState, type MouseEvent } from "react"
import { WheelPickerWrapper, WheelPicker } from "../wheelPicker.tsx"
import { VscListFilter } from "react-icons/vsc"
import { isToday } from 'date-fns'
import { Card } from "../generics.tsx"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { format } from "date-fns"
import { RiDeleteBin5Line, RiCloseLine } from "react-icons/ri";
import { motion, AnimatePresence } from "motion/react"
import { ScaleLoader } from "react-spinners"

export const WeightComponent = () => {
	return (
		<>
			<WeightAnalytics />
			<LogWeight />
		</>
	)
}

const WeightAnalytics = () => {
	const { weightLogs } = useData()

	const stats = calculateAverages(weightLogs.values);
	return (
		<Card
			header="Weight Analytics"
			subHeader="Analyse the progression of your weight"
			settings={<WeightAnalyticsSettings />}
			settingsStyle={{ overflow: "hidden" }}
		>
			<h3>Weight: {stats.currentAvg} ({stats.diff})</h3>
			<D3Chart data={weightLogs.values} yAccessor="weight" />
		</Card>
	)
}
const calculateAverages = (data: WeightLog[]) => {
	const getAvg = (arr: any[]) =>
		arr.length ? arr.reduce((sum, item) => sum + item.weight, 0) / arr.length : 0;

	const lastSevenEntries = data.slice(0, 7);
	const previousSevenEntries = data.slice(7, 14);

	// 3. Calculate results
	const currentAvg = getAvg(lastSevenEntries);
	const previousAvg = getAvg(previousSevenEntries);

	return {
		currentAvg: currentAvg.toFixed(2),
		previousAvg: previousAvg.toFixed(2),
		diff: (currentAvg - previousAvg).toFixed(2)
	};
};


const WeightAnalyticsSettings = () => {
	const { weightLogs } = useData()

	const deleteLog = (id: string) => {
		weightLogs.manager.delete(id, { minTime: 1000 })
	}

	return (
		<>
			<h3>History</h3>
			<div
				className="weight-log-item-container"
			>
				<AnimatePresence mode="popLayout">
					{
						weightLogs.values.length
							?
							weightLogs.values.map((log) => (
								<WeightLogItem
									key={log.id}
									item={log}
									onClick={deleteLog}
								/>
							))
							:
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
					}
				</AnimatePresence>
			</div>
		</>
	)
}

const WeightLogItem = (props: { item: WeightLog, onClick: (val: string) => void }) => {
	const [showPrompt, setShowPrompt] = useState<boolean>(false)
	const [loading, setLoading] = useState<boolean>(false)

	useEffect(() => {
		console.log(loading, Date.now())
	}, [loading])
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
				<span>{format(props.item.date, "PP")}</span>
			</div>
			<div className="weight">{props.item.weight}<span>KG</span></div>
			<div className="delete">
				<div
					onClick={(e) => {
						e.preventDefault()
						e.stopPropagation()
						// props.onClick(props.item.id)
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

const optionsInt = Array.from({ length: 100 }, (_, i) => ({ label: `${i}`, value: i }));
const optionsDecimal = Array.from({ length: 10 }, (_, i) => ({ label: `${i}`, value: i }));

const LogWeight = () => {
	const { weightLogs } = useData()
	const latestWeight = weightLogs.values[0]?.weight ?? 0;

	const [weightInt, setWeightInt] = useState<number>(Math.trunc(latestWeight));
	const [weightDecimal, setWeightDecimal] = useState<number>(Math.round((latestWeight - Math.trunc(latestWeight)) * 10));

	const hasEnteredWeightToday = weightLogs.values.length
		? isToday(weightLogs.values[0].date)
		: false;

	const handlePostWeight = async (e: MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		if (hasEnteredWeightToday) return

		weightLogs.manager.post({ weight: weightInt + weightDecimal / 10 })
	}

	return (
		<Card
			header="Log Weight"
			subHeader="Scroll to register today's value"
			settings={<LogWeightSettings />}
			contentStyle={{
				alignItems: "center"
			}}
		>
			<div className="weight-wheelpicker">
				<WheelPickerWrapper className="www" >
					<WheelPicker
						options={optionsInt}
						value={weightInt}
						onValueChange={setWeightInt}
						infinite
					/>
				</WheelPickerWrapper>
				<WheelPickerWrapper className="www">
					<WheelPicker
						options={optionsDecimal}
						value={weightDecimal}
						onValueChange={setWeightDecimal}
						infinite
						dragSensitivity={5}
					/>
				</WheelPickerWrapper>
				<div className="highlight">
					<VscListFilter style={{ rotate: "-90deg" }} />
					<span style={{ fontSize: 24, color: "var(--color-text)", paddingBottom: 8 }}>.</span>
					<VscListFilter style={{ rotate: "90deg" }} />
				</div>
			</div>
			<button
				className={!hasEnteredWeightToday ? "active" : ""}
				onClick={handlePostWeight}>
				<span style={hasEnteredWeightToday ? { fontWeight: 300 } : {}}>{hasEnteredWeightToday ? "Already logged today" : "SAVE ENTRY"}</span>
			</button>
		</Card>
	)
}

const LogWeightSettings = () => {
	const { weightLogs } = useData()
	const latestWeight = weightLogs.values[0]?.weight ?? 0

	const [selectedDate, setSelectedDate] = useState<Date | null>(null)
	const [weightInt, setWeightInt] = useState<number>(Math.trunc(latestWeight))
	const [weightDecimal, setWeightDecimal] = useState<number>(Math.round((latestWeight - Math.trunc(latestWeight)) * 10))

	const handlePostWeight = async (e: MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		if (!selectedDate) return

		weightLogs.manager.post({ weight: weightInt + weightDecimal / 10, date: selectedDate }, { onSuccess: () => { setSelectedDate(null) } })
	}
	return (
		<>
			<h3>Log Weight for a different day</h3>
			<div
				className="log-weight-settings"
			>
				<MyDatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} excluded={weightLogs.values.map(log => log.date)} />
				<div className="weight-wheelpicker">
					<WheelPickerWrapper className="www" >
						<WheelPicker
							options={optionsInt}
							value={weightInt}
							onValueChange={setWeightInt}
							infinite
						/>
					</WheelPickerWrapper>
					<WheelPickerWrapper className="www">
						<WheelPicker
							options={optionsDecimal}
							value={weightDecimal}
							onValueChange={setWeightDecimal}
							infinite
							dragSensitivity={5}
						/>
					</WheelPickerWrapper>
					<div className="highlight">
						<VscListFilter style={{ rotate: "-90deg" }} />
						<span style={{ fontSize: 24, color: "var(--color-text)", paddingBottom: 8 }}>.</span>
						<VscListFilter style={{ rotate: "90deg" }} />
					</div>
				</div>
				<button
					className={selectedDate ? "active" : ""}
					onClick={handlePostWeight}>
					<span style={!selectedDate ? { fontWeight: 300 } : {}}>{!selectedDate ? "Please select date" : "SAVE ENTRY"}</span>
				</button>
			</div>
		</>
	)
}

const MyDatePicker = (props: { selectedDate: Date | null, setSelectedDate: (val: Date | null) => void, excluded: Date[] }) => {

	const datePickerRef = useRef<DatePicker>(null);

	const handleDateChange = (date: Date | null) => {
		props.setSelectedDate(date);
		if (datePickerRef.current) {
			datePickerRef.current.setOpen(false);
		}
	};

	return (
		<DatePicker
			ref={datePickerRef}
			selected={props.selectedDate}
			onChange={handleDateChange}
			excludeDates={props.excluded}
			className="my-custom-input"
			calendarClassName="my-custom-calendar"
			placeholderText="Click to select date"
			dateFormat="MMMM d, yyyy"
			customInput={<input inputMode="none" className="datepicker-input" />}
			portalId="datepicker-portal"
			withPortal
		/>
	);
};

