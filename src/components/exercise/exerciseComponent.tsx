import type { Exercise } from "../dataContext"
import { Card } from "../generics"

interface ExerciseComponentProps {
	exercise: Exercise
}

const ExerciseComponent = (props: ExerciseComponentProps) => {

	return (
		<Card
			header={props.exercise.name}
		>
			<span>Ree</span>
		</Card>
	)
}

export default ExerciseComponent
