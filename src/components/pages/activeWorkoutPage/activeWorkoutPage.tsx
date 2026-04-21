import { useNavigate } from "react-router-dom"
import { CustomButton, FastInput, PageContainer } from "../../generics"
import "./activeWorkoutPage.css"
import Card from "../../card"
import type { Exercise } from "../../dataApi/managers/ExerciseManager"
import Swiper from "../../swiper/swiper"
import { useSession } from "../../sessionContext"
import { type ActiveWorkout, type ExerciseSetMap, type SetLog } from "../../dataApi/managers/WorkoutManager"
import { useEffect, useState } from "react"
import { motion, AnimatePresence, useIsPresent, hex, LayoutGroup } from "motion/react"
import { Plus } from "lucide-react"
import { useData } from "../../dataApi/dataContext"

interface SetLogExtended extends SetLog {
	id: string
}

const generateId = (): string => {
	if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
		return window.crypto.randomUUID();
	}
	return Math.random().toString(36).substring(2, 11);
};

const emptySet = (set_nr: number) => ({
	weight_kg: 0,
	reps: 0,
	set_nr: set_nr,
	id: generateId()
}) as SetLogExtended

const getLocalActiveWorkout = () => {
	const workout = localStorage.getItem("active_workout")
	let workoutData = null
	if (workout) {
		workoutData = JSON.parse(workout) as ActiveWorkout
	}
	return workoutData
}

const ActiveWorkoutPage = () => {
	const nav = useNavigate()
	const { activeWorkout } = useSession()
	const [workout, setWorkout] = useState<ActiveWorkout | null>(activeWorkout || getLocalActiveWorkout())
	const { workouts } = useData()

	const handleClose = () => {
		localStorage.removeItem("active_workout")
		nav("/weight")
	}

	if (!workout) {
		handleClose()
		return
	}

	useEffect(() => {
		localStorage.setItem("active_workout", JSON.stringify(workout))
	}, [workout])

	const addSet = (id: string) => {
		setWorkout(prev => {
			if (!prev) return null
			return {
				...prev,
				data: {
					...prev.data,
					[id]: [
						...prev.data[id] || [],
						emptySet(prev.data[id]?.length + 1 || 1)
					]
				}
			}
		})
	}

	const removeSet = (id: string, setNr: number) => {
		setWorkout(prev => {
			if (!prev) return null
			return {
				...prev,
				data: {
					...prev.data,
					[id]: (prev.data[id] || [])
						.filter(set => set.set_nr !== setNr)
						.map((s, i) => ({
							...s,
							set_nr: i + 1
						}))
				}
			}
		})
	}

	const updateSet = (id: string, setNr: number, update: Partial<SetLog>) => {
		setWorkout(prev => {
			if (!prev) return null
			return {
				...prev,
				data: {
					...prev.data,
					[id]: (prev.data[id] || [])
						.map(s => (
							s.set_nr === setNr
								? { ...s, ...update }
								: s
						))
				}
			}
		})
	}

	const handleSave = () => {
		const validEntries: ExerciseSetMap = {}
		if (Object.keys(workout.data).length > 0) {
			Object.keys(workout.data).map((k) => {
				workout.data[k].map(set => {
					if (set.reps !== 0) {
						if (!validEntries[k]) {
							validEntries[k] = []
						}
						validEntries[k].push({ set_nr: set.set_nr, reps: set.reps, weight_kg: set.weight_kg })
					}
				})

			})
		}

		if (Object.keys(validEntries).length > 0) {
			workouts.manager.logWorkoutSession(
				workout.id,
				validEntries
			)
			handleClose()
		}
	}

	return (
		<PageContainer
			style={{
				position: "fixed",
				height: "100dvh",
				width: "100dvw",
				zIndex: 1000,
				padding: 0,
				maxHeight: "100dvh"
			}}
		>
			<div className="active-workout-content">
				<Swiper
					slides={
						workout.exercises.map((ex, index) =>
							<ExerciseCard
								key={ex.id}
								index={index}
								total={workout.exercises.length}
								exercise={ex}
								data={workout.data[ex.id] as SetLogExtended[]}
								addSet={addSet}
								removeSet={removeSet}
								updateSet={updateSet}
							/>
						)}
					circuit />
			</div>
			<div className="active-workout-navbar">
				<div>
					<CustomButton
						text={{ default: "EXIT" }}
						onClick={handleClose}
						style={{ width: "100%", height: "100%" }}
						theme="neutral"
					/>
				</div>
				<div>

					<CustomButton
						text={{ default: "SAVE" }}
						onClick={handleSave}
						style={{ width: "100%", height: "100%" }}
					/>
				</div>
			</div>
		</PageContainer>
	)
}

const ExerciseCard = (props: {
	exercise: Exercise,
	index: number,
	total: number,
	data: SetLogExtended[],
	addSet: (id: string) => void,
	removeSet: (id: string, setNr: number) => void,
	updateSet: (id: string, setNr: number, update: Partial<SetLog>) => void
}) => {

	const handleOnBlur = (setNr: number) => {
		return (update: Partial<SetLog>) => props.updateSet(props.exercise.id, setNr, update)
	}

	return (
		<Card
			header={`${props.exercise.name} (${props.index + 1}/${props.total})`}
			subHeader="LOG SETS FOR THIS EXERCISE"
			hideSettings
			contentStyle={{ overflow: "hidden", maxHeight: "calc(100dvh - 193px)" }}
		>
			<div className="sets-wrapper">
				<div
					className="sets-container"
					style={{ borderBottom: props.data ? "1px solid var(--color-border)" : "1px solid transparent" }}
				>
					<AnimatePresence initial={false}>
						{(props.data || []).map((item, i) => (
							<Item
								key={item.id}
								set={item}
								onRemove={() => props.removeSet(props.exercise.id, item.set_nr)}
								last={i + 1 === props.data.length}
								onBlur={handleOnBlur(item.set_nr)}
							/>
						))}
					</AnimatePresence>
				</div>

				<div
					className="add-set-button clickable"
					onClick={() => props.addSet(props.exercise.id)}
				>
					ADD SET <Plus style={{ height: 22, width: 22, strokeWidth: 2 }} />
				</div>
			</div>
		</Card>
	)
}

const Item = (props: { set: SetLogExtended, onRemove: () => void, last: boolean, onBlur: (update: Partial<SetLog>) => void }) => {
	const [reps, setReps] = useState<string>(props.set.reps.toString())
	const [weight, setWeight] = useState<string>(props.set.weight_kg.toString())
	return (
		<motion.div
			initial={{ height: 0, opacity: 0 }}
			animate={{ height: 'auto', opacity: 1 }}
			exit={{ height: 0, opacity: 0 }}
			transition={{ duration: 0.2, ease: 'easeOut' }}
		>
			<motion.div
				className="set-item"
				style={{
					display: "flex",
					justifyContent: "space-between",
					borderBottom: props.last ? "1px solid transparent" : "1px solid var(--color-border)"
				}}
				initial={{ opacity: 0, y: -8, scale: 0.98, }}
				animate={{ opacity: 1, y: 0, scale: 1, }}
				exit={{ opacity: 0, y: 8, scale: 0.98, }}
				transition={{ duration: 0.15, ease: 'easeOut' }}
			>
				{props.set.set_nr})
				<div className="reps-display">
					<SetInput
						value={reps}
						setValue={setReps}
						onBlur={() => props.onBlur({ reps: Number(reps) })}
					/>
					REPS
				</div>
				<div className="reps-display">
					<SetInput
						value={weight}
						setValue={setWeight}
						onBlur={() => props.onBlur({ weight_kg: Number(weight) })}
					/>
					KG
				</div>
				<div style={{ height: 50, width: 50, border: "1px solid red" }} onClick={props.onRemove}>Delete</div>
			</motion.div>
		</motion.div>
	);
};

const SetInput = (props: { value: string, setValue: (val: string) => void, onBlur: () => void }) => {
	return (
		<input
			type="tel"
			className="set-input"
			value={props.value}
			onChange={(e) => props.setValue(e.target.value)}
			onFocus={(e) => e.target.select()}
			onBlur={props.onBlur}
		/>
	)
}

export default ActiveWorkoutPage
