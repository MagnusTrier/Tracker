import { createContext, useContext, useEffect, useState, useMemo } from "react"
import { useSession } from "../sessionContext"
import { WorkoutManager, type Workout } from "./managers/WorkoutManager"
import { WeightManager, type WeightLog } from "./managers/WeightManager"
import { ExerciseManager, type Exercise } from "./managers/ExerciseManager"



interface DataContextType {
	workouts: {
		data: Workout[]
		isLoading: boolean
		manager: WorkoutManager
	}
	weightLogs: {
		data: WeightLog[]
		isLoading: boolean
		manager: WeightManager
	}
	exercises: {
		data: Exercise[]
		isLoading: boolean
		manager: ExerciseManager
	}
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
	const { user } = useSession()

	const [workouts, setWorkouts] = useState<Workout[]>([])
	const [weightLogs, setWeightLogs] = useState<WeightLog[]>([])
	const [exercises, setExercises] = useState<Exercise[]>([])

	const [loading, setLoading] = useState({
		workouts: true,
		weightLogs: true,
		exercises: true
	})

	const setPartLoading = (key: keyof typeof loading) => (val: boolean) => {
		setLoading(prev => ({ ...prev, [key]: val }))
	}

	const managers = useMemo(() => {
		if (!user) return null
		return {
			workouts: new WorkoutManager(user.id, setPartLoading("workouts"), setWorkouts),
			weightLogs: new WeightManager(user.id, setPartLoading("weightLogs"), setWeightLogs),
			exercises: new ExerciseManager(user.id, setPartLoading("exercises"), setExercises, setWorkouts)
		}
	}, [user?.id])



	useEffect(() => {
		if (managers) {
			managers.workouts.fetchAllWorkouts()
			managers.weightLogs.fetchWeights()
			managers.exercises.fetchExercises()
		}
	}, [managers])

	if (!managers) return null

	const value = {
		workouts: { data: workouts, isLoading: loading.workouts, manager: managers.workouts },
		weightLogs: { data: weightLogs, isLoading: loading.weightLogs, manager: managers.weightLogs },
		exercises: { data: exercises, isLoading: loading.exercises, manager: managers.exercises }
	}

	return (
		<DataContext.Provider value={value}>
			{children}
		</DataContext.Provider>
	)
}

export const useData = () => {
	const context = useContext(DataContext)
	if (context === undefined) {
		throw new Error("useData must be used within DataProvider")
	}
	return context
}
