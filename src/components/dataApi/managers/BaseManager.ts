import { supabase } from "../../../lib/supabase"
import { parseISO } from "date-fns"

export interface ManagerOptions<T> {
	onSuccess?: (data: T | T[]) => void
	onError?: (error: any) => void
	minTime?: number
}

export class BaseManager {
	protected userId: string
	protected setLoading: (val: boolean) => void

	constructor(
		userId: string,
		setLoading: (val: boolean) => void
	) {
		this.userId = userId
		this.setLoading = setLoading
	}

	protected async runSafe<T>(
		action: () => Promise<T>,
		options?: { onSuccess?: (data: T) => void, minTime?: number }
	): Promise<T | undefined> {
		this.setLoading(true)
		const startTime = Date.now()

		try {
			const result = await action()
			if (options?.minTime) {
				const elapsed = Date.now() - startTime
				const remaining = Math.max(0, options.minTime - elapsed)
				if (remaining > 0) await new Promise(res => setTimeout(res, remaining))
			}
			if (options?.onSuccess) options.onSuccess(result)
			return result
		} catch (error) {
			console.log("[Manager Error]: ", error)
			throw error
		} finally {
			this.setLoading(false)
		}
	}

	protected async getTableData<T>(
		table: string,
		orderCol: string | null = "created_at",
		dataKeys: string[] = ["created_at"]
	): Promise<T[]> {
		let query = supabase.from(table).select("*")
		if (orderCol) query = query.order(orderCol, { ascending: false })

		const { data, error } = await query
		if (error) throw error

		return (data || []).map((item: any) => {
			const newItem = { ...item }
			dataKeys.forEach(key => {
				if (newItem[key]) newItem[key] = parseISO(newItem[key])
			})
			return newItem as T
		})
	}
}
