import { supabase } from "../../../lib/supabase"
import { BaseManager } from "./BaseManager"
import { type Exercise } from "./ExerciseManager"

export interface DBWorkout {
	id: string
	name: string
	created_at: Date
	circuit: boolean
	user_id: string
}

export interface DBWorkoutExercise {
	id: string
	workout_id: string
	exercise_id: string
	sequence_order: number
}

type BaseWorkout = Omit<DBWorkout, "user_id" | "created_at">

export interface Workout extends BaseWorkout {
	created_at?: Date
	exercises: Exercise[]
}

export class WorkoutManager extends BaseManager {
	private setWorkouts: (data: Workout[]) => void
	constructor(
		userId: string,
		setLoading: (val: boolean) => void,
		setWorkouts: (data: Workout[]) => void
	) {
		super(userId, setLoading)
		this.setWorkouts = setWorkouts
	}

	async fetchAllWorkouts() {
		return this.runSafe(async () => {
			const { data, error } = await supabase
				.from("workouts")
				.select(`
						*,
						exercises:workout_exercises (
							*,
							details:exercises (*)
						)
					`)
				.eq("user_id", this.userId)
				.order("created_at", { ascending: false })

			if (error) throw error


			const polished: Workout[] = (data || []).map((w: any) => ({
				...w,
				created_at: new Date(w.created_at),
				exercises: w.exercises
					.sort((a: any, b: any) => a.sequence_order - b.sequence_order)
					.map((we: any) => ({
						...we.details,
						sequence_order: we.sequence_order,
						instance_id: we.id
					}))
			}))

			this.setWorkouts(polished)
			return polished
		})
	}

	async createWorkout(name: string, exerciseIds: string[], circuit: boolean = false) {
		return this.runSafe(async () => {
			const { data: workout, error: wError } = await supabase
				.from("workouts")
				.insert({
					name,
					circuit,
					user_id: this.userId
				})
				.select()
				.single()

			if (wError) throw wError

			const joinRecords = exerciseIds.map((exId, index) => ({
				workout_id: workout.id,
				exercise_id: exId,
				sequence_order: index,
				user_id: this.userId
			}))

			const { error: jError } = await supabase
				.from("workout_exercises")
				.insert(joinRecords)

			if (jError) throw jError

			await this.fetchAllWorkouts()
			return workout
		})
	}

	async updateWorkout(workoutId: string, updates: { name?: string, circuit?: boolean, exerciseIds?: string[] }) {
		return this.runSafe(async () => {
			if (updates.name !== undefined || updates.circuit !== undefined) {
				const { error: wError } = await supabase
					.from("workouts")
					.update({
						name: updates.name,
						circuit: updates.circuit
					})
					.eq("id", workoutId)

				if (wError) throw wError
			}

			if (updates.exerciseIds) {
				const { error: dError } = await supabase
					.from("workout_exercises")
					.delete()
					.eq("workout_id", workoutId)

				if (dError) throw dError

				const joinRecords = updates.exerciseIds.map((exId, index) => ({
					workout_id: workoutId,
					exercise_id: exId,
					sequence_order: index,
					user_id: this.userId
				}))

				const { error: jError } = await supabase
					.from("workout_exercises")
					.insert(joinRecords)

				if (jError) throw jError
			}

			await this.fetchAllWorkouts()
		})
	}

	async deleteWorkout(workoutId: string) {
		return this.runSafe(async () => {
			const { error } = await supabase
				.from("workouts")
				.delete()
				.eq("id", workoutId)

			if (error) throw error

			await this.fetchAllWorkouts()
		})

	}
}
