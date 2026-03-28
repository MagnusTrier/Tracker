import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { useSession } from "./sessionContext.tsx"
import { parseISO } from "date-fns";

interface Data<T extends { id?: string }> {
	values: T[];
	isLoading: boolean;
	manager: DataManager<T> | undefined;
}

export interface Exercise {
	id: string;
	name: string;
}

export interface ExerciseSet {
	id: string;
	created_at: Date;
	weight: number;
	reps: number;
	set_number: number;
	exercise_id: string;
	session_id: string;
	date: Date;
}

export interface WeightLog {
	id: string;
	created_at: Date;
	weight: number;
	date: Date;
}


interface DataContextType {
	exercises: Data<Exercise>;
	sets: Data<ExerciseSet>;
	weightLogs: Data<WeightLog>;
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
	const { user } = useSession()

	const [exercises, setExercises] = useState<Exercise[]>([])
	const [exercisesLoading, setExersicesLoading] = useState<boolean>(true)

	const [sets, setSets] = useState<ExerciseSet[]>([])
	const [setsLoading, setSetsLoading] = useState<boolean>(true)

	const [weightLogs, setWeightLogs] = useState<WeightLog[]>([])
	const [weightLogsLoading, setWheightLogsLoading] = useState<boolean>(true)

	const managers = useMemo(() => (user ? {
		exercises: new DataManager<Exercise>("exercises", user.id, setExercises, setExersicesLoading),
		sets: new DataManager<ExerciseSet>("exercise_sets", user.id, setSets, setSetsLoading, ["created_at", "date"], "date"),
		weightLogs: new DataManager<WeightLog>("weight_logs", user.id, setWeightLogs, setWheightLogsLoading, ["created_at", "date"], "date")
	} : null), [user?.id])

	useEffect(() => {
		managers?.exercises.fetch()
		managers?.sets.fetch()
		managers?.weightLogs.fetch()
	}, [managers])

	return (
		<DataContext.Provider value={{
			exercises: {
				values: exercises,
				isLoading: exercisesLoading,
				manager: managers?.exercises
			},
			sets: {
				values: sets,
				isLoading: setsLoading,
				manager: managers?.sets
			},
			weightLogs: {
				values: weightLogs,
				isLoading: weightLogsLoading,
				manager: managers?.weightLogs
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
	minTime?: number;
}

class DataManager<T extends { id?: string }> {
	public data: T[] = []

	private table: string
	private userId: string
	private setter: (data: T[]) => void
	private setLoading: (val: boolean) => void
	private dateKeys: string[]
	private column: keyof T | "created_at"

	constructor(table: string, userId: string, setter: (data: T[]) => void, setLoading: (val: boolean) => void, dateKeys: string[] = ["created_at"], column: keyof T | "created_at" = "created_at") {
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
			const result = await action();

			if (options?.minTime) {
				const elapsed = Date.now() - startTime;
				const remaining = Math.max(0, MIN_DELAY - elapsed);
				if (remaining > 0) await new Promise(resolve => setTimeout(resolve, remaining))
			}

			if (fetchOnSuccess) this.fetch()
			if (options?.onSuccess) options.onSuccess(result);
		} catch (error) {
			console.error(`Error in ${this.table}:`, error);

			if (options?.minTime) {
				const elapsed = Date.now() - startTime;
				const remaining = Math.max(0, MIN_DELAY - elapsed);
				if (remaining > 0) await new Promise(resolve => setTimeout(resolve, remaining))
			}

			if (options?.onError) {
				options.onError(error);
			} else {
				alert(`Database error`);
			}
		} finally {
			this.setLoading(false);
		}
	}

	async fetch(options?: ManagerOptions<T>) {
		await this.runSafe(async () => {
			const { data, error } = await supabase
				.from(this.table)
				.select("*")
				.order(this.column as string, { ascending: false })

			if (error) throw error;

			const transformedData = (data || []).map((item) => {
				const newItem = { ...item }

				this.dateKeys.forEach((key) => {
					newItem[key] = parseISO(newItem[key])
				})

				return newItem

			})

			this.updateLocalData(transformedData)

			return transformedData;
		}, options);
	}

	async post(item: Partial<T>, options?: ManagerOptions<T>) {
		await this.runSafe(async () => {
			const { data, error } = await supabase
				.from(this.table)
				.insert([{ ...item, user_id: this.userId }])
				.select()

			if (error) throw error

			const newItem = data[0]
			return newItem
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
