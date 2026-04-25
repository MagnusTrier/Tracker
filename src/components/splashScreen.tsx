import { useEffect, useState, startTransition, lazy } from "react"
import { useSession } from "./sessionContext"
import { useData } from "./dataApi/dataContext"

const Card = lazy(() => import("./card"))
const MountAppContent = lazy(() => import("./mountAppContent"))

const SplashScreen = () => {
	const { exercises, weightLogs, workouts } = useData()
	const { user, isLoading, login } = useSession()

	const [showSplash, setShowSplash] = useState(true)
	const [isDataBooted, setIsDataBooted] = useState(false)

	const allDataLoaded = !exercises.isLoading && !weightLogs.isLoading && !workouts.isLoading
	const isReadyToShow = allDataLoaded && !isLoading

	useEffect(() => {
		if (isReadyToShow && !isDataBooted) {
			startTransition(() => {
				setIsDataBooted(true)
			})
		}
	}, [isReadyToShow, isDataBooted])

	const handleTransitionEnd = () => {
		if (isDataBooted) setShowSplash(false)
	}

	if (!user && !isLoading) return <Login onLogin={login} />

	return (
		<>
			{showSplash && (
				<div
					className="splash-screen"
					onTransitionEnd={handleTransitionEnd}
					style={{
						opacity: isDataBooted ? 0 : 1,
						transition: "opacity 500ms ease-out",
						pointerEvents: isDataBooted ? "none" : "auto"
					}}
				>
					TRACKER
				</div>
			)}

			{isDataBooted && (
				<MountAppContent />
			)}
		</>
	)
}


const Login = (props: { onLogin: () => void }) => {
	return (
		<div
			className="login"
		>
			<Card
				header="WELCOME TO TRACKER"
				subHeader="YOU NEED TO LOG IN TO PROCEED"
				style={{ width: "100%" }}
			>
				<div className="login-button clickable" onClick={props.onLogin}>
					LOG IN
				</div>
			</Card>
		</div>
	)
}

export default SplashScreen
