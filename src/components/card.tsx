import { Ellipsis } from "lucide-react"

interface CardProps {
	header: string | React.ReactNode
	subHeader?: React.ReactNode
	children?: React.ReactNode
	onSettingsClick?: () => void
	hideSettings?: boolean
	contentStyle?: React.CSSProperties
	settingsLogo?: React.ReactNode
	style?: React.CSSProperties
	onClick?: (e: React.MouseEvent) => void
}

const Card = (props: CardProps) => {
	return (
		<div
			className="card"
			style={props.style}
			onClick={props.onClick}
		>
			<div
				className="header-row"
			>
				<h1>
					<HeaderIcon />
					{props.header}
					{
						!props.hideSettings && (

							props.settingsLogo
							??
							<div
								className="settings-icon"
								onClick={props.onSettingsClick}
							>
								<Ellipsis />
							</div>
						)
					}
				</h1>
			</div>
			{
				props.subHeader &&
				<h2>
					{props.subHeader}
				</h2>
			}
			<div
				className="card-content"
				style={props.contentStyle}
			>
				{props.children}
			</div>
		</div>
	)
}

const HeaderIcon = (props: { style?: React.CSSProperties }) => {
	const dotBase: React.CSSProperties = {
		position: "absolute",
		width: "5px",
		height: "5px",
		borderRadius: "50%",
		backgroundColor: "var(--color-primary)",
		boxShadow: "0 0 5px color-mix(in srgb, var(--color-primary), transparent 60%)",
		transform: "translateZ(0)",
		willChange: "transform"
	}

	return (
		<div
			style={{
				position: "relative",
				width: "14px",
				height: "13px",
				display: "inline-block",
				verticalAlign: "middle",
				marginRight: "4px",
				marginLeft: "1px",
				...props.style
			}}
		>
			<div style={{ ...dotBase, top: "0px", left: "0px" }} />
			<div style={{ ...dotBase, bottom: "0px", left: "50%", transform: "translateX(-50%) translateZ(0)" }} />
			<div style={{ ...dotBase, top: "0px", right: "0px" }} />
		</div>
	)
}

export default Card
