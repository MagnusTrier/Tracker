import "./settingsPage.css"
import Card from "../../card"
import { PageContainer } from "../../generics"

const SettingsPage = () => {
	return (
		<PageContainer
			style={{ padding: 10 }}
		>
			<Card
				header="SETTINGS"
				subHeader="CONFIGURE YOUR EXPERIENCE"
				hideSettings
			>
				<span>HEIGHT: 180 CM</span>
				<span>AGE: 24</span>
				<span>GENDER: MAN</span>
			</Card>
			<div
				className="manage-buttons"
			>
				<div>
					<h1 style={{ justifyContent: "center" }}>WORKOUTS</h1>
					<div>
						<span>MANAGE</span>
					</div>
				</div>
				<div>
					<h1 style={{ justifyContent: "center" }}>EXERCISES</h1>
					<div>
						<span>MANAGE</span>
					</div>
				</div>
			</div>
		</PageContainer>
	)
}

export default SettingsPage
