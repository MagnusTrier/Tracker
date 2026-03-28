import "./settings.css"
import Card from "../card"
import { useData } from "../dataContext"
import { useState } from "react"
import { CustomButton } from "../generics"

const Settings = () => {
	return (
		<>
			<Card
				header="INFORMATION"
				subHeader="CONFIGURE YOUR EXPERIENCE"
			>
				<span>SEX: X MALE | O FEMALE</span>
				<span>AGE: 24</span>
				<span>HEIGHT: 180</span>

			</Card>
			<AddExercise />
		</>
	)
}

const AddExercise = () => {
	const { exercises } = useData()

	const [name, setName] = useState<string>("")

	const hasName = name.length > 0
	const nameExists = exercises.values.some(val => val.name === name)

	const handlePostExercise = async (e: React.MouseEvent, setLoading: (val: boolean) => void) => {
		e.preventDefault()
		e.stopPropagation()

		if (hasName && !nameExists) {
			setLoading(true)
			exercises.manager?.post({ name }, { minTime: 1000 })
		}
	}

	return (
		<Card
			header="ADD EXERCISE"
			subHeader="ADD A NEW EXERCISE TO YOUR CATALOGUE"
			contentStyle={{
				alignItems: "center",
				overflow: "visible"
			}}
		>
			<input
				value={name}
				onChange={(e) => setName(e.target.value)}
			/>
			<CustomButton
				text={{
					default: "ADD EXERCISE",
					disabled: !hasName ? "PROVIDE NAME" : "NAME TAKEN"
				}}
				disabled={!hasName || nameExists}
				onClick={handlePostExercise}
			/>
		</Card >
	)
}

export default Settings

