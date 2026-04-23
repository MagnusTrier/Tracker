import Card from "../../card"
import "./workoutPage.css"
import { PageContainer, Slider } from "../../generics"
import List from "../../list/list"
import { type Workout } from "../../dataApi/managers/WorkoutManager"
import { useCallback, useState } from "react"
import { useData } from "../../dataApi/dataContext"
import { ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useSession } from "../../sessionContext"

const WorkoutPage = () => {

	const { workouts } = useData()
	const nav = useNavigate()
	const { setActiveWorkout } = useSession()

	const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)

	const handleTransform = useCallback((items: Workout[], query: string) => {
		const result: Workout[] = []

		items.forEach(wo =>
			wo.name.includes(query)
			&& result.push(wo)
		)

		return result
	}, [])

	const handleConfirmSlide = () => {
		if (selectedWorkout) {
			setActiveWorkout({ ...selectedWorkout, data: {}, timer: 0 })
			nav("/activeWorkout")
		}
	}

	return (
		<>
			<PageContainer style={{ padding: 10 }}>
				<Card
					header="START WORKOUT"
					subHeader="SELECT WORKOUT AND SLIDE TO START"
					hideSettings
				>
					<List
						items={workouts.data}
						search={{
							placeholder: "SEARCH WORKOUTS...",
							transformFn: handleTransform
						}}
						renderItem={(item) => {
							const isActive = selectedWorkout && selectedWorkout.id === item.id
							return (
								<div className="workout-item clickable" onClick={() => setSelectedWorkout(isActive ? null : item)}
									style={{ borderColor: isActive ? "var(--action-primary)" : "" }}>
									<div className="name-display">
										<span> {item.name}</span>
										<div className="name-subheader">
											<span>{item.exercises.length} EXERCISE{item.exercises.length === 1 ? "" : "S"}</span>
										</div>
									</div>
									<ChevronRight style={{ color: isActive ? "var(--text-primary)" : "", marginLeft: "auto" }} />
								</div>
							)
						}}
						emptyMessage="NO WORKOUTS FOUND"
						style={{ padding: 0 }}
					/>
					<Slider onConfirm={handleConfirmSlide} active={selectedWorkout !== null} />
				</Card>
			</PageContainer>
			<span />
		</>
	)
}

export default WorkoutPage
