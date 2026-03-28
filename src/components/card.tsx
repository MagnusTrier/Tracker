import { useOutsideClick } from "../lib/outsideClick"
import { useSession } from "./sessionContext"
import { createPortal } from "react-dom"
import { HiOutlineDotsHorizontal, HiX } from "react-icons/hi"
import { useState, useEffect } from "react"
import { motion } from "motion/react"

interface CardProps {
	header?: string | React.ReactNode
	subHeader?: React.ReactNode
	children: React.ReactNode
	settings?: React.ReactNode | ((val: boolean) => React.ReactNode | null)
	contentStyle?: React.CSSProperties
	settingsStyle?: React.CSSProperties
	hideSettings?: boolean
	ref?: React.RefObject<HTMLDivElement | null>
	id?: string
	onSettingsClick?: () => void
	settingsSubheader?: string
}

const Card = (props: CardProps) => {
	const { showSettings, setShowSettings } = useSession()

	const [visible, setVisible] = useState<boolean>(false)
	const [showConditionalSettings, setShowConditionalSettings] = useState<boolean>(false)
	const isSettingsCard = props.settings === undefined


	useEffect(() => {
		!showSettings && setVisible(false)
	}, [showSettings])

	useEffect(() => {
		if (visible) {
			setShowConditionalSettings(true)
		} else {
			const timer = setTimeout(() => setShowConditionalSettings(false), 500)
			return () => clearTimeout(timer)
		}
	}, [visible])

	const toggleSettings = (e?: React.MouseEvent) => {
		e?.stopPropagation()
		e?.preventDefault()
		setVisible(!isSettingsCard)
		setShowSettings(!isSettingsCard)
	}

	const ref = useOutsideClick<HTMLDivElement>(() => setShowSettings(false))

	return (
		<>
			<div
				id={props.id}
				ref={props.ref}
				className="blur card"
			>
				<div
					className="header-row"
				>
					{

						props.header &&
						<h1>
							<HeaderIcon />
							{props.header}

							{
								!props.hideSettings &&

								<div
									className="settings-icon"
									style={isSettingsCard ? {
										fontSize: 18
									} : {}}
									onClick={props.onSettingsClick ?? toggleSettings}
								>

									{
										isSettingsCard
											?
											<HiX />
											:
											<HiOutlineDotsHorizontal />
									}
								</div>
							}
						</h1>

					}
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
			{
				!isSettingsCard &&
				createPortal(
					<motion.div
						key="settings-tray"
						className="settings-container"
						initial={{ opacity: 0, visibility: "hidden" }}
						animate={visible ? { opacity: 1, y: 0, visibility: "visible", } : { opacity: 0, y: "-100vh", visibility: "hidden" }}
						transition={{ ease: "easeInOut", duration: 0.5 }}
					>
						<Card
							id="datepicker-portal"
							ref={ref}
							header="SETTINGS"
							subHeader={
								props.settingsSubheader
								??
								<span>
									SETTINGS FOR <span style={{ color: "var(--color-primary)" }}>
										{props.header}
									</span>

								</span>
							}
							contentStyle={props.settingsStyle}
						>
							{typeof props.settings === "function" ? props.settings(showConditionalSettings) : props.settings}
						</Card>
					</motion.div>,
					document.body
				)
			}
		</>
	)
}

interface HeaderIconProps {
	style?: React.CSSProperties
}

const HeaderIcon = ({ style }: HeaderIconProps) => {
	return (
		<svg width="24" height="24" viewBox="0 0 48 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
			<g filter="url(#filter0_d_1_14)">
				<circle cx="15" cy="15" r="5" fill="var(--color-primary)" />
			</g>
			<g filter="url(#filter1_d_1_14)">
				<circle cx="24" cy="29" r="5" fill="var(--color-primary)" />
			</g>
			<g filter="url(#filter2_d_1_14)">
				<circle cx="33" cy="15" r="5" fill="var(--color-primary)" />
			</g>
			<defs>
				<filter id="filter0_d_1_14" x="0" y="0" width="30" height="30" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
					<feOffset />
					<feGaussianBlur stdDeviation="5" />
					<feComposite in2="hardAlpha" operator="out" />
					<feColorMatrix type="matrix" values="0 0 0 0 0.54902 0 0 0 0 0.54902 0 0 0 0 1 0 0 0 0.5 0" />
					<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_14" />
					<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_14" result="shape" />
				</filter>
				<filter id="filter1_d_1_14" x="9" y="14" width="30" height="30" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
					<feOffset />
					<feGaussianBlur stdDeviation="5" />
					<feComposite in2="hardAlpha" operator="out" />
					<feColorMatrix type="matrix" values="0 0 0 0 0.54902 0 0 0 0 0.54902 0 0 0 0 1 0 0 0 0.5 0" />
					<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_14" />
					<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_14" result="shape" />
				</filter>
				<filter id="filter2_d_1_14" x="18" y="0" width="30" height="30" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
					<feOffset />
					<feGaussianBlur stdDeviation="5" />
					<feComposite in2="hardAlpha" operator="out" />
					<feColorMatrix type="matrix" values="0 0 0 0 0.54902 0 0 0 0 0.54902 0 0 0 0 1 0 0 0 0.5 0" />
					<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_14" />
					<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_14" result="shape" />
				</filter>
			</defs>
		</svg>
	)
}

export default Card
