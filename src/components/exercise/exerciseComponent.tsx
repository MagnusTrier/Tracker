import { useData, type Exercise } from "../dataContext"
import Card from "../card"
import Modal from "../modal"
import { useState } from "react"
import { CustomButton } from "../generics"
import { HiX } from "react-icons/hi"

interface ExerciseComponentProps {
	exercise: Exercise
}

const ExerciseComponent = (props: ExerciseComponentProps) => {
	const [showModal, setShowModal] = useState<boolean>(false)
	const { exercises } = useData()

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
		<Card
			header={props.exercise.name.toUpperCase()}
			onSettingsClick={() => setShowModal(true)}
		>
			<span>Ree</span>
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
	)
}

export default ExerciseComponent
