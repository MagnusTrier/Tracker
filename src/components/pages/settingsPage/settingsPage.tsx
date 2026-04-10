import "./settingsPage.css"
import Card from "../../card"
import { CustomButton, FastInput, PageContainer } from "../../generics"
import { BicepsFlexed, ChevronRight, Dumbbell, List, X, Check, Trash2 } from "lucide-react"
import Modal from "../../modal"
import { memo, useCallback, useMemo, useState } from "react"
import { useData, type Exercise } from "../../dataContext"
import { AnimatePresence, motion } from "motion/react"
import ConfigureWorkout from "./configureWorkout/configureWorkout"

const EXERCISE_ICON = <BicepsFlexed strokeWidth="1" size="20" />

const ITEM_TRANSITION = { duration: 0.25 };
const EXIT_ANIM = { opacity: 0, scale: 0.95 };

const SettingsPage = () => {
	const { exercises } = useData()
	const [showExercisesModal, setShowExercisesModal] = useState<boolean>(false)
	const [showWorkoutsModal, setShowWorkoutsModal] = useState<boolean>(false)

	const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null)
	const [showItemModal, setShowItemModal] = useState<"edit" | "add" | null>(null)

	// const [currentWorkout, setCurrentWorkout] = useState<WorkoutExercise | null>(null)
	const [showWorkoutItemModal, setShowWorkoutItemModal] = useState<"edit" | "add" | null>(null)

	const onDeleteExercise = useCallback((id: string) => {
		exercises.manager?.delete(id)
	}, [exercises.manager])

	return (
		<PageContainer style={{ padding: 10 }}>
			<Card header="SETTINGS" subHeader="CONFIGURE YOUR EXPERIENCE" hideSettings>
				<span>HEIGHT: 180 CM</span>
				<span>AGE: 24</span>
				<span>GENDER: MAN</span>
			</Card>

			<div className="manage-buttons">
				<div onClick={() => setShowWorkoutsModal(true)}>
					<Dumbbell strokeWidth="1.5" color="var(--color-primary)" />
					<span className="title">MANAGE</span>
					<span className="title">WORKOUTS</span>
					<span className="sub-title">12 ROUTINES</span>
					<div className="bg-icon"><Dumbbell strokeWidth="1.5" color="rgb(28, 28, 34)" size="40" /></div>
				</div>
				<div onClick={() => setShowExercisesModal(true)}>
					<List strokeWidth="1.5" color="var(--color-primary)" />
					<span className="title">MANAGE</span>
					<span className="title">EXERCISES</span>
					<span className="sub-title">CUSTOM LIBRARY</span>
					<div className="bg-icon"><List strokeWidth="1.5" color="rgb(28, 28, 34)" size="40" /></div>
				</div>
			</div>

			<ListModal
				visible={showExercisesModal}
				setVisible={setShowExercisesModal}
				header="EXERCISES"
				subHeader="ADD, EDIT AND DELETE EXERCISES"
				items={exercises.values}
				icon={EXERCISE_ICON}
				onDelete={onDeleteExercise}
				onEdit={setCurrentExercise}
				showItemModal={showItemModal}
				setShowItemModal={setShowItemModal}
			>
				<ConfigureExercise
					item={currentExercise}
					onCloseClick={() => { setShowItemModal(null); setCurrentExercise(null) }}
				/>
			</ListModal>

			<ListModal
				visible={showWorkoutsModal}
				setVisible={setShowWorkoutsModal}
				header="WORKOUTS"
				subHeader="ADD, EDIT AND DELETE WORKOUTS"
				items={[]}
				icon={<Dumbbell strokeWidth="1" size="20" />}
				onDelete={() => { }}
				onEdit={() => { }}
				showItemModal={showWorkoutItemModal}
				setShowItemModal={setShowWorkoutItemModal}
			>
				<ConfigureWorkout
				/>
			</ListModal>
		</PageContainer>
	)
}
interface ListModalProps {
	visible: boolean
	setVisible: (val: boolean) => void
	header: string
	subHeader: string
	items: Exercise[]
	icon: React.ReactNode
	onDelete: (id: string) => void
	children: React.ReactNode
	onEdit: (ex: any) => void
	showItemModal: "add" | "edit" | null
	setShowItemModal: (val: "add" | "edit" | null) => void
}

const ListModal = (props: ListModalProps) => {
	const handleEdit = useCallback((ex: Exercise) => {
		props.onEdit(ex)
		props.setShowItemModal("edit")
	}, [props])

	const listHeight = useMemo(() => 77 * props.items.length, [props.items.length]);

	return (
		<Modal visible={props.visible} setVisible={props.setVisible}>
			<Card
				header={props.header}
				subHeader={props.subHeader}
				settingsLogo={<X size={20} />}
				onSettingsClick={() => props.setVisible(false)}
				contentStyle={{ alignItems: "center", maxHeight: '100dvh' }}
				onClick={(e) => { e.stopPropagation(); e.preventDefault() }}
			>
				<div className="exercises-display">
					<AnimatePresence>
						{!props.items.length && (
							<motion.div
								className="no-items"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
							>
								NO {props.header}
							</motion.div>
						)}
					</AnimatePresence>

					<motion.div
						style={{
							height: listHeight,
							transition: "height 0.3s ease",
						}}
					>
						<AnimatePresence mode="popLayout" initial={false}>
							{props.items.map((ex: any) => (
								<motion.div
									layout="position"
									key={ex.id}
									exit={EXIT_ANIM}
									transition={ITEM_TRANSITION}
								>
									<ListItem item={ex} icon={props.icon} onEdit={() => handleEdit(ex)} />
								</motion.div>
							))}
						</AnimatePresence>
					</motion.div>
				</div>
				<CustomButton
					text={{ default: "ADD " + props.header.slice(0, -1), disabled: "" }}
					onClick={() => props.setShowItemModal("add")}
				/>
			</Card>
			<Modal
				visible={props.showItemModal !== null}
				setVisible={() => { props.setShowItemModal(null); props.onEdit(null) }}
			>
				{props.children}
			</Modal>
		</Modal>
	)
}

const ListItem = memo((props: { item: Exercise, icon: React.ReactNode, onEdit: () => void }) => {
	return (
		<div className="exercise-item" onClick={props.onEdit}>
			<div className="icon action-button-primary">{props.icon}</div>
			<div className="name">
				{props.item.name.toUpperCase()}
				<span className="workout-count">NOT PART OF ANY WORKOUTS</span>
			</div>
			<ChevronRight strokeWidth="1.5" size="24" style={{ marginLeft: "auto", color: "var(--text-dim)" }} />
		</div>
	)
})

const ConfigureExercise = (props: { item: Exercise | null, onCloseClick: () => void }) => {
	const { exercises } = useData()
	const [name, setName] = useState<string>(props.item ? props.item.name : "")

	const isDuplicate = useMemo(() =>
		exercises.values.some(ex => ex.name.toLowerCase() === name.toLowerCase() && ex.id !== props.item?.id),
		[name, exercises.values, props.item]);

	const isDirty = name.length > 0 && (!props.item || props.item.name !== name) && !isDuplicate

	const handleConfirm = (e: React.MouseEvent, setLoading: (val: boolean) => void) => {
		e.preventDefault()
		e.stopPropagation()
		if (!isDirty) return;
		setLoading(true)

		if (props.item) {
			exercises.manager?.put(
				props.item.id,
				{ name },
				{
					minTime: 1000,
					onSuccess: props.onCloseClick
				}
			)
		} else {
			exercises.manager?.post(
				{ name },
				{
					minTime: 1000,
					onSuccess: props.onCloseClick
				}
			)
		}

	}

	const handleDelete = (e: React.MouseEvent, setLoading: (val: boolean) => void) => {
		e.preventDefault()
		e.stopPropagation()
		if (!props.item) return
		setLoading(true)
		exercises.manager?.delete(props.item.id, { minTime: 1000, onSuccess: props.onCloseClick })
	}

	return (
		<>
			<Card
				header={props.item ? `EDIT: ${props.item.name}` : "ADD EXERCISE"}
				subHeader={props.item ? "CHANGE EXERCISE NAME" : "ADD NEW EXERCISE"}
				settingsLogo={<X size={20} />}
				onSettingsClick={props.onCloseClick}
				onClick={(e) => { e.stopPropagation(); e.preventDefault() }}
			>
				<FastInput
					initialValue={name}
					onChange={setName}
					placeholder="E.G. SQUATS"
					style={{ color: name.length ? "var(--color-text)" : "var(--text-dim)" }}
				/>
				<div className="action-buttons">
					<CustomButton
						style={{
							"--bg-active": "radial-gradient(circle at 0% 0%, rgba(180, 180, 210, 0.8), rgba(150, 150, 180, 0.8) 30%, rgba(100, 100, 130, 0.8) 100%)",
							"--shadow": "color-mix(in srgb, rgba(130, 130, 160, 0.8), transparent 70%)",
							width: "100%",
							margin: 0
						} as React.CSSProperties}
						text={{
							default: <span style={{ display: "flex", alignItems: "center", fontSize: 16, gap: 5 }}><X strokeWidth="2.5" size="20" style={{ marginTop: 2 }} /> CANCEL</span>,
							disabled: ""
						}}
						disabled={false}
						onClick={props.onCloseClick}
					/>
					<CustomButton
						style={{
							width: "100%",
							margin: 0
						} as React.CSSProperties}
						text={{
							default: <span style={{ display: "flex", alignItems: "center", fontSize: 16, gap: 5 }}><Check strokeWidth="2.5" size="20" style={{ marginTop: 2 }} /> CONFIRM</span>,
							disabled: !isDuplicate ? "ENTER NAME" : "NAME EXISTS",
						}}
						disabled={!isDirty}
						onClick={handleConfirm}
					/>
				</div>
			</Card>
			{
				props.item &&
				<div
					style={{ marginTop: "auto", padding: 10 }}
					onClick={(e) => { e.stopPropagation(); e.preventDefault() }}
				>
					<CustomButton
						style={{
							"--bg-active": "radial-gradient(circle at 0% 0%, #ff8597, var(--color-error) 30%, #ff4763 100%)",
							"--shadow": "color-mix(in srgb, var(--color-error), transparent 70%)",
							width: "100%",
							marginTop: 0
						} as React.CSSProperties}
						text={{
							default: <span style={{ display: "flex", alignItems: "center", fontSize: 16, gap: 5 }}><Trash2 strokeWidth="2.5" size="20" style={{ marginTop: 2 }} /> DELETE EXERCISE</span>,
							disabled: ""
						}}
						disabled={false}
						onClick={handleDelete}
					/>
				</div>

			}
		</>
	)
}

export default SettingsPage
