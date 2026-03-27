import { PropagateLoader } from "react-spinners"

const LoadingScreen = (props: { message: string }) => {
	return (
		<div
			className="loading-screen"
		>
			<PropagateLoader
				size={20}
				color="var(--color-primary)"
				className="loading-screen-spinner"
			/>
			<span>{props.message}</span>
		</div>
	)
}

export default LoadingScreen
