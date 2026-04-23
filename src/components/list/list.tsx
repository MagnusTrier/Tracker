import "./list.css"
import { useMemo, useState } from "react"
import { FastInput } from "../generics"
import { Search } from "lucide-react"

interface ListProps<T, R = T> {
	items: T[]
	renderItem: (item: R) => React.ReactNode
	emptyMessage?: string
	search?: {
		placeholder: string
		transformFn: (items: T[], query: string) => R[]
	}
	style?: React.CSSProperties
}

const List = <T extends { id: string | number }, R extends { id: string | number } = T>(props: ListProps<T, R>) => {

	const [query, setQuery] = useState<string>("")

	const filteredItems = useMemo(() => {
		if (props.search?.transformFn) {
			return props.search.transformFn(props.items, query)
		}
		return props.items as unknown as R[]

	}, [props.items, query, props.search])

	return (
		<div className="list list-wrapper">
			{
				props.search &&
				<ListInput
					placeholder={props.search.placeholder}
					value={query}
					onChange={setQuery}
				/>
			}
			<div className="list-scrollable">
				<div
					style={{ width: "100%" }}
				>
					{filteredItems.length > 0 ? (
						filteredItems.map((item) => (
							<div
								key={item.id}
								className="item"
								style={props.style}
							>
								{props.renderItem(item)}
							</div>
						))
					) : (
						<div
							key="empty-state"
							className="no-items"
						>
							{props.emptyMessage || "NO ITEMS"}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

interface ListInputProps {
	placeholder: string
	value: string
	onChange: (val: string) => void
	style?: React.CSSProperties
}

export const ListInput = (props: ListInputProps) => {
	return (
		<div
			className="input-wrapper"
			style={{
				color: props.value.length > 0
					? "var(--text-main)"
					: "var(--text-muted)",
				...props.style
			}}
		>
			<FastInput
				initialValue={props.value}
				onChange={props.onChange}
				placeholder={props.placeholder}
			/>
			<div>
				<Search strokeWidth="1.5" size="20" />
			</div>
		</div>
	)
}

export default List
