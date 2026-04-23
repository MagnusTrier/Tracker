import { createPortal } from "react-dom";
import { AnimatePresence, motion, type Variants } from "motion/react";

const TRANSITIONS: Variants = {
	enter: (direction: number) => ({
		x: direction === 0 ? 0 : direction > 0 ? "100%" : "-100%",
		opacity: 0
	}),
	center: {
		x: 0,
		opacity: 1
	},
	exit: (direction: number) => ({
		x: direction === 0 ? 0 : direction > 0 ? "-100%" : "100%",
		opacity: 0
	})
}

interface ModalProps {
	children: React.ReactNode
	visible: boolean
	onOverlayClick: () => void
	page: number
	direction: number
}

const Modal = (props: ModalProps) => {


	return (
		createPortal(
			<AnimatePresence>
				{
					props.visible &&
					<motion.div
						key="modal"
						initial={{ opacity: 0, paddingTop: "20vh" }}
						animate={{ opacity: 1, paddingTop: 0 }}
						exit={{ opacity: 0, paddingTop: "20vh" }}
						transition={{ duration: 0.4, ease: "easeInOut" }}
						onClick={props.onOverlayClick}
						style={{
							position: "fixed",
							inset: 0,
							backgroundColor: "color-mix(in srgb, var(--surface-main), transparent 20%)",
							backdropFilter: "blur(7px)",
							WebkitBackdropFilter: "blur(7px)",
							transform: "translate3d(0,0,0)",
						}}
					>
						<AnimatePresence mode="popLayout" initial={false} custom={props.direction}>
							<motion.div
								key={props.page}
								custom={props.direction}
								variants={TRANSITIONS}
								initial="enter"
								animate="center"
								exit="exit"
								transition={{ ease: "easeInOut", duration: 0.4 }}
								style={{
									maxHeight: "100%",
									height: "100%",
									overflow: "hidden",
									transform: "translate3d(0,0,0)",
									padding: "0px 10px 10px 10px"
								}}
							>
								{props.children}
							</motion.div>
						</AnimatePresence>
					</motion.div>
				}
			</AnimatePresence >,
			document.getElementById("portal-root")!
		)
	)
}

export default Modal
