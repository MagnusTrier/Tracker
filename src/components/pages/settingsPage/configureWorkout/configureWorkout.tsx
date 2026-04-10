import "./configureWorkout.css"
import Card from "../../../card"
import { X, CheckCheck, Trash2 } from "lucide-react"
import { CustomButton, FastInput } from "../../../generics"
import { useState } from "react"

interface ConfigureWorkoutProps {

}

const ConfigureWorkout = (_: ConfigureWorkoutProps) => {
	const [workoutName, setWorkoutName] = useState<string>("")
	return (
		<>
			<Card
				header="WORKOUT DETAILS"
				subHeader="DEFINE YOUR WORKOUT ROUTINE"
				settingsLogo={
					<div style={{
						height: 35,
						aspectRatio: 1,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						borderRadius: 10,
						position: "absolute",
						right: 12,
						top: 12,
						border: "1px solid rgba(20, 20, 24, 0.8)",
						color: "var(--color-primary)"
					}}
					>
						<X size="20" />

					</div>
				}
				onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation() }}
				contentStyle={{ marginTop: 10 }}
			>
				<FastInput
					initialValue={workoutName}
					onChange={setWorkoutName}
					placeholder="E.G. PUSH A"
				/>
			</Card>
			<Card
				header="EXERCISES"
				subHeader="ADD AND ORDER EXERCISES"
				style={{ marginTop: 10 }}
				contentStyle={{ marginTop: 10 }}
				onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation() }}
				hideSettings
			>
			</Card>
			<div
				className="configure-workout-action-buttons"
			>
				<CustomButton
					text={{
						default: <span style={{ display: "flex", alignItems: "center", gap: 5 }}>DELETE <Trash2 /></span>,
						disabled: ""
					}}
					onClick={() => { }}

					style={{
						"--bg-active": "radial-gradient(circle at 0% 0%, #ff8597, var(--color-error) 30%, #ff4763 100%)",
						"--shadow": "color-mix(in srgb, var(--color-error), transparent 70%)",
						width: "100%",
						marginTop: 10,
					} as React.CSSProperties}
				/>

				<CustomButton
					text={{
						default: <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>SAVE <CheckCheck /></span>,
						disabled: ""
					}}
					onClick={() => { }}
					style={{ marginTop: 10, width: "100%" }}
				/>
			</div>

		</>
	)
}

export default ConfigureWorkout
