import "./configureExercise.css"
import Card, { HeaderIcon } from "../../../card"
import { AnimatedList, FastInput, CustomButton, CloseModalButton } from "../../../generics"
import { useData } from "../../../dataApi/dataContext"
import { type Exercise } from "../../../dataApi/managers/ExerciseManager"
import Modal from "../../../modal"
import { AnimatePresence, motion, type Transition } from "motion/react"
import { useEffect, useState, useMemo } from "react"
import { Search, Pen, Trash2, CheckCheck, Plus, Webhook, Zap, ChevronRight, Circle, Orbit, Activity } from "lucide-react"

const TRANSITION: Transition = { duration: 0.3, ease: "easeInOut" }

const icons = [<Zap />, <Webhook />, <Activity />, <Orbit />]

type ExerciseListItem =
	| { id: string; type: "HEADER"; label: string, index: number }
	| { id: string; type: "ITEM"; data: Exercise }

interface ConfigureExerciseProps {
	visible: boolean
	setVisible: (val: boolean) => void
}

const ConfigureExercise = (props: ConfigureExerciseProps) => {
	const { exercises, workouts } = useData()

	const [showModify, setShowModify] = useState<boolean>(false)
	const [searchFilter, setSearchFilter] = useState<string>("")
	const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null)

	const handleExerciseClick = (ex: Exercise | null) => {
		setCurrentExercise(ex)
		setShowModify(true)
	}

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
		<Modal
			visible={props.visible}
			setVisible={showModify ? setShowModify : props.setVisible}
			wrapperStyle={{ padding: 0 }}
		>
			<AnimatePresence initial={false}>
				{
					!showModify ?
						<motion.div
							key="exercise-no-modify"
							initial={{ x: "-100vw", opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{ x: "-100vw", opacity: 0 }}
							style={{ padding: "0px 10px 10px 10px" }}
							transition={TRANSITION}
						>
							<Card
								header="MANAGE EXERCISES"
								subHeader="ADD OR EDIT EXERCISES"
								style={{ maxHeight: "calc(100dvh - 40px)" }}
								contentStyle={{ alignItems: "center", gap: 0 }}
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
											return (
												<div className="exercise-item clickable" onClick={() => handleExerciseClick(item.data)}>
													<div className="name-display">
														<span>{item.data.name}</span>
														<div className="name-subheader">
															<span>{item.data.category}</span>
															<Circle size="4" strokeWidth="1" fill="var(--text-dim)" />
															<span>PART OF {usageCount} WORKOUT{usageCount !== 1 ? "S" : ""}</span>
														</div>
													</div>
													<ChevronRight style={{ marginLeft: "auto" }} />
												</div>
											)
										}}
										emptyMessage="NO EXERCISES FOUND"
									/>
								</div>
								<CustomButton
									text={{
										default: <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>ADD EXERCISE <Plus /></span>,
										disabled: ""
									}}
									onClick={() => { setCurrentExercise(null); setShowModify(true) }}
									style={{ marginTop: 15, width: "100%" }}
								/>
							</Card>
						</motion.div>
						:
						<motion.div
							key="exercise-modify"
							initial={{ x: "100vw", opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{ x: "100vw", opacity: 0 }}
							transition={TRANSITION}
							style={{ position: "absolute", inset: 0, padding: "0px 10px 10px 10px", x: "100vw" }}
						>
							<ModifyExercise
								exercise={currentExercise}
								hideModify={() => setShowModify(false)}
							/>
						</motion.div>
				}
			</AnimatePresence>
		</Modal>
	)
}

type Category = "PUSH" | "PULL" | "LEGS" | "OTHER"

interface ModifyExerciseProps {
	exercise: Exercise | null
	hideModify: () => void
}


const ModifyExercise = (props: ModifyExerciseProps) => {
	const { exercises } = useData()

	const [exerciseName, setExerciseName] = useState<string>(props.exercise?.name || "")
	const [category, setCategory] = useState<Category>(props.exercise?.category || "PUSH")

	useEffect(() => {
		setExerciseName(props.exercise?.name || "")
		setCategory(props.exercise?.category || "PUSH")
	}, [props.exercise])


	const nameExists = exercises.data.some(
		(ex) => ex.name.toLowerCase() === exerciseName.toLowerCase() && ex.id !== props.exercise?.id
	);

	const disableSave = props.exercise
		? (props.exercise.name === exerciseName && props.exercise.category === category) || nameExists || exerciseName.trim().length === 0
		: exerciseName.trim().length === 0 || nameExists;

	const handleClose = (e?: React.MouseEvent) => {
		e?.preventDefault()
		e?.stopPropagation()

		props.hideModify()
		setExerciseName("")
		setCategory("PUSH")
	}

	const handleSave = async (e: React.MouseEvent, setLoading: (val: boolean) => void) => {
		e.preventDefault()
		e.stopPropagation()
		if (disableSave) return
		setLoading(true)

		if (props.exercise) {
			const dirty: Partial<Exercise> = {}
			if (exerciseName !== props.exercise.name) {
				dirty["name"] = exerciseName
			}
			if (category !== props.exercise.category) {
				dirty["category"] = category
			}

			await exercises.manager.updateCustomExercise(
				props.exercise.id,
				{ ...dirty },
			)
			handleClose()

		} else {
			await exercises.manager.createCustomExercise(exerciseName, category)
			handleClose()
		}
	}

	const handleDelete = async (e: React.MouseEvent, setLoading: (val: boolean) => void) => {
		e.stopPropagation()
		e.preventDefault()

		if (props.exercise) {
			setLoading(true)
			await exercises.manager.deleteCustomExercise(props.exercise.id)
		}
		handleClose()
	}

	return (
		<>
			<Card
				header={props.exercise ? `EDIT: ${props.exercise.name}` : "CREATE EXERCISE"}
				subHeader={props.exercise ? "CHANGE THE PROPERTIES OF THIS EXERCISE" : "ADD A NEW EXERCISE TO YOUR LIBRARY"}

				contentStyle={{ alignItems: "center", maxHeight: "100dvh", marginTop: 8, gap: 10 }}
				onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation() }}
				settingsLogo={<CloseModalButton onClick={props.hideModify} />}
			>
				<div className="list-input-wrapper" style={{ color: exerciseName.length > 0 ? "var(--color-text)" : "var(--text-dim)", borderRadius: 8 }}>
					<FastInput
						initialValue={exerciseName}
						onChange={setExerciseName}
						className="list-input"
						placeholder="E.G. PULLUPS"
					/>
					<div>
						<Pen strokeWidth="1.5" size="20" />
					</div>
				</div>
				<div
					style={{ display: "flex", flexDirection: "column", width: "100%", }}
				>
					<div
						className="header-row"
					>
						<h1>
							<HeaderIcon />
							CATEGORY
						</h1>
					</div>
					<h2>
						SELECT THE CATEGORY FOR THIS EXERCISE
					</h2>
				</div>
				<CategoryGridSelector
					category={category}
					setCategory={setCategory}
					icons={icons}
				/>
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

interface CategoryGridProps {
	category: Category;
	setCategory: (val: Category) => void;
	icons: React.ReactNode[];
}

export const CategoryGridSelector = ({ category, setCategory, icons }: CategoryGridProps) => {
	const options: Category[] = ["PUSH", "PULL", "LEGS", "OTHER"];
	const activeIndex = options.indexOf(category);
	const padding = 12
	return (
		<div className="category-wrapper">
			<motion.div
				className="active-pill"
				initial={false}
				animate={{
					x: `calc(${(activeIndex % 2) * 100}% + ${(activeIndex % 2) * (padding * 2 + 1)}px)`,
					y: `calc(${Math.floor(activeIndex / 2) * 100}% + ${Math.floor(activeIndex / 2) * (padding * 2)}px`,
				}}
				style={{ "--pill-pad": padding + "px" } as React.CSSProperties}
				transition={{ type: "spring", stiffness: 450, damping: 35 }}
			/>

			{options.map((val, index) => (
				<div
					key={val}
					className={`category-item ${category === val ? "active" : ""}`}
					onClick={() => setCategory(val)}
				>
					<div className="label-group">
						<span className="index-number">{(index + 1).toString().padStart(2, "0")}</span>
						<span className="category-name">{val}</span>
					</div>
					{icons[index]}
				</div>
			))}
		</div>
	);
};
export default ConfigureExercise
