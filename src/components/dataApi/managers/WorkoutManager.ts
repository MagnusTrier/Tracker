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

export interface DBWorkoutLog {
	id: string
	workout_id: string | null
	user_id: string
	started_at: Date
	completed_at: Date | null
	notes: string | null
}

export interface DBExerciseLog {
	id: string
	workout_log_id: string
	exercise_id: string
	weight_kg: string
	reps: string
	sets: string
}

export interface SetLog {
	weight_kg: string
	reps: string
	set_nr: number
}

export type ExerciseSetMap = Record<string, SetLog[]>


export interface WorkoutLogDetailed extends DBWorkoutLog {
	exercises: ExerciseSetMap
}

export type WorkoutHistoryMap = Record<string, WorkoutLogDetailed[]>

type BaseWorkout = Omit<DBWorkout, "user_id" | "created_at">

export interface Workout extends BaseWorkout {
	created_at?: Date
	exercises: Exercise[]
}

export interface ActiveWorkout extends Workout {
	data: ExerciseSetMap
	timer: number
}

export class WorkoutManager extends BaseManager {
	private setWorkouts: (data: Workout[]) => void
	private setWorkoutHistory: (data: WorkoutHistoryMap) => void
	constructor(
		userId: string,
		setLoading: (val: boolean) => void,
		setWorkouts: (data: Workout[]) => void,
		setWorkoutHistory: (data: WorkoutHistoryMap) => void
	) {
		super(userId, setLoading)
		this.setWorkouts = setWorkouts
		this.setWorkoutHistory = setWorkoutHistory
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

	async fetchWorkoutHistory() {
		return this.runSafe(async () => {
			const { data, error } = await supabase
				.from("workout_logs")
				.select(`
				*,
				raw_sets:exercise_logs (*)
			`)
				.eq("user_id", this.userId)
				.order("started_at", { ascending: false })

			if (error) throw error

			const historyMap = {} as any

			(data || []).forEach((log: any) => {
				const workoutId = log.workout_id || "unassigned"

				const exerciseMap: ExerciseSetMap = {}
				log.raw_sets.forEach((s: any) => {
					if (!exerciseMap[s.exercise_id]) {
						exerciseMap[s.exercise_id] = []
					}
					exerciseMap[s.exercise_id].push({
						weight_kg: s.weight_kg.toString(),
						reps: s.reps.toString(),
						set_nr: s.sets
					})
				})

				Object.values(exerciseMap).forEach(sets =>
					sets.sort((a, b) => Number(a.set_nr) - Number(b.set_nr))
				)

				const polishedLog: WorkoutLogDetailed = {
					workout_id: log.workout_id,
					user_id: log.user_id,
					id: log.id,
					notes: log.notes,
					started_at: new Date(log.started_at),
					completed_at: log.completed_at ? new Date(log.completed_at) : null,
					exercises: exerciseMap
				}

				if (!historyMap[workoutId]) {
					historyMap[workoutId] = []
				}
				historyMap[workoutId].push(polishedLog)
			})

			this.setWorkoutHistory(historyMap)

			return historyMap
		})
	}

	async logWorkoutSession(workoutId: string, exerciseMap: ExerciseSetMap, notes?: string) {
		return this.runSafe(async () => {
			const { data: log, error: logError } = await supabase
				.from("workout_logs")
				.insert({
					workout_id: workoutId,
					user_id: this.userId,
					completed_at: new Date().toISOString(),
					notes: notes || null
				})
				.select()
				.single();

			if (logError) throw logError;

			const setRecords = Object.entries(exerciseMap).flatMap(([exerciseId, sets]) =>
				sets.map(s => ({
					workout_log_id: log.id,
					exercise_id: exerciseId,
					weight_kg: Number(s.weight_kg),
					reps: s.reps,
					sets: s.set_nr
				}))
			);

			if (setRecords.length > 0) {
				const { error: setsError } = await supabase
					.from("exercise_logs")
					.insert(setRecords);

				if (setsError) throw setsError;
			}

			await this.fetchAllWorkouts();
			return log;
		});
	}
}
