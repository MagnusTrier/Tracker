import Navbar from "./navbar/navbar"
import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import WeightPage from "./pages/weightPage/weightPage"
import WorkoutPage from "./pages/workoutPage/workoutPage"
import SettingsPage from "./pages/settingsPage/settingsPage"

const MountAppContent = () => {
	const location = useLocation()
	return (
		<div
			className="app-container"
		>
			<Routes location={location} key={location.pathname}>
				<Route path="/weight" element={<WeightPage />} />
				<Route path="/workout" element={<WorkoutPage />} />

				<Route path="/settings" element={<SettingsPage />} />

				<Route path="/" element={<Navigate to="/weight" />} />
			</Routes>
			<Navbar />
		</div>
	)
}

export default MountAppContent
