import { lazy } from "react"
import { AnimatePresence } from "motion/react"
import Navbar from "./navbar/navbar"
import { Routes, Route, Navigate, useLocation } from "react-router-dom"

const WeightPage = lazy(() => import("./pages/weightPage/weightPage"))
const WorkoutPage = lazy(() => import("./pages/workoutPage/workoutPage"))
const SettingsPage = lazy(() => import("./pages/settingsPage/settingsPage"))

const MountAppContent = () => {
	const location = useLocation()
	return (
		<div
			className="app-container"
		>
			<AnimatePresence mode="wait">
				<Routes location={location} key={location.pathname}>
					<Route path="/weight" element={<WeightPage />} />
					<Route path="/workout" element={<WorkoutPage />} />

					<Route path="/settings" element={<SettingsPage />} />

					<Route path="/" element={<Navigate to="/weight" />} />
				</Routes>
			</AnimatePresence>
			<Navbar />
		</div>
	)
}

export default MountAppContent
