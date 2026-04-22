import { createPortal } from "react-dom"
import { CustomButton } from "./generics"
import { AnimatePresence, motion } from "motion/react"
import { TriangleAlert } from "lucide-react"

const SystemPrompt = (props: { visible: boolean, hide: () => void, children: React.ReactNode, onCancel?: () => void, onConfirm: () => void, header: React.ReactNode | string }) => {
	return (
		createPortal(
			<AnimatePresence>
				{
					props.visible &&
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="system-prompt-container"
						onClick={props.hide}
					>
						<div className="card" style={{ width: "100%" }} onClick={(e) => { e.preventDefault(); e.stopPropagation() }}>

							<div className="alert-icon-container action-button-primary">
								<TriangleAlert />
							</div>
							<div className="header">
								{props.header}
							</div>
							<h2 className="content">
								{props.children}
							</h2>

							<div style={{ width: "100%" }}>
								<CustomButton
									text={{ default: "CONFIRM" }}
									onClick={props.onConfirm}
									style={{ width: "100%", height: 50, borderRadius: 5, marginBottom: 10 }}
								/>
								<CustomButton
									text={{ default: "CANCEL" }}
									onClick={props.onCancel || props.hide}
									style={{ width: "100%", height: 50, borderRadius: 5 }}
									theme="neutral"
								/>
							</div>
						</div>
					</motion.div>
				}
			</AnimatePresence>,
			document.getElementById("portal-root")!
		)
	)
}

export default SystemPrompt
