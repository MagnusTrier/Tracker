import { useNavigate } from "react-router-dom"
import { PageContainer } from "../../generics"
import "./activeWorkoutPage.css"
import { HeaderIcon } from "../../card"
import type { Exercise } from "../../dataApi/managers/ExerciseManager"
import Swiper from "../../swiper/swiper"
import { useSession } from "../../sessionContext"
import { type ActiveWorkout, type ExerciseSetMap, type SetLog } from "../../dataApi/managers/WorkoutManager"
import { useCallback, memo, useEffect, useState, useRef, useMemo } from "react"
import { motion, AnimatePresence, } from "motion/react"
import { CheckCheck, LogOut, Pause, Play, Circle } from "lucide-react"
import { useData } from "../../dataApi/dataContext"
import SystemPrompt from "../../systemPrompt"

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
	weight_kg: "",
	reps: "",
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

	const [showExitPrompt, setShowExitPrompt] = useState<boolean>(false)
	const [showFinishPrompt, setShowFinishPrompt] = useState<boolean>(false)

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

	const addSet = useCallback((id: string) => {
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
	}, [])

	const previousWorkout = workouts.history[workout.id]?.[0] || null

	if (previousWorkout) {
		Object.keys(previousWorkout.exercises).map(k => {
			if (!workout.data[k]) {
				previousWorkout.exercises[k].forEach(_ => {
					addSet(k)
				})
			}
		})
	}

	const removeSet = useCallback((id: string, setNr: number) => {
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
	}, [])

	const updateSet = useCallback((id: string, setNr: number, update: Partial<SetLog>) => {
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
	}, [])

	const validEntries: ExerciseSetMap = useMemo(() => {
		const entries: ExerciseSetMap = {}
		Object.keys(workout.data).map((k) => {
			workout.data[k].map(set => {
				if (set.reps !== "") {
					if (!entries[k]) {
						entries[k] = []
					}
					entries[k].push({ set_nr: set.set_nr, reps: set.reps, weight_kg: set.weight_kg })
				}
			})
		})
		return entries
	}, [workout.data])

	const allowFinish = Object.keys(validEntries).length > 0

	const handleSave = () => {
		if (Object.keys(validEntries).length > 0) {
			workouts.manager.logWorkoutSession(
				workout.id,
				validEntries
			)
			handleClose()
		}
	}

	const updateTimer = useCallback((val: number) => {
		setWorkout(prev => {
			if (!prev) return null
			return {
				...prev,
				timer: val
			}
		})
	}, [])

	const exerciseSlides = useMemo(() => {
		return workout.exercises.map((ex, index) => (
			<ExerciseCard
				key={ex.id}
				index={index}
				total={workout.exercises.length}
				exercise={ex}
				data={workout.data[ex.id] as SetLogExtended[]}
				addSet={addSet}
				removeSet={removeSet}
				updateSet={updateSet}
				previousWorkout={previousWorkout?.exercises[ex.id] || null}
			/>
		))
	}, [workout.exercises, workout.data])

	return (
		<>
			<Swiper
				slides={exerciseSlides}
				circuit
			/>

			<div className="active-workout-navbar">
				<div className="item" onClick={() => setShowExitPrompt(true)}>
					<LogOut strokeWidth="1.5" size="28" />
					LEAVE
				</div>
				<DigitalTimer onChange={updateTimer} initialValue={workout.timer} />
				<div className="item" onClick={() => allowFinish && setShowFinishPrompt(true)}>
					<CheckCheck strokeWidth="1.5" size="28" />
					FINISH
				</div>
			</div>


			<SystemPrompt
				visible={showExitPrompt}
				hide={() => setShowExitPrompt(false)}
				onConfirm={handleClose}
				header="LEAVE WORKOUT?"
			>
				BY LEAVING THIS WORKOUT ALL UNSAVED DATA WILL BE LOST.
			</SystemPrompt>
			<SystemPrompt
				visible={showFinishPrompt}
				hide={() => setShowFinishPrompt(false)}
				onConfirm={handleSave}
				header="FINISH WORKOUT?"
			>
				<div style={{ width: "100%", textAlign: "left" }}>
					CURRENTLY LOGGED:
					{
						workout.exercises.map(ex => (
							validEntries[ex.id]
								? (
									<div
										key={ex.id}
										style={{
											display: "grid",
											gridTemplateColumns: "4fr 1fr"
										}}
									>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: 5
											}}
										>
											<Circle size="4" strokeWidth="1" fill="var(--text-muted)" />
											{ex.name}
										</div>
										<span
											style={{
												fontVariantNumeric: "tabular-nums",
												textAlign: "start"
											}}
										>
											{validEntries[ex.id].length} SET{validEntries[ex.id].length === 1 ? "" : "S"}
										</span>
									</div>
								)
								: null
						))
					}
				</div>
			</SystemPrompt>
		</>
	)
}

const DigitalTimer = memo((props: { onChange: (seconds: number) => void, initialValue: number }) => {
	const [seconds, setSeconds] = useState<number>(props.initialValue);
	const [isActive, setIsActive] = useState<boolean>(true);
	const timerRef = useRef<number | null>(null);

	const secondsRef = useRef(seconds);
	secondsRef.current = seconds;

	const formatTime = (time: number): string => {
		const hrs = Math.floor(time / 3600);
		const mins = Math.floor((time % 3600) / 60);
		const secs = time % 60;

		return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	useEffect(() => {
		if (isActive) {
			timerRef.current = window.setInterval(() => {
				setSeconds(s => s + 1);
			}, 1000);
		} else if (timerRef.current) {
			clearInterval(timerRef.current);
		}
		return () => { if (timerRef.current) clearInterval(timerRef.current); };
	}, [isActive]);

	useEffect(() => {
		if (seconds > 0 && seconds % 30 === 0) {
			props.onChange(seconds);
		}
	}, [seconds, props.onChange]);

	return (
		<div
			className="item"
			onClick={() => setIsActive(prev => !prev)}
		>
			<div
				className="active-workout-timer"
			>
				{isActive
					? <Pause strokeWidth="1.5" size="14" />
					: <Play strokeWidth="1.5" size="14" />
				}
				{formatTime(seconds)}
				{isActive
					? <Pause strokeWidth="1.5" size="14" />
					: <Play strokeWidth="1.5" size="14" />
				}
			</div >
			WORKOUT DURATION
		</div >
	);
})

const ExerciseCard = memo((props: {
	exercise: Exercise,
	index: number,
	total: number,
	data: SetLogExtended[],
	addSet: (id: string) => void,
	removeSet: (id: string, setNr: number) => void,
	updateSet: (id: string, setNr: number, update: Partial<SetLog>) => void
	previousWorkout: SetLog[] | null
}) => {

	const handleOnBlur = (setNr: number) => {
		return (update: Partial<SetLog>) => props.updateSet(props.exercise.id, setNr, update)
	}

	return (
		<div className="card">
			<h1>{HeaderIcon}{`${props.exercise.name} (${props.index + 1}/${props.total})`}</h1>
			<h2>LOG SETS FOR THIS EXERCISE</h2>
			{
				props.data &&
				<div className="sets-grid">
					<div className="sets-header-subgrid">
						<span>SET</span>
						<span>REPS</span>
						<span>WEIGHT</span>
						<span></span>
					</div>
					<AnimatePresence initial={false} mode="popLayout">
						{props.data.map((item, i) => (
							<Item
								key={item.id}
								set={item}
								onRemove={() => props.removeSet(props.exercise.id, item.set_nr)}
								last={i + 1 === props.data.length}
								onBlur={handleOnBlur(item.set_nr)}
								previousWorkout={props.previousWorkout?.[i] || null}
							/>
						))}
					</AnimatePresence>
				</div>
			}
			<div className="add-set-button" onClick={() => props.addSet(props.exercise.id)}>
				ADD SET
			</div>
		</div>
	)
})


const Item = memo((props: { set: SetLogExtended, onRemove: () => void, last: boolean, onBlur: (update: Partial<SetLog>) => void, previousWorkout: SetLog | null }) => {
	return (
		<motion.div
			initial={{ height: 0, opacity: 0 }}
			animate={{ height: 'auto', opacity: 1 }}
			exit={{ height: 0, opacity: 0 }}
			transition={{ duration: 0.2, ease: 'easeOut' }}
			className="set-item-subgrid set-item"
		>
			<span>
				{props.set.set_nr}
			</span>
			<SetInput
				value={props.set.reps}
				onBlur={(val: string) => props.onBlur({ reps: val })}
				placeholder={props.previousWorkout?.reps || null}
			/>
			<SetInput
				value={props.set.weight_kg}
				onBlur={(val: string) => props.onBlur({ weight_kg: val })}
				placeholder={props.previousWorkout?.weight_kg || null}
			/>
			<span className="delete-button" onClick={props.onRemove}>
				&times;
			</span>
		</motion.div >
	)
})

const SetInput = (props: { value: string, onBlur: (val: string) => void, placeholder: string | null }) => {
	const [val, setVal] = useState<string>(props.value)
	return (
		<input
			type="tel"
			className="set-input"
			value={val}
			onChange={(e) => setVal(e.target.value)}
			onFocus={(e) => e.target.select()}
			onBlur={() => props.onBlur(val)}
			placeholder={props.placeholder || "--"}
		/>
	)
}

export default ActiveWorkoutPage
