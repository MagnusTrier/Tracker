import "./configureExercise.css"
import Card, { HeaderIcon } from "../../../card"
import { AnimatedList, FastInput, CustomButton } from "../../../generics"
import { useData, type Exercise } from "../../../dataContext"
import Modal from "../../../modal"
import { motion, type Transition } from "motion/react"
import { useState } from "react"
import { Search, Pen, Trash2, CheckCheck, Plus, Webhook, Zap, Forklift, Ellipsis } from "lucide-react"


const TRANSITION: Transition = { duration: 0.3, ease: "easeInOut" }

interface ConfigureExerciseProps {
	visible: boolean
	setVisible: (val: boolean) => void
}

const ConfigureExercise = (props: ConfigureExerciseProps) => {
	const { exercises } = useData()
	const [showModify, setShowModify] = useState<boolean>(false)

	const [searchFilter, setSearchFilter] = useState<string>("")
	return (
		<Modal
			visible={props.visible}
			setVisible={showModify ? setShowModify : props.setVisible}
			wrapperStyle={{ padding: 0 }}
		>
			<motion.div
				animate={{ x: showModify ? "-100vw" : 0 }}
				style={{ padding: 10 }}
				transition={TRANSITION}
			>
				<Card
					header="MANAGE EXERCISES"
					subHeader="ADD OR EDIT EXERCISES"
					style={{ padding: 0 }}
					headerStyle={{ padding: 10, paddingBottom: 0 }}
					onSettingsClick={() => props.setVisible(false)}
					subHeaderStyle={{ paddingInline: 10 }}
					contentStyle={{ alignItems: "center", maxHeight: "100dvh", gap: 0 }}
					onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation() }}
				>
					<div className="list-input-wrapper" style={{ color: searchFilter.length > 0 ? "var(--color-primary)" : "var(--text-dim)" }}>
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
						items={exercises.values}
						component={ExerciseItem}
						emptyMessage="NO EXERCISES FOUND"
					/>
					<div style={{ padding: 15, width: "100%" }}>
						<CustomButton
							text={{
								default: <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>ADD EXERCISE <Plus /></span>,
								disabled: ""
							}}
							onClick={() => setShowModify(true)}
							style={{ marginTop: 0, width: "100%" }}
						/>
					</div>
				</Card>
			</motion.div>
			<motion.div
				animate={{ x: showModify ? 0 : "100vw" }}
				transition={TRANSITION}
				style={{ position: "absolute", inset: 0, padding: 10, x: "100vw" }}
			>
				<ModifyExercise exercise={null} />
			</motion.div>
		</Modal>
	)
}

const ExerciseItem = ({ data }: { data: Exercise }) => {
	return (
		<div>
			{data.name}
		</div>
	)
}

type Category = "PUSH" | "PULL" | "LEGS" | "OTHER"

interface ModifyExerciseProps {
	exercise: Exercise | null
}

const icons = [<Webhook />, <Zap />, <Forklift />, <Ellipsis />]

const ModifyExercise = (props: ModifyExerciseProps) => {
	const [exerciseName, setExerciseName] = useState<string>(props.exercise?.name || "")
	const [category, setCategory] = useState<Category>(props.exercise?.category || "PUSH")
	return (
		<>
			<Card
				header={props.exercise ? `EDIT: ${props.exercise.name}` : "CREATE EXERCISE"}
				subHeader={props.exercise ? "CHANGE THE PROPERTIES OF AN EXISTING EXERCISE" : "ADD A NEW EXERCISE TO YOUR LIBRARY"}

				style={{ padding: 0 }}
				headerStyle={{ padding: 10, paddingBottom: 0 }}
				subHeaderStyle={{ paddingInline: 10 }}
				contentStyle={{ alignItems: "center", maxHeight: "100dvh", marginTop: 8, gap: 10 }}
				onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation() }}
				hideSettings
			>


				<div className="list-input-wrapper" style={{ color: exerciseName.length > 0 ? "var(--color-primary)" : "var(--text-dim)", borderBottom: "1px solid var(--color-border)" }}>
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
					style={{ display: "flex", flexDirection: "column", width: "100%", paddingLeft: 10 }}
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
						onClick={() => { setExerciseName("") }}

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
							disabled: ""
						}}
						onClick={() => { }}
						style={{ marginTop: 0, width: "100%" }}
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
