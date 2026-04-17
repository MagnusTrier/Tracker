import { useEffect, useState, startTransition, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "./sessionContext";
import { useData } from "./dataApi/dataContext";

const Card = lazy(() => import("./card"))
const MountAppContent = lazy(() => import("./mountAppContent"))

const SplashScreen = () => {
	const { exercises, weightLogs, workouts } = useData();
	const { user, isLoading, login } = useSession()

	const [isDataBooted, setIsDataBooted] = useState(false);

	const allDataLoaded = !exercises.isLoading && !weightLogs.isLoading && !workouts.isLoading;
	const isReadyToShow = allDataLoaded && !isLoading;

	useEffect(() => {
		if (isReadyToShow && !isDataBooted) {
			startTransition(() => {
				setIsDataBooted(true);
			});
		}
	}, [isReadyToShow, isDataBooted]);


	if (!user && !isLoading) return <Login onLogin={login} />

	return (
		<div className="root-wrapper">
			<AnimatePresence mode="wait">
				{!isDataBooted ? (
					<motion.div
						key="splash"
						exit={{ opacity: 0 }}
						transition={{ duration: 0.4, ease: "easeInOut", delay: 0.3 }}
						className="splash-screen"
					>
						<div>
							TRACKER
						</div>
					</motion.div>
				) : (
					<motion.div
						key="app-shell"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
					>
						<MountAppContent />
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};


const Login = (props: { onLogin: () => void }) => {
	return (
		<div
			className="login"
		>
			<Card
				header="WELCOME TO TRACKER"
				subHeader="YOU NEED TO LOG IN TO PROCEED"
				contentStyle={{ alignItems: "center" }}
				hideSettings
				style={{ width: "100%" }}
			>
				<div className="login-button clickable" onClick={props.onLogin}>
					LOG IN
				</div>
			</Card>
		</div>
	)
}

export default SplashScreen
