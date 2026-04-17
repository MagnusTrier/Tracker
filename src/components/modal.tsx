import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

const Modal = (props: { children: React.ReactNode, visible: boolean, setVisible: (val: boolean) => void, style?: React.CSSProperties, wrapperStyle?: React.CSSProperties }) => {
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
							backgroundColor: "color-mix(in srgb, var(--color-bg), transparent 20%)",
							backdropFilter: "blur(7px)",
							WebkitBackdropFilter: "blur(7px)",
							transform: "translate3d(0,0,0)",
							...props.wrapperStyle
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
