import Card from "../../card"
import { CustomButton } from "../../generics"
import "./workoutPage.css"
import { PageContainer } from "../../generics"

const WorkoutPage = () => {
	return (
		<PageContainer
			style={{ padding: 10 }}
		>

			<Card
				header="WORKOUT"
				subHeader="MANAGE WORKOUTS AND EXERCISES"
				hideSettings
				contentStyle={{ flexShrink: 1, alignItems: "center" }}
			>
				<div
					className="workouts-display"
				>
					{
						["push", "pull", "pull", "legs", "pull", "legs", "legs", "push b", "pull b", "pull c", "pull", "legs", "push b", "pull b", "pull c", "pull", "legs", "push b", "pull b", "pull c"].map((item) => (
							<div>{item}</div>
						))
					}
				</div>
				<CustomButton
					text={{
						default: "START WORKOUT",
						disabled: "SELECT WORKOUT"
					}}
					disabled={false}
					onClick={() => { }}
				/>
			</Card>
		</PageContainer>
	)
}

export default WorkoutPage
