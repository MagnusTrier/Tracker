import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { useUser } from "./sessionContext.tsx"

interface Data<T extends { id?: string }> {
	values: T[];
	isLoading: boolean;
	manager: DataManager<T>;
}

interface Exercise {
	id: string;
	name: string;
}

interface ExerciseSet {
	id: string;
	created_at: string;
	weight: number;
	reps: number;
	set_number: number;
	exercise_id: string;
	session_id: string;
}

interface WeightLog {
	id: string;
	created_at: string;
	weight: number;
}


interface DataContextType {
	exercises: Data<Exercise>;
	sets: Data<ExerciseSet>;
	weightLogs: Data<WeightLog>;
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
	const user = useUser()

	const [exercises, setExercises] = useState<Exercise[]>([])
	const [exercisesLoading, setExersicesLoading] = useState<boolean>(true)

	const [sets, setSets] = useState<ExerciseSet[]>([])
	const [setsLoading, setSetsLoading] = useState<boolean>(true)

	const [weightLogs, setWeightLogs] = useState<WeightLog[]>([])
	const [weightLogsLoading, setWheightLogsLoading] = useState<boolean>(true)

	const managers = useMemo(() => ({
		exercises: new DataManager<Exercise>("exercises", user.id, setExercises, setExersicesLoading),
		sets: new DataManager<ExerciseSet>("exercise_sets", user.id, setSets, setSetsLoading),
		weightLogs: new DataManager<WeightLog>("weight_logs", user.id, setWeightLogs, setWheightLogsLoading)
	}), [user.id])

	useEffect(() => {
		managers.exercises.fetch()
		managers.sets.fetch()
		managers.weightLogs.fetch()
	}, [managers])

	return (
		<DataContext.Provider value={{
			exercises: {
				values: exercises,
				isLoading: exercisesLoading,
				manager: managers.exercises
			},
			sets: {
				values: sets,
				isLoading: setsLoading,
				manager: managers.sets
			},
			weightLogs: {
				values: weightLogs,
				isLoading: weightLogsLoading,
				manager: managers.weightLogs
			}
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

interface ManagerOptions<T> {
	onSuccess?: (data: T | T[]) => void;
	onError?: (error: any) => void;
}

class DataManager<T extends { id?: string }> {
	public data: T[] = []

	private table: string
	private userId: string
	private setter: (data: T[]) => void
	private setLoading: (val: boolean) => void

	constructor(table: string, userId: string, setter: (data: T[]) => void, setLoading: (val: boolean) => void) {
		this.table = table
		this.userId = userId
		this.setter = setter
		this.setLoading = setLoading
	}

	private updateLocalData(newData: T[]) {
		this.data = newData
		this.setter(newData)
		this.setLoading(false)
	}

	private async runSafe(
		action: () => Promise<any>,
		options?: ManagerOptions<T>,
	) {
		try {
			const result = await action()
			if (options?.onSuccess) options.onSuccess(result)
		} catch (error) {
			console.error(`Error in ${this.table}:`, error)
			if (options?.onError) {
				options.onError(error)
			} else {
				alert(`Database error`)
			}
		} finally {
			this.setLoading(false)
		}
	}

	async fetch(options?: ManagerOptions<T>, column: keyof T | "created_at" = "created_at", ascending: boolean = false) {
		await this.runSafe(async () => {
			const { data, error } = await supabase
				.from(this.table)
				.select("*")
				.order(column as string, { ascending })
			if (error) throw error
			this.updateLocalData(data || [])
			return data
		}, options)
	}

	async post(item: Partial<T>, options?: ManagerOptions<T>) {
		await this.runSafe(async () => {
			const { data, error } = await supabase
				.from(this.table)
				.insert([{ ...item, user_id: this.userId }])
				.select()

			if (error) throw error

			const newItem = data[0]
			this.updateLocalData([newItem, ...this.data])
			return newItem
		}, options)
	}

	async delete(id: string, options?: ManagerOptions<T>) {
		await this.runSafe(async () => {
			const { error } = await supabase
				.from(this.table)
				.delete()
				.eq("id", id)

			if (error) throw error
			this.updateLocalData(this.data.filter(item => item.id !== id))
		}, options)
	}
}
