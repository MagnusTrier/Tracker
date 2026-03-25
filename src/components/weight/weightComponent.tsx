import { useData } from "../dataContext"
import { D3Chart } from "../chart/chart"
import "./weighComponent.css"
import { useState, type MouseEvent } from "react";
import { WheelPickerWrapper, WheelPicker } from "../wheelPicker/wheelPicker.tsx"
import { VscListFilter } from "react-icons/vsc";
import { parseISO, isToday } from 'date-fns';
import { Card } from "../generics.tsx";

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
	return (
		<Card
			header="Weight Analytics"
			subHeader="Analyse the progression of your weight"
			settings={<span>REE</span>}
		>
			<D3Chart data={weightLogs.values} yAccessor="weight" />
		</Card>
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
		? isToday(parseISO(weightLogs.values[0]?.created_at))
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
			settings={<span>REE</span>}
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



