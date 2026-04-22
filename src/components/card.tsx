interface CardProps {
	header: string | React.ReactNode
	subHeader: React.ReactNode
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
			style={props.style}
			onClick={props.onClick || defaultOnClick}
		>
			<Header
				header={props.header}
				subHeader={props.subHeader}
			/>
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
