import "./configureExercise.css"
import Card, { Header } from "../../../card"
import { CustomButton, CloseModalButton } from "../../../generics"
import { useData } from "../../../dataApi/dataContext"
import { type Exercise } from "../../../dataApi/managers/ExerciseManager"
import Modal from "../../../modal"
import { motion } from "motion/react"
import { useState, useMemo, useCallback } from "react"
import { BicepsFlexed, Trash2, CheckCheck, Plus, Webhook, Zap, ChevronRight, Circle, Orbit, Activity } from "lucide-react"
import List, { ListInput } from "../../../list/list"

const CATEGORIES: Exercise["category"][] = ["PUSH", "PULL", "LEGS", "OTHER"];
const ICONS = [<Zap />, <Webhook />, <Activity />, <Orbit />]
const emptyExercise: Exercise = { id: "", name: "", category: "PUSH", created_at: new Date() }

type ExerciseListItem =
	| { id: string; type: "HEADER"; label: string, index: number }
	| { id: string; type: "ITEM"; data: Exercise }

const ConfigureExercise = () => {
	const [showModal, setShowModal] = useState<boolean>(false)

	const [currentExercise, setCurrentExercise] = useState<Exercise>(emptyExercise)

	const [[page, direction], setPage] = useState<[number, number]>([0, 0])
	const paginate = (newDirection: number) => {
		setPage([page + newDirection, newDirection])
	}

	const renderContent = () => {
		switch (page) {
			case 0:
				return (
					<ExercisesDisplay
						paginate={paginate}
						hide={() => setShowModal(false)}
						setCurrentExercise={setCurrentExercise}
					/>
				)
			case 1:
				return (
					<ModifyExercise
						exercise={currentExercise}
						hide={() => paginate(-1)}
					/>
				)
			default:
				return null
		}
	}

	const handleOverlayClick = () => {
		if (page === 0) {
			paginate(0)
			setShowModal(false)
		} else {
			paginate(-1)
		}
	}


	return (
		<>
			<Card
				header="EXERCISES"
				onClick={() => setShowModal(true)}
				className="clickable"
				style={{ marginTop: 10 }}
				contentStyle={{
					marginTop: 0,
					display: "grid",
					gridTemplateColumns: "2fr 1fr",
					gap: 10,
				}}
				hideSettings
			>
				<h2
					className="manage-button-description"
				>
					THE FOUNDATION FOR TRACKING YOUR PROGRESSION
				</h2>
				<div className="manage-icon">
					<BicepsFlexed />
				</div>
				<div />
				<h2 style={{ fontSize: 13, color: "var(--color-primary)", display: "flex", alignItems: "center" }}>VIEW EXERCISE LIBRARY <ChevronRight style={{ height: 22, width: 22 }} /></h2>
			</Card>
			<Modal
				visible={showModal}
				onOverlayClick={handleOverlayClick}
				page={page}
				direction={direction}
			>
				{renderContent()}
			</Modal>
		</>
	)
}


const ExercisesDisplay = (props: { paginate: (val: number) => void, hide: () => void, setCurrentExercise: (val: Exercise) => void }) => {

	const { exercises, workouts } = useData()

	const exerciseUsageCounts = useMemo(() => {
		const counts: Record<string, number> = {};

		workouts.data.forEach((workout) => {
			workout.exercises.forEach((ex) => {
				counts[ex.id] = (counts[ex.id] || 0) + 1;
			});
		});

		return counts;
	}, [workouts.data]);


	const handleExerciseClick = (ex: Exercise) => {
		props.setCurrentExercise(ex)
		props.paginate(1)
	}

	const handleTransform = useCallback((items: Exercise[], query: string) => {
		const result: ExerciseListItem[] = []

		CATEGORIES.forEach((cat, index) => {
			const matches = items.filter(ex =>
				ex.category === cat &&
				ex.name.includes(query)
			)

			if (matches.length > 0) {
				result.push({ id: `header-${cat}`, type: "HEADER", label: cat, index })
				matches.forEach(ex => {
					result.push({ id: ex.id, type: "ITEM", data: ex })
				})
			}
		})

		return result
	}, [])

	return (
		<Card
			header="MANAGE EXERCISES"
			subHeader="ADD OR EDIT EXERCISES"
			settingsLogo={
				<CloseModalButton
					onClick={props.hide}
				/>
			}
		>
			<List<Exercise, ExerciseListItem>
				items={exercises.data}
				search={{
					placeholder: "SEARCH EXERCISES...",
					transformFn: handleTransform
				}}
				renderItem={(item) => {
					if (item.type === "HEADER") {
						return (
							<div className="exercise-category-divider">
								{ICONS[item.index]}
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
			<CustomButton
				text={{ default: <>ADD EXERCISE <Plus /></> }}
				onClick={() => handleExerciseClick(emptyExercise)}
				style={{ marginTop: 12, width: "100%" }}
			/>
		</Card >
	)
}

interface ModifyExerciseProps {
	exercise: Exercise
	hide: () => void
}

const ModifyExercise = (props: ModifyExerciseProps) => {
	const { exercises } = useData()

	const [exerciseName, setExerciseName] = useState<string>(props.exercise.name)
	const [category, setCategory] = useState<Exercise["category"]>(props.exercise.category)

	const nameExists = exercises.data.some(
		(ex) => ex.name.toLowerCase() === exerciseName.toLowerCase() && ex.id !== props.exercise?.id
	);

	const disableSave = (props.exercise.name === exerciseName && props.exercise.category === category) || nameExists || exerciseName.trim().length === 0

	const handleSave = async (e: React.MouseEvent, setLoading: (val: boolean) => void) => {
		e.preventDefault()
		e.stopPropagation()
		if (disableSave) return
		setLoading(true)

		if (props.exercise.id.length > 0) {
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
		} else {
			await exercises.manager.createCustomExercise(exerciseName, category)
		}
		props.hide()
	}

	const handleDelete = async (e: React.MouseEvent, setLoading: (val: boolean) => void) => {
		e.stopPropagation()
		e.preventDefault()

		if (props.exercise) {
			setLoading(true)
			await exercises.manager.deleteCustomExercise(props.exercise.id)
		}
		props.hide()
	}

	return (
		<Card
			header={props.exercise ? `EDIT: ${props.exercise.name}` : "CREATE EXERCISE"}
			subHeader={props.exercise ? "CHANGE THE PROPERTIES OF THIS EXERCISE" : "ADD A NEW EXERCISE TO YOUR LIBRARY"}
			contentStyle={{ gap: 10 }}
			settingsLogo={<CloseModalButton onClick={props.hide} />}
		>
			<ListInput
				placeholder="E.G. PULLUPS"
				value={exerciseName}
				onChange={setExerciseName}
				style={{ border: "none", backgroundColor: "var(--color-bg)", borderRadius: 8 }}
			/>
			<Header header="CATEGORY" subHeader="SELECT THE CATEGORY FOR THIS EXERCISE" />
			<CategoryGridSelector
				category={category}
				setCategory={setCategory}
			/>
			<div
				className="modify-exercise-buttons"
			>
				<CustomButton
					text={{ default: <>DELETE <Trash2 /></> }}
					onClick={handleDelete}
					style={{ width: "100%" }}
					theme="error"
				/>
				<CustomButton
					text={{ default: <>SAVE <CheckCheck /></> }}
					onClick={handleSave}
					style={{ width: "100%" }}
					disabled={disableSave}
				/>
			</div>
		</Card>
	)
}

interface CategoryGridProps {
	category: Exercise["category"];
	setCategory: (val: Exercise["category"]) => void;
}

const CategoryGridSelector = ({ category, setCategory }: CategoryGridProps) => {
	const activeIndex = CATEGORIES.indexOf(category);
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

			{CATEGORIES.map((val, index) => (
				<div
					key={val}
					className={`category-item ${category === val && "active"}`}
					onClick={() => setCategory(val)}
				>
					<div className="label-group">
						<span className="index-number">{(index + 1).toString().padStart(2, "0")}</span>
						<span className="category-name">{val}</span>
					</div>
					{ICONS[index]}
				</div>
			))}
		</div>
	);
};
export default ConfigureExercise
