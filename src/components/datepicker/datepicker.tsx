import { useState } from 'react'
import { GoTriangleLeft, GoTriangleRight } from "react-icons/go"
import {
	format,
	addMonths,
	subMonths,
	startOfMonth,
	getDaysInMonth,
	getDay,
	isSameDay,
	isToday
} from 'date-fns'
import './datepicker.css'

interface Props {
	selectedDate: Date | null
	onSelect: (date: Date) => void
	excludeDates?: Date[]
	ref?: React.RefObject<HTMLDivElement | null>
}

export const Datepicker = ({ selectedDate, onSelect, excludeDates = [] }: Props) => {
	const [viewDate, setViewDate] = useState(new Date())

	const monthStart = startOfMonth(viewDate)
	const daysInMonth = getDaysInMonth(viewDate)
	const startDayOfWeek = getDay(monthStart)

	const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1))
	const handleNextMonth = () => setViewDate(addMonths(viewDate, 1))

	const days = []
	for (let i = 0; i < startDayOfWeek; ++i) {
		days.push(<div key={`empty-${i}`} className="day empty" />)
	}

	for (let d = 1; d <= daysInMonth; ++d) {
		const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), d)
		const isExcluded = excludeDates.some(ex => isSameDay(ex, date))
		const isSelected = selectedDate && isSameDay(date, selectedDate)

		const dateKey = format(date, "yyyy-MM-dd")

		days.push(
			<div
				key={dateKey}
				className={`day ${isSelected ? 'selected' : ''} ${isExcluded ? 'disabled' : ''} ${isToday(date) ? "today" : ""}`}
				onClick={() => { !isExcluded && onSelect(date) }}
			>
				{d}
			</div>
		)
	}


	return (
		<div
			className="custom-calendar"
		>
			<div className="calendar-header">
				<div onClick={handlePrevMonth}>
					<GoTriangleLeft />
				</div>
				<h2>{format(viewDate, 'MMMM yyyy').toUpperCase()}</h2>
				<div onClick={handleNextMonth}>
					<GoTriangleRight />
				</div>
			</div>

			<div className="weekdays-grid">
				{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
					<div key={`${d}-${i}`} className="weekday">{d}</div>
				))}
			</div>

			<div className="days-grid">
				{days}
			</div>

			<div className="calendar-legend">
				<span className="selected">SELECTED</span>
				<span className="today">TODAY</span>
				<span className="available">AVAILABLE</span>
				<span className="disabled">ALREADY LOGGED</span>
			</div>
		</div>
	)
}
