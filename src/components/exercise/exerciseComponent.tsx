import "./exerciseComponent.css"
import { useData, type Exercise, type ExerciseSet } from "../dataContext"
import Card from "../card"
import Modal from "../modal"
import { useState } from "react"
import { CustomButton, SegmentedControl } from "../generics"
import { HiX } from "react-icons/hi"
import { format } from "date-fns"
import { AnimatePresence, motion } from "motion/react"
import { nanoid } from "nanoid"

import D3Chart from "../chart/chart"

interface ExerciseComponentProps {
	exercise: Exercise
}

const ExerciseComponent = (props: ExerciseComponentProps) => {
	const [showModal, setShowModal] = useState<boolean>(false)
	const { exercises, sets } = useData()

	const [mode, setMode] = useState<string>("STATS")

	const exerciseSets = sets.values.filter(val => val.id === props.exercise.id)
	const hasSets = exerciseSets.length > 0

	const handleDeleteExercise = async (e: React.MouseEvent, setLoading: (val: boolean) => void) => {
		e.preventDefault()
		e.stopPropagation()

		setLoading(true)
		exercises.manager?.delete(
			props.exercise.id,
			{
				minTime: 1000,
				onSuccess: () => {
					setShowModal(false)
					setLoading(false)
				}
			}
		)
	}

	return (
		<>
			<Card
				header={<span style={{ color: "var(--color-primary)", textShadow: "0 0 15px color-mix(in srgb, var(--color-primary), transparent 50%)" }}>{props.exercise.name.toUpperCase()}</span>}
				subHeader={<span>LAST WORKOUT LOGGED: {hasSets ? format(exerciseSets[0].date, "d M").toUpperCase() : "N/A"}</span>}
				onSettingsClick={() => setShowModal(true)}
				contentStyle={{ alignItems: "center" }}
			>

				<div
					className="exercise-toggle-container"
				>
					<div
						className="tab-list"
					>
						{["STATS", "WORKOUT"].map((tab) => (
							<div
								key={tab}
								className={`tab-item ${mode === tab && "active"}`}
								onClick={() => { setMode(tab) }}
							>
								<span style={{ zIndex: 2, position: "relative" }}>{tab}</span>
								{mode === tab && (
									<motion.div
										layoutId={`active-pill-${props.exercise.id}`}
										transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
										className="active-indicator"
									/>
								)}
							</div>
						))}
					</div>
				</div>
				<Modal
					visible={showModal}
					setVisible={setShowModal}
				>
					<Card
						header={`SETTINGS: ${props.exercise.name.toUpperCase()}`}
						subHeader=""
						settingsLogo={<HiX fontSize={20} />}
						onSettingsClick={() => setShowModal(false)}
						contentStyle={{ alignItems: "center" }}
					>
						<CustomButton
							text={{
								default: "DELETE EXERCISE",
								disabled: "ALREADY LOGGED"
							}}
							disabled={false}
							onClick={handleDeleteExercise}
							style={{
								"--bg-active": "radial-gradient(circle at 0% 0%, #ff8597, var(--color-error) 30%, #ff4763 100%)",
								"--shadow": "color-mix(in srgb, var(--color-error), transparent 70%)"
							} as React.CSSProperties}
						/>
					</Card>
				</Modal>

			</Card>

			<div className="exercise-variable-content-container">
				<AnimatePresence mode="popLayout" initial={false}>
					{
						mode === "STATS"
							?
							<Stats key="stats" exercise={props.exercise} />
							:
							<Workout key="workout" exercise={props.exercise} />
					}
				</AnimatePresence>
			</div>
		</>
	)
}

const Stats = (props: { exercise: Exercise }) => {
	const { sets } = useData()
	const exerciseSets = sets.values.filter(val => val.id === props.exercise.id)

	return (
		<motion.div
			initial={{ x: "-100vw", opacity: 0 }}
			animate={{ x: 0, opacity: 1 }}
			exit={{ x: "-100vw", opacity: 0 }}
			transition={{ duration: 0.4, ease: "easeInOut" }}
		>
			<Card
				header="TREND"
				hideSettings
			>
				<SegmentedControl id={`${props.exercise.id}-trend`} options={["7 D", "14 D", "30 D", "ALL"]} onChange={() => { }} />
				<D3Chart data={exerciseSets} yAccessor="weight" />
			</Card>
		</motion.div>
	)
}

interface Set {
	id: string;
	setNumber: number;
	weight: string;
	reps: string;
}

const Workout = () => {
	const [activeSets, setActiveSets] = useState<Set[]>([]);

	const addSet = () => {
		const newSet: Set = {
			id: nanoid(),
			setNumber: activeSets.length + 1,
			weight: "",
			reps: "",
		};
		setActiveSets([...activeSets, newSet]);
	};

	const removeSet = (id: string) => {
		setActiveSets((prev) => {
			const filtered = prev.filter((s) => s.id !== id);
			return filtered.map((s, index) => ({ ...s, setNumber: index + 1 }));
		});
	};

	const [counts, setCounts] = useState<number[]>([])

	return (
		<motion.div
			initial={{ x: "100vw" }}
			animate={{ x: 0 }}
			exit={{ x: "100vw" }}
			transition={{ duration: 0.4, ease: "easeInOut" }}
		>
			<Card
				header="SETS"
				hideSettings
				contentStyle={{ alignItems: "center", gap: 0 }}
			>
				<div
					className="sets-container"
				>
					<AnimatePresence initial={false}>
						{counts.map((count) => (
							<motion.div
								key={count}
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: 'auto', opacity: 1 }}
								exit={{ height: 0, opacity: 0, transition: { delay: 0.15 } }}
								transition={{ duration: 0.3, ease: 'easeInOut' }}
							>
								<motion.div
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
									}}
									initial={{
										opacity: 0,
										y: -8,
										scale: 0.98,
										filter: 'blur(4px)',
									}}
									animate={{
										opacity: 1,
										y: 0,
										scale: 1,
										filter: 'blur(0px)',
									}}
									exit={{
										opacity: 0,
										x: "-100%",
										scale: 0.98,
										filter: 'blur(4px)',
									}}
									transition={{ duration: 0.3, ease: 'easeInOut' }}
								>
									<p className='text-neutral-950 text-sm'>List Item {count}</p>
									<div
										onClick={() => setCounts(prev => prev.filter(c => c !== count))}
									>Delete</div>
								</motion.div>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
				<CustomButton
					text={{
						default: "+ ADD SET",
						disabled: ""
					}}
					disabled={false}
					onClick={() => { setCounts((prev) => prev.length > 0 ? [...prev, prev[prev.length - 1] + 1] : [1]) }}
				/>
			</Card>
		</motion.div>
	);
};

export default ExerciseComponent
