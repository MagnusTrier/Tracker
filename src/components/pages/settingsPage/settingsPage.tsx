import "./settingsPage.css"
import Card from "../../card"
import { PageContainer } from "../../generics"
import { ChevronRight, Dumbbell, LogOut, BicepsFlexed, HeartPlus } from "lucide-react"
import { useState } from "react"
import ConfigureWorkout from "./configureWorkout/configureWorkout"
// import ConfigureExercise from "./configureExercise/configureExercise"
import { useSession } from "../../sessionContext"

const SettingsPage = () => {
	const [showExercisesModal, setShowExercisesModal] = useState<boolean>(false)
	const [showWorkoutsModal, setShowWorkoutsModal] = useState<boolean>(false)

	const { signOut } = useSession()

	return (
		<PageContainer style={{ padding: "0px 10px 10px 10px" }}>
			<Card
				header="BIOMETRICS"
				className="clickable"
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
					MANAGE YOUR PHYSICAL STATS FOR ACCURATE TRACKING
				</h2>
				<div className="manage-icon">
					<HeartPlus />
				</div>
				<div />
				<h2 style={{ fontSize: 13, color: "var(--color-primary)", display: "flex", alignItems: "center" }}>UPDATE METRICS <ChevronRight style={{ height: 22, width: 22 }} /></h2>
			</Card>
			<Card
				header="WORKOUTS"
				onClick={() => setShowWorkoutsModal(true)}
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
					CREATE TEMPLATES USING YOUR EXERCISE LIBRARY
				</h2>
				<div className="manage-icon">
					<Dumbbell />
				</div>
				<div />
				<h2 style={{ fontSize: 13, color: "var(--color-yellow)", display: "flex", alignItems: "center" }}>CONFIGURE WORKOUTS <ChevronRight style={{ height: 22, width: 22 }} /></h2>
			</Card>
			<Card
				header="EXERCISES"
				onClick={() => setShowExercisesModal(true)}
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
			<div
				className="logout-button clickable"
				onClick={signOut}
			>
				LOG OUT <LogOut style={{ height: 18, width: 18 }} />
			</div>


			{/* <ConfigureExercise */}
			{/* 	visible={showExercisesModal} */}
			{/* 	setVisible={setShowExercisesModal} */}
			{/* /> */}
			<ConfigureWorkout
				visible={showWorkoutsModal}
				setVisible={setShowWorkoutsModal}
			/>

		</PageContainer>
	)
}

export default SettingsPage
