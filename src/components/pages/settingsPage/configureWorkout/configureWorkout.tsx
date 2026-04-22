import "./configureWorkout.css"
import Card, { HeaderIcon } from "../../../card"
import { CustomButton, FastInput, CloseModalButton, AnimatedList } from "../../../generics"
import { useState, useMemo, useEffect } from "react"
import { useData } from "../../../dataApi/dataContext"
import { type Workout } from "../../../dataApi/managers/WorkoutManager"
import { type Exercise } from "../../../dataApi/managers/ExerciseManager"
import { AnimatePresence, motion, type Transition, Reorder, useDragControls } from "motion/react"
import Modal from "../../../modal"
import { Search, ChevronRight, Plus, Pen, CheckCheck, Trash2, Zap, Webhook, Activity, Orbit, Circle, Undo, Square, SquareCheck, Grip } from "lucide-react"

const icons = [<Zap />, <Webhook />, <Activity />, <Orbit />]
const TRANSITION: Transition = { duration: 0.3, ease: "easeInOut" }
const emptyWorkout: Workout = { id: "", name: "", circuit: false, exercises: [] }


type PageState = "overview" | "modify" | "selectExercises"


interface ConfigureWorkoutProps {
	visible: boolean
	setVisible: (val: boolean) => void
}

const ConfigureWorkout = (props: ConfigureWorkoutProps) => {
	const { workouts } = useData()

	const [pageState, setPageState] = useState<PageState>("overview")
	const [previousPage, setPreviousPage] = useState<PageState>("overview")

	const [searchFilter, setSearchFilter] = useState<string>("")
	const [currentWorkout, setCurrentWorkout] = useState<Workout>(emptyWorkout)
	const [atSelectExercises, setAtSelectExercises] = useState<boolean>(false)


	useEffect(() => {
		atSelectExercises && setPageState("selectExercises")
	}, [atSelectExercises])

	const filteredWorkouts = useMemo(() => {
		if (!searchFilter.trim()) return workouts.data;

		return workouts.data.filter(workout =>
			workout.name.toLowerCase().includes(searchFilter.toLowerCase())
		);
	}, [workouts.data, searchFilter]);


	const handleGoToModify = (workout: Workout) => {
		setCurrentWorkout(workout)
		setPageState("modify")
	}

	const handleSetVisible = () => {
		switch (pageState) {
			case "overview":
				props.setVisible(false)
				return
			case "modify":
				setPageState("overview")
				return
			case "selectExercises":
				setPageState("modify")
				return
		}
	}

	const updateCurrentWorkout = (val: Partial<Workout>) => {
		setCurrentWorkout(prev => {
			return { ...prev, ...val }
		})
	}


	return (
		<Modal
			visible={props.visible}
			onOverlayClick={handleSetVisible}
			page={0}
			direction={0}
		>
			<AnimatePresence initial={false}>
				{
					pageState === "overview" &&
					<motion.div
						key="workout-no-modify"
						initial={{ x: "-100vw", opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: "-100vw", opacity: 0 }}
						style={{ padding: "0px 10px 10px 10px" }}
						transition={TRANSITION}
						onAnimationComplete={() => setPreviousPage("overview")}
					>
						<Card
							header="MANAGE WORKOUTS"
							subHeader="ADD OR EDIT WORKOUTS"
							style={{ maxHeight: "calc(100dvh - 40px)" }}
							contentStyle={{ alignItems: "center", gap: 0, marginTop: 8 }}
							onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation() }}
							settingsLogo={<CloseModalButton onClick={() => props.setVisible(false)} />}
						>

							<div
								style={{
									alignItems: "center",
									gap: 0,
									flex: "0 1 auto",
									overflow: "hidden",
									borderRadius: 8,
									width: "100%",
									display: "flex",
									flexDirection: "column",
									minHeight: 0,
								}}
							>
								<div className="list-input-wrapper" style={{ color: searchFilter.length > 0 ? "var(--color-text)" : "var(--text-dim)", borderBottom: "1px solid var(--color-border)" }}>
									<FastInput
										initialValue={searchFilter}
										onChange={setSearchFilter}
										className="list-input"
										placeholder="SEARCH WORKOUTS..."
									/>
									<div>
										<Search strokeWidth="1.5" size="20" />
									</div>
								</div>
								<AnimatedList
									items={filteredWorkouts}
									renderItem={(item) => {
										return (
											<div className="exercise-item clickable" onClick={() => handleGoToModify(item)}>
												{item.name}
												<ChevronRight style={{ marginLeft: "auto" }} />
											</div>
										)
									}}
									emptyMessage="NO WORKOUTS FOUND"
								/>
							</div>
							<CustomButton
								text={{
									default: <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>ADD WORKOUT <Plus /></span>,
									disabled: ""
								}}
								onClick={() => handleGoToModify(emptyWorkout)}
								style={{ marginTop: 15, width: "100%" }}
							/>
						</Card>
					</motion.div>
				}
				{
					pageState === "modify" &&
					<motion.div
						key="workout-modify"
						initial={{ x: previousPage === "overview" ? "100vw" : "-100vw", opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: atSelectExercises ? "-100vw" : "100vw", opacity: 0 }}
						transition={TRANSITION}
						style={{ position: "absolute", inset: 0, padding: "0px 10px 10px 10px", x: "100vw" }}
						onAnimationComplete={() => { setPreviousPage("modify") }}
					>
						<ModifyWorkout
							workout={currentWorkout}
							updateWorkout={updateCurrentWorkout}
							hideModify={() => setPageState("overview")}
							goToSelectExercises={setAtSelectExercises}

						/>
					</motion.div>
				}

				{
					pageState === "selectExercises" &&
					<motion.div
						key="workout-select-exercises"
						initial={{ x: "100vw", opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: "100vw", opacity: 0 }}
						transition={TRANSITION}
						style={{ position: "absolute", inset: 0, padding: "0px 10px 10px 10px", x: "100vw" }}
						onAnimationComplete={() => { setPreviousPage("selectExercises"); setAtSelectExercises(false) }}
					>
						<SelectExercises
							hide={() => setPageState("modify")}
							selectedExercises={currentWorkout.exercises}
							onConfirm={(ex) => updateCurrentWorkout({ exercises: ex })}
						/>
					</motion.div>
				}
			</AnimatePresence>
		</Modal>
	)
}

interface ModifyWorkoutProps {
	workout: Workout
	updateWorkout: (val: Partial<Workout>) => void
	hideModify: () => void
	goToSelectExercises: (val: boolean) => void
}

const ModifyWorkout = (props: ModifyWorkoutProps) => {
	const { workouts } = useData()

	const [workoutName, setWorkoutName] = useState<string>(props.workout?.name || "")
	const [isCircuit, setIsCircuit] = useState<boolean>(props.workout?.circuit || false)

	const [localExercises, setLocalExercises] = useState(props.workout.exercises)

	const nameExists = workouts.data.some(
		(wo) => wo.name.toLowerCase() === workoutName.toLowerCase()
	) || workoutName.length === 0

	const originalWorkout = workouts.data.find(w => w.id === props.workout.id)

	const nameChanged = workoutName !== originalWorkout?.name
	const circuitChanged = isCircuit !== originalWorkout?.circuit

	const areIdentical = (arr1: any, arr2: any) => {
		return arr1.length === arr2.length &&
			arr1.every((ex: any, index: any) => ex === arr2[index]);
	};

	const exercisesChanged = !areIdentical(props.workout.exercises, originalWorkout?.exercises)

	const isDirty = props.workout && !nameExists && (nameChanged || circuitChanged || exercisesChanged)

	const disableSave = !isDirty || props.workout.exercises.length === 0

	const handleSave = async (e: React.MouseEvent, _: (val: boolean) => void) => {
		e.preventDefault()
		e.stopPropagation()
		if (disableSave) return
		// setLoading(true)
		//
		// const workoutPayload = { name: workoutName, circuit: isCircuit };
		//
		// if (props.workout?.id) {
		// 	await workouts.manager?.put(props.workout.id, workoutPayload, {
		// 		onSuccess: async () => {
		// 			await workoutExercises.manager?.delete({ workout_id: props.workout!.id });
		// 			const exercisesToInsert = localSelectedExercises.map((ex, index) => ({
		// 				workout_id: props.workout!.id,
		// 				exercise_id: ex.id,
		// 				sequence_order: index
		// 			}));
		//
		// 			await workoutExercises.manager?.post(exercisesToInsert, {
		// 				onSuccess: () => {
		// 					setLoading(false);
		// 					props.hideModify();
		// 				}
		// 			}, false);
		// 		}
		// 	});
		// } else {
		// 	await workouts.manager?.post(workoutPayload, {
		// 		onSuccess: async (newWorkout) => {
		// 			const workoutId = Array.isArray(newWorkout) ? newWorkout[0].id : newWorkout.id;
		//
		// 			const exercisesToInsert = localSelectedExercises.map((ex, index) => ({
		// 				workout_id: workoutId,
		// 				exercise_id: ex.id,
		// 				sequence_order: index
		// 			}));
		//
		// 			await workoutExercises.manager?.post(exercisesToInsert, {
		// 				onSuccess: () => {
		// 					setLoading(false); // Clear loading
		// 					props.hideModify(); // Close the screen
		// 				},
		// 				onError: (err) => {
		// 					console.error("Exercises failed", err);
		// 					setLoading(false);
		// 				}
		// 			}, false);
		// 		},
		// 		onError: (err) => {
		// 			console.error("Workout failed", err);
		// 			setLoading(false);
		// 		}
		// 	});
		// }
	}

	const handleDelete = async (e: React.MouseEvent, _: (val: boolean) => void) => {
		e.stopPropagation();
		e.preventDefault();

		if (!props.workout?.id) return;
		//
		// // Confirm with the user first
		// if (!window.confirm("Are you sure you want to delete this workout? This will remove all associated exercise data.")) return;
		//
		// setLoading(true);
		//
		// await workouts.manager?.delete(props.workout.id, {
		// 	minTime: 500,
		// 	onSuccess: () => {
		// 		props.hideModify(); // Return to the list view
		// 		setLoading(false)
		// 	},
		// 	onError: (err) => {
		// 		console.error("Delete failed:", err);
		// 		setLoading(false);
		// 	}
		// });
	};


	return (
		<>
			<Card
				header={props.workout ? `EDIT: ${props.workout.name}` : "CREATE WORKOUT"}
				subHeader={props.workout ? "CHANGE THE PROPERTIES OF THIS WORKOUT" : "ADD A NEW WORKOUT TO YOUR LIBRARY"}

				style={{ maxHeight: "calc(100dvh - 40px)" }}
				contentStyle={{ alignItems: "center", maxHeight: "100dvh", marginTop: 8, gap: 10 }}
				onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation() }}
				settingsLogo={<CloseModalButton onClick={props.hideModify} />}
			>
				<div className="list-input-wrapper" style={{ color: workoutName.length > 0 ? "var(--color-text)" : "var(--text-dim)", borderRadius: 8 }}>
					<FastInput
						initialValue={workoutName}
						onChange={setWorkoutName}
						className="list-input"
						placeholder="E.G. PUSH A"
						onBlur={() => props.updateWorkout({ name: workoutName })}
					/>
					<div>
						<Pen strokeWidth="1.5" size="20" />
					</div>
				</div>

				<div
					style={{ display: "flex", flexDirection: "column", width: "100%" }}
				>
					<div
						className="header-row"
					>
						<h1>
							<HeaderIcon />
							CIRCUIT MODE
						</h1>
					</div>
					<h2>
						PUTS EXERCISES IN A LOOP DURING WORKOUT
					</h2>
				</div>
				<GradientToggle
					enabled={isCircuit}
					onChange={setIsCircuit}
				/>

				<div
					style={{ display: "flex", flexDirection: "column", width: "100%" }}
				>
					<div
						className="header-row"
					>
						<h1>
							<HeaderIcon />
							EXERCISES ({props.workout.exercises.length})
						</h1>
					</div>
					<h2>
						SELECT AND REORDER EXERCISES FOR THIS WORKOUT
					</h2>
				</div>
				<div
					className="selected-exercises-display"
				>
					{localExercises.length > 0 &&
						<ScrollableReorderList
							items={localExercises}
							setItems={setLocalExercises}
							onPointerUp={() => props.updateWorkout({ exercises: localExercises })}
						/>

					}
					<div className="add-exercise-button clickable" onClick={() => props.goToSelectExercises(true)}>ADD EXERCISE <Plus style={{ height: 22, width: 22, strokeWidth: 2 }} /></div>
				</div>
				<div
					className="modify-exercise-buttons"
				>
					<CustomButton
						text={{
							default: <span style={{ display: "flex", alignItems: "center", gap: 5 }}>DELETE <Trash2 /></span>,
							disabled: ""
						}}
						onClick={handleDelete}
						style={{
							"--bg-active": "radial-gradient(circle at 0% 0%, #ff8597, var(--color-error) 30%, #ff4763 100%)",
							"--shadow": "color-mix(in srgb, var(--color-error), transparent 70%)",
							width: "100%",
							marginTop: 0,
						} as React.CSSProperties}
					/>
					<CustomButton
						text={{
							default: <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>SAVE <CheckCheck /></span>,
							disabled: <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>SAVE <CheckCheck /></span>,
						}}
						onClick={handleSave}
						style={{ marginTop: 0, width: "100%" }}
						disabled={disableSave}
					/>
				</div>
			</Card>

		</>
	)
}


export const ScrollableReorderList = ({ items, setItems, onPointerUp }: { items: any, setItems: any, onPointerUp: () => void }) => {
	return (
		<div className="scroll-container">
			<Reorder.Group
				axis="y"
				values={items}
				onReorder={setItems}
				className="reorder-group"
			>
				{items.map((item: Exercise, index: number) => (
					<ReorderItem key={item.id} item={item} index={index + 1} onPointerUp={onPointerUp} />
				))}
			</Reorder.Group>
		</div>
	)
}

const categories = ["PUSH", "PULL", "LEGS", "OTHER"]

const ReorderItem = (props: { item: Exercise, index: number, onPointerUp: () => void }) => {
	const controls = useDragControls()


	return (
		<Reorder.Item
			value={props.item}
			dragListener={false}
			dragControls={controls}
			className="reorder-item"
			onPointerUp={props.onPointerUp}
		>
			<div className="item-content">
				<span className="index-display">{props.index}) </span>
				<div className="name-display">
					<span>{props.item.name}</span>
					<span className="name-subheader">
						{icons[categories.indexOf(props.item.category)]}
						<Circle size="4" strokeWidth="1" fill="var(--text-dim)" />
						{props.item.category}
					</span>
				</div>
				<div
					className="drag-handle"
					onPointerDown={(e) => controls.start(e)}
				>
					<Grip size={20} />
				</div>
			</div>
		</Reorder.Item>
	)
}

import React from 'react';

interface ToggleProps {
	enabled: boolean;
	onChange: (val: boolean) => void;
}

export const GradientToggle = ({ enabled, onChange }: ToggleProps) => {
	return (
		<label className="toggle-container">
			<div className={`toggle-track ${enabled ? 'active' : ''}`} onClick={() => onChange(!enabled)}>
				<div className="toggle-thumb" />
			</div>
		</label>
	);
};

type ExerciseListItem =
	| { id: string; type: "HEADER"; label: string, index: number }
	| { id: string; type: "ITEM"; data: Exercise }


const SelectExercises = (props: { hide: () => void, selectedExercises: Exercise[], onConfirm: (val: Exercise[]) => void }) => {
	const { exercises, workouts } = useData()

	const [searchFilter, setSearchFilter] = useState<string>("")

	const [localSelectedExercises, setLocalSelectedExercises] = useState<Exercise[]>(props.selectedExercises)

	const allowConfirm = localSelectedExercises !== props.selectedExercises

	const displayItems = useMemo(() => {
		const categories = ["PUSH", "PULL", "LEGS", "OTHER"]
		const result: ExerciseListItem[] = []

		categories.forEach((cat, index) => {
			const matches = exercises.data.filter(ex =>
				ex.category === cat &&
				ex.name.includes(searchFilter)
			)

			if (matches.length > 0) {
				result.push({ id: `header-${cat}`, type: "HEADER", label: cat, index })
				matches.forEach(ex => {
					result.push({ id: ex.id, type: "ITEM", data: ex })
				})
			}
		})

		return result
	}, [exercises.data, searchFilter])

	const exerciseUsageCounts = useMemo(() => {
		const counts: Record<string, number> = {};

		workouts.data.forEach((workout) => {
			workout.exercises.forEach((ex) => {
				counts[ex.id] = (counts[ex.id] || 0) + 1;
			});
		});

		return counts;
	}, [workouts.data]);

	return (
		<Card
			header={"SELECT EXERCISES (" + localSelectedExercises.length + ")"}
			subHeader="SELECT OR DESELECT EXERCISES FOR YOUR WORKOUT"
			style={{ maxHeight: "calc(100dvh - 40px)" }}
			contentStyle={{ alignItems: "center", gap: 0 }}
			onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation() }}
			hideSettings
		>
			<div
				style={{
					alignItems: "center",
					gap: 0,
					flex: "0 1 auto",
					overflow: "hidden",
					borderRadius: 8,
					width: "100%",
					display: "flex",
					flexDirection: "column",
					minHeight: 0,
				}}
			>
				<div className="list-input-wrapper" style={{ color: searchFilter.length > 0 ? "var(--color-text)" : "var(--text-dim)", borderBottom: "1px solid var(--color-border)" }}>
					<FastInput
						initialValue={searchFilter}
						onChange={setSearchFilter}
						className="list-input"
						placeholder="SEARCH EXERCISES..."
					/>
					<div>
						<Search strokeWidth="1.5" size="20" />
					</div>
				</div>
				<AnimatedList
					items={displayItems}
					itemHeight={55}
					renderItem={(item) => {
						if (item.type === "HEADER") {
							return (
								<div className="exercise-category-divider">
									{icons[item.index]}
									{item.label}
								</div>
							)
						}

						const usageCount = exerciseUsageCounts[item.data.id] || 0
						const isSelected = localSelectedExercises.includes(item.data)
						return (
							<div
								className="exercise-item clickable"
								onClick={() => {
									isSelected ? setLocalSelectedExercises(prev => prev.filter(i => i !== item.data)) : setLocalSelectedExercises(prev => [...prev, item.data])
								}}>
								<div className="name-display">
									<span>{item.data.name}</span>
									<div className="name-subheader">
										<span>{item.data.category}</span>
										<Circle size="4" strokeWidth="1" fill="var(--text-dim)" />
										<span>PART OF {usageCount} WORKOUT{usageCount !== 1 ? "S" : ""}</span>
									</div>
								</div>
								{
									isSelected
										? <SquareCheck style={{ marginLeft: "auto", color: "var(--color-primary)" }} />
										: <Square style={{ marginLeft: "auto" }} />
								}
							</div>
						)
					}}
					emptyMessage="NO EXERCISES FOUND"
				/>
			</div>
			<div
				className="modify-exercise-buttons"
				style={{ marginTop: 10 }}
			>
				<CustomButton
					text={{
						default: <span style={{ display: "flex", alignItems: "center", gap: 5 }}>CANCEL <Undo /></span>,
						disabled: ""
					}}
					onClick={props.hide}
					style={{

						"--bg-active": "radial-gradient(circle at 0% 0%, #848498, #71718a 30%, #3f3f50 100%)",
						"--shadow": "color-mix(in srgb, #717171a, transparent 70%)",
						width: "100%",
						marginTop: 0,
					} as React.CSSProperties}
				/>
				<CustomButton
					text={{
						default: <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>CONFIRM <CheckCheck /></span>,
						disabled: <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>CONFIRM <CheckCheck /></span>,
					}}
					onClick={() => allowConfirm && props.onConfirm(localSelectedExercises)}
					style={{ marginTop: 0, width: "100%" }}
					disabled={!allowConfirm}
				/>
			</div>
		</Card>
	)
}


export default ConfigureWorkout
