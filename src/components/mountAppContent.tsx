import Navbar from "./navbar/navbar"
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom"
import WeightPage from "./pages/weightPage/weightPage"
import WorkoutPage from "./pages/workoutPage/workoutPage"
import SettingsPage from "./pages/settingsPage/settingsPage"
import ActiveWorkoutPage from "./pages/activeWorkoutPage/activeWorkoutPage"
import { useSession } from "./sessionContext"
import { useEffect } from "react"
import StatusPage from "./pages/statusPage/statusPage"

const MountAppContent = () => {
	const location = useLocation()
	const { setActiveWorkout } = useSession()
	const nav = useNavigate()

	useEffect(() => {
		const activeWorkout = localStorage.getItem("active_workout")
		if (activeWorkout) {
			setActiveWorkout(JSON.parse(activeWorkout))
			nav("/activeWorkout")
		}
	}, [])

	return (
		<div
			className="app-container"
		>
			<Routes location={location} key={location.pathname}>
				<Route path="/weight" element={<WeightPage />} />
				<Route path="/workout" element={<WorkoutPage />} />
				<Route path="/status" element={<StatusPage />} />
				<Route path="/settings" element={<SettingsPage />} />
				<Route path="/activeWorkout" element={<ActiveWorkoutPage />} />

				<Route path="/" element={<Navigate to="/weight" />} />
			</Routes>
			{location.pathname !== "/activeWorkout" && <Navbar />}
		</div>
	)
}

export default MountAppContent
