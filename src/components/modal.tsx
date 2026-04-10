import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

const Modal = (props: { children: React.ReactNode, visible: boolean, setVisible: (val: boolean) => void, style?: React.CSSProperties }) => {
	const dotPattern = `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='-6 -2 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='white' fill-opacity='0.075'/%3E%3C/svg%3E")`;
	return (
		createPortal(
			<AnimatePresence>
				{
					props.visible &&
					<motion.div
						key="modal"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.4, ease: "easeInOut" }}
						onClick={(e) => { e.stopPropagation(); e.preventDefault(); props.setVisible(false) }}
						style={{
							position: "fixed",
							inset: 0,
							backgroundColor: "var(--color-bg)",
							padding: 10,
							paddingBottom: 30,
							transform: "translate3d(0,0,0)",
							backgroundImage: dotPattern,
							backgroundAttachment: "fixed",
							backgroundRepeat: "repeat"
						}}
					>
						<motion.div
							initial={{ opacity: 0, y: "20vh" }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: "20vh" }}
							transition={{ ease: "easeInOut", duration: 0.4 }}
							style={{
								maxHeight: "100%",
								height: "100%",
								overflow: "hidden",
								transform: "translate3d(0,0,0)",
								display: "flex",
								flexDirection: "column",
								...props.style
							}}
						>
							{props.children}
						</motion.div>
					</motion.div>
				}
			</AnimatePresence >
			, document.getElementById("portal-root")!
		)
	)
}

export default Modal
