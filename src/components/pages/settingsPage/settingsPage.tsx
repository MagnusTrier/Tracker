import "./settingsPage.css"
import Card from "../../card"
import { PageContainer } from "../../generics"
import { ChevronRight, Dumbbell, LogOut, HeartPlus } from "lucide-react"
// import ConfigureWorkout from "./configureWorkout/configureWorkout"
import ConfigureExercise from "./configureExercise/configureExercise"
import { useSession } from "../../sessionContext"

const SettingsPage = () => {

	const { signOut } = useSession()

	return (
		<>
			<PageContainer style={{ padding: "10px 10px 0 10px" }}>
				<Card
					header="BIOMETRICS"
					subHeader="MANAGE YOUR PHYSICAL STATS FOR ACCURATE TRACKING"
					className="clickable"
					hideSettings
				>
					<div className="manage-icon">
						<HeartPlus />
					</div>
					<div />
					<h2 style={{ fontSize: 13, color: "var(--text-primary)", display: "flex", alignItems: "center" }}>UPDATE METRICS <ChevronRight style={{ height: 22, width: 22 }} /></h2>
				</Card>
				<Card
					header="WORKOUTS"
					subHeader="CREATE TEMPLATES USING YOUR EXERCISE LIBRARY"
					className="clickable"
					style={{ marginTop: 10 }}
					hideSettings
				>
					<div className="manage-icon">
						<Dumbbell />
					</div>
					<div />
					<h2 style={{ fontSize: 13, color: "var(--status-highlight)", display: "flex", alignItems: "center" }}>CONFIGURE WORKOUTS <ChevronRight style={{ height: 22, width: 22 }} /></h2>
				</Card>

				<ConfigureExercise />
				<div
					className="logout-button clickable"
					onClick={signOut}
				>
					LOG OUT <LogOut style={{ height: 18, width: 18 }} />
				</div>


				{/* <ConfigureWorkout */}
				{/* 	visible={showWorkoutsModal} */}
				{/* 	setVisible={setShowWorkoutsModal} */}
				{/* /> */}

			</PageContainer>
			<div />
		</>
	)
}

export default SettingsPage
