import { createContext, useContext, useEffect, useState, useMemo } from "react"
import { supabase } from "../lib/supabase"
import { useSession } from "./sessionContext.tsx"
import { parseISO } from "date-fns"

export interface Exercise {
	id: string
	name: string
	category: "PUSH" | "PULL" | "LEGS"
}

export interface WeightLog {
	id: string
	created_at: Date
	weight: number
	date: Date
}

export interface Workout {
	id: string
	name: string
	created_at: Date
}

export interface WorkoutExercise {
	id: string
	workout_id: string
	exercise_id: string
	sequence_order: number
}

export interface WorkoutLog {
	id: string
	workout_id: string
	started_at: Date
	completed_at: Date | null
	notes: string | null
}

export interface ExerciseLog {
	id: string
	workout_log_id: string
	exercise_id: string
	weight_kg: number
	reps: number
	sets: number
	created_at: Date
}

interface Data<T extends { id?: string }> {
	values: T[]
	isLoading: boolean
	manager: DataManager<T> | undefined
}

interface DataContextType {
	exercises: Data<Exercise>
	weightLogs: Data<WeightLog>
	workouts: Data<Workout>
	workoutExercises: Data<WorkoutExercise>
	workoutLogs: Data<WorkoutLog>
	exerciseLogs: Data<ExerciseLog>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
	const { user } = useSession()

	const [exercises, setExercises] = useState<Exercise[]>([])
	const [exercisesLoading, setExercisesLoading] = useState<boolean>(true)

	const [workouts, setWorkouts] = useState<Workout[]>([])
	const [workoutsLoading, setWorkoutsLoading] = useState<boolean>(true)

	const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([])
	const [workoutExercisesLoading, setWorkoutExercisesLoading] = useState<boolean>(true)

	const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([])
	const [workoutLogsLoading, setWorkoutLogsLoading] = useState<boolean>(true)

	const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([])
	const [exerciseLogsLoading, setExerciseLogsLoading] = useState<boolean>(true)

	const [weightLogs, setWeightLogs] = useState<WeightLog[]>([])
	const [weightLogsLoading, setWeightLogsLoading] = useState<boolean>(true)

	const managers = useMemo(() => (user ? {
		exercises: new DataManager<Exercise>("exercises", user.id, setExercises, setExercisesLoading),
		workouts: new DataManager<Workout>("workouts", user.id, setWorkouts, setWorkoutsLoading),
		workoutExercises: new DataManager<WorkoutExercise>("workout_exercises", user.id, setWorkoutExercises, setWorkoutExercisesLoading, ["created_at"], "sequence_order"),
		workoutLogs: new DataManager<WorkoutLog>("workout_logs", user.id, setWorkoutLogs, setWorkoutLogsLoading, ["started_at", "completed_at"], "started_at"),
		exerciseLogs: new DataManager<ExerciseLog>("exercise_logs", user.id, setExerciseLogs, setExerciseLogsLoading, [], null),
		weightLogs: new DataManager<WeightLog>("weight_logs", user.id, setWeightLogs, setWeightLogsLoading, ["created_at", "date"], "date")
	} : null), [user?.id])

	useEffect(() => {
		if (managers) {
			managers.exercises.fetch()
			managers.workouts.fetch()
			managers.workoutExercises.fetch()
			managers.workoutLogs.fetch()
			managers.exerciseLogs.fetch()
			managers.weightLogs.fetch()
		}
	}, [managers])

	return (
		<DataContext.Provider value={{
			exercises: { values: exercises, isLoading: exercisesLoading, manager: managers?.exercises },
			workouts: { values: workouts, isLoading: workoutsLoading, manager: managers?.workouts },
			workoutExercises: { values: workoutExercises, isLoading: workoutExercisesLoading, manager: managers?.workoutExercises },
			workoutLogs: { values: workoutLogs, isLoading: workoutLogsLoading, manager: managers?.workoutLogs },
			exerciseLogs: { values: exerciseLogs, isLoading: exerciseLogsLoading, manager: managers?.exerciseLogs },
			weightLogs: { values: weightLogs, isLoading: weightLogsLoading, manager: managers?.weightLogs }
		}}>
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

// --- DataManager Class ---

interface ManagerOptions<T> {
	onSuccess?: (data: T | T[]) => void
	onError?: (error: any) => void
	minTime?: number
}

class DataManager<T extends { id?: string }> {
	public data: T[] = []
	private table: string
	private userId: string
	private setter: (data: T[]) => void
	private setLoading: (val: boolean) => void
	private dateKeys: string[]
	private column: string | null

	constructor(
		table: string,
		userId: string,
		setter: (data: T[]) => void,
		setLoading: (val: boolean) => void,
		dateKeys: string[] = ["created_at"],
		column: string | null = "created_at"
	) {
		this.table = table
		this.userId = userId
		this.setter = setter
		this.setLoading = setLoading
		this.dateKeys = dateKeys
		this.column = column
	}

	private updateLocalData(newData: T[]) {
		this.data = newData
		this.setter(newData)
		this.setLoading(false)
	}

	private async runSafe(
		action: () => Promise<any>,
		options?: ManagerOptions<T>,
		fetchOnSuccess?: boolean,
	) {
		const MIN_DELAY = options?.minTime ?? 0
		const startTime = Date.now()

		try {
			const result = await action()

			if (options?.minTime) {
				const elapsed = Date.now() - startTime
				const remaining = Math.max(0, MIN_DELAY - elapsed)
				if (remaining > 0) await new Promise(resolve => setTimeout(resolve, remaining))
			}

			if (fetchOnSuccess) this.fetch()
			if (options?.onSuccess) options.onSuccess(result)
		} catch (error) {
			console.error(`Error in ${this.table}:`, error)
			if (options?.onError) options.onError(error)
			else alert(`Database error in ${this.table}`)
		} finally {
			this.setLoading(false)
		}
	}

	async fetch(options?: ManagerOptions<T>) {
		await this.runSafe(async () => {
			let query = supabase
				.from(this.table)
				.select("*")
			if (this.column) {
				query = query.order(this.column, { ascending: false })
			}
			const { data, error } = await query

			if (error) throw error

			const transformedData = (data || []).map((item) => {
				const newItem = { ...item }
				this.dateKeys.forEach((key) => {
					if (newItem[key]) newItem[key] = parseISO(newItem[key])
				})
				return newItem
			})

			this.updateLocalData(transformedData)
			return transformedData
		}, options)
	}

	async post(item: Partial<T> | Partial<T>[], options?: ManagerOptions<T>) {
		await this.runSafe(async () => {
			const payload = Array.isArray(item)
				? item.map(i => ({ ...i, user_id: this.userId }))
				: { ...item, user_id: this.userId };

			const { data, error } = await supabase
				.from(this.table)
				.insert(Array.isArray(payload) ? payload : [payload])
				.select();

			if (error) throw error;
			return Array.isArray(item) ? data : data[0];
		}, options, true);
	}

	async put(id: string, updates: Partial<T>, options?: ManagerOptions<T>) {
		await this.runSafe(async () => {
			const { data, error } = await supabase
				.from(this.table)
				.update(updates)
				.eq("id", id)
				.select()

			if (error) throw error
			return data[0]
		}, options, true)
	}

	async delete(id: string, options?: ManagerOptions<T>) {
		await this.runSafe(async () => {
			const { error } = await supabase
				.from(this.table)
				.delete()
				.eq("id", id)

			if (error) throw error
		}, options, true)
	}
}
