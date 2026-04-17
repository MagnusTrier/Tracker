import { supabase } from "../../../lib/supabase"
import { BaseManager } from "./BaseManager"

export interface DBWeightLog {
	id: string
	user_id: string
	weight: number
	date: Date
	created_at: Date
}

export interface WeightLog extends DBWeightLog { }

export class WeightManager extends BaseManager {
	private setWeightLogs: (data: WeightLog[]) => void

	constructor(
		userId: string,
		setLoading: (val: boolean) => void,
		setWeightLogs: (data: WeightLog[]) => void
	) {
		super(userId, setLoading)
		this.setWeightLogs = setWeightLogs
	}

	async fetchWeights() {
		return this.runSafe(async () => {
			const data = await this.getTableData<DBWeightLog>(
				"weight_logs",
				"date",
				["date", "created_at"]
			)

			this.setWeightLogs(data)
			return data
		})
	}

	async addWeight(weight: number, date: Date = new Date()) {
		return this.runSafe(async () => {
			const { data, error } = await supabase
				.from("weight_logs")
				.insert({
					weight,
					date: date.toISOString(),
					user_id: this.userId
				})
				.select()
				.single()

			if (error) throw error

			await this.fetchWeights()
			return data
		})
	}

	async updateWeight(id: string, weight: number, date?: Date) {
		return this.runSafe(async () => {
			const { error } = await supabase
				.from("weight_logs")
				.update({
					weight,
					...(date && { date: date.toISOString() })
				})
				.eq("id", id)

			if (error) throw error

			await this.fetchWeights()
		})
	}

	async deleteWeightLog(id: string) {
		return this.runSafe(async () => {
			const { error } = await supabase
				.from("weight_logs")
				.delete()
				.eq("id", id)
				.eq("user_id", this.userId)

			if (error) throw error

			await this.fetchWeights()
		})
	}
}
