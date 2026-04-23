interface CardProps {
	header: string
	subHeader: string
	children: React.ReactNode
	hideSettings?: boolean
	settingsLogo?: React.ReactNode
	style?: React.CSSProperties
	onClick?: (e: React.MouseEvent) => void
	className?: string
}

const defaultOnClick = (e: React.MouseEvent) => {
	e.preventDefault()
	e.stopPropagation()
}

const Card = (props: CardProps) => {
	return (
		<div
			className={"card " + props.className}
			style={{
				"--content-before": `"${props.header}"`,
				"--content-after": `"${props.subHeader}"`,
				...props.style
			} as React.CSSProperties}
			onClick={props.onClick || defaultOnClick}
		>
			{HeaderIcon}
			{props.children}
		</div>
	)
}

export const Header = (props: { header: string | React.ReactNode, subHeader: string | React.ReactNode, icon?: React.ReactNode }) => {
	return (
		<>
			<h1>
				{HeaderIcon}
				{props.header}
			</h1>
			<h2>
				{props.subHeader}
			</h2>
		</>
	)
}


export const HeaderIcon = <div className="header-icon"> <div /> </div>


export default Card
