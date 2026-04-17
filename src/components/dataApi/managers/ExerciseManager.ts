import { supabase } from "../../../lib/supabase"
import { BaseManager } from "./BaseManager"
import { type Workout } from "./WorkoutManager"

export interface Exercise {
	id: string
	name: string
	category: "PUSH" | "PULL" | "LEGS" | "OTHER"
	user_id?: string
	created_at: Date
}

export class ExerciseManager extends BaseManager {
	private setExercises: (data: Exercise[]) => void
	private setWorkouts: (fn: (prev: Workout[]) => Workout[]) => void

	constructor(
		userId: string,
		setLoading: (val: boolean) => void,
		setExercises: (data: Exercise[]) => void,
		setWorkouts: (fn: (prev: Workout[]) => Workout[]) => void
	) {
		super(userId, setLoading)
		this.setExercises = setExercises
		this.setWorkouts = setWorkouts
	}

	async fetchExercises() {
		return this.runSafe(async () => {
			const { data, error } = await supabase
				.from("exercises")
				.select("*")
				.or(`user_id.eq.${this.userId},user_id.is.null`)
				.order("name", { ascending: true })

			if (error) throw error

			const polished = (data || []).map((ex) => ({
				...ex,
				created_at: new Date(ex.created_at)
			}))

			this.setExercises(polished)
			return polished
		})
	}

	async createCustomExercise(name: string, category: Exercise["category"]) {
		return this.runSafe(async () => {
			const { data, error } = await supabase
				.from("exercises")
				.insert({
					name,
					category,
					user_id: this.userId
				})
				.select()
				.single()

			if (error) throw error

			await this.fetchExercises()
			return data
		})
	}

	async updateCustomExercise(id: string, updates: { name?: string; category?: Exercise["category"] }) {
		return this.runSafe(async () => {
			const { error } = await supabase
				.from("exercises")
				.update(updates)
				.eq("id", id)
				.eq("user_id", this.userId)

			if (error) throw error

			await this.fetchExercises()

			this.setWorkouts((prevWorkouts) =>
				prevWorkouts.map(workout => ({
					...workout,
					exercises: workout.exercises.map(ex =>
						ex.id === id
							? { ...ex, ...updates }
							: ex
					)
				}))
			)
		})
	}

	async deleteCustomExercise(id: string) {
		return this.runSafe(async () => {
			const { error } = await supabase
				.from("exercises")
				.delete()
				.eq("id", id)
				.eq("user_id", this.userId)

			if (error) throw error

			await this.fetchExercises()

			this.setWorkouts((prevWorkouts) =>
				prevWorkouts.map(workout => ({
					...workout,
					exercises: workout.exercises.filter(ex => ex.id !== id)
				}))
			)
		})
	}
}
