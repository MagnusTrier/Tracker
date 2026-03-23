import { createClient } from "@supabase/supabase-js";

export type WeightEntry = {
	id: number;
	created_at: string;
	weight: number;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
