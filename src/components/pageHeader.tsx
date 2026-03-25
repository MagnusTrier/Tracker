import { SettingsIcon, SettingsIconSimple } from "./settings/settings";

interface PageHeaderProps {
	children: React.ReactNode;
	settingsToggle?: boolean;
	settingsDisplay?: React.ReactNode;
}
export const PageHeader = ({ children, settingsToggle = true, settingsDisplay = <></> }: PageHeaderProps) => {
	return (
		<div className="card-header-container">
			<h1>
				<HeaderIcon />
				{children}
			</h1>
			{
				settingsToggle
					?
					<SettingsIcon>
						{settingsDisplay}
					</SettingsIcon>
					:
					<SettingsIconSimple />
			}
		</div>

	)
}

interface HeaderIconProps {
	style?: React.CSSProperties;
}

export const HeaderIcon = ({ style }: HeaderIconProps) => {
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
