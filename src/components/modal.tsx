import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

const Modal = (props: { children: React.ReactNode, visible: boolean, setVisible: (val: boolean) => void }) => {
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
							backdropFilter: "blur(10px)",
							WebkitBackdropFilter: "blur(10px)",
							backgroundColor: "color-mix(in srgb, var(--color-bg), transparent 25%)",
							padding: 10
						}}
					>
						<motion.div
							initial={{ opacity: 0, y: "50vh" }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: "50vh" }}
							transition={{ ease: "easeInOut", duration: 0.4 }}
							onClick={(e) => { e.stopPropagation(); e.preventDefault() }}
							style={{
								maxHeight: "100dvh",
								overflow: "hidden",
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
