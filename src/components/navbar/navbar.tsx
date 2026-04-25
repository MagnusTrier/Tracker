import "./navbar.css"
import { Link, useResolvedPath, useMatch } from "react-router-dom";

const Navbar = () => {
	return (
		<div
			className="navbar"
		>
			<NavbarLink
				to="/weight"
				style={{ "--icon": 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYyOWQiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXdlaWdodC1pY29uIGx1Y2lkZS13ZWlnaHQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iNSIgcj0iMyIvPjxwYXRoIGQ9Ik02LjUgOGEyIDIgMCAwIDAtMS45MDUgMS40NkwyLjEgMTguNUEyIDIgMCAwIDAgNCAyMWgxNmEyIDIgMCAwIDAgMS45MjUtMi41NEwxOS40IDkuNUEyIDIgMCAwIDAgMTcuNDggOFoiLz48L3N2Zz4=")' } as React.CSSProperties}
			>
				WEIGHT
			</NavbarLink>
			<NavbarLink
				to="/workout"
				style={{ "--icon": 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYyOWQiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWR1bWJiZWxsLWljb24gbHVjaWRlLWR1bWJiZWxsIj48cGF0aCBkPSJNMTcuNTk2IDEyLjc2OGEyIDIgMCAxIDAgMi44MjktMi44MjlsLTEuNzY4LTEuNzY3YTIgMiAwIDAgMCAyLjgyOC0yLjgyOWwtMi44MjgtMi44MjhhMiAyIDAgMCAwLTIuODI5IDIuODI4bC0xLjc2Ny0xLjc2OGEyIDIgMCAxIDAtMi44MjkgMi44Mjl6Ii8+PHBhdGggZD0ibTIuNSAyMS41IDEuNC0xLjQiLz48cGF0aCBkPSJtMjAuMSAzLjkgMS40LTEuNCIvPjxwYXRoIGQ9Ik01LjM0MyAyMS40ODVhMiAyIDAgMSAwIDIuODI5LTIuODI4bDEuNzY3IDEuNzY4YTIgMiAwIDEgMCAyLjgyOS0yLjgyOWwtNi4zNjQtNi4zNjRhMiAyIDAgMSAwLTIuODI5IDIuODI5bDEuNzY4IDEuNzY3YTIgMiAwIDAgMC0yLjgyOCAyLjgyOXoiLz48cGF0aCBkPSJtOS42IDE0LjQgNC44LTQuOCIvPjwvc3ZnPg==")' } as React.CSSProperties}
			>
				WORKOUT
			</NavbarLink>
			<NavbarLink
				to="/status"
				style={{ "--icon": 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYyOWQiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoYXJ0LW5vLWF4ZXMtY29tYmluZWQtaWNvbiBsdWNpZGUtY2hhcnQtbm8tYXhlcy1jb21iaW5lZCI+PHBhdGggZD0iTTEyIDE2djUiLz48cGF0aCBkPSJNMTYgMTR2NyIvPjxwYXRoIGQ9Ik0yMCAxMHYxMSIvPjxwYXRoIGQ9Im0yMiAzLTguNjQ2IDguNjQ2YS41LjUgMCAwIDEtLjcwOCAwTDkuMzU0IDguMzU0YS41LjUgMCAwIDAtLjcwNyAwTDIgMTUiLz48cGF0aCBkPSJNNCAxOHYzIi8+PHBhdGggZD0iTTggMTR2NyIvPjwvc3ZnPg==")' } as React.CSSProperties}
			>
				STATUS
			</NavbarLink>
			<NavbarLink
				to="/settings"
				style={{ "--icon": 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYyOWQiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvZy1pY29uIGx1Y2lkZS1jb2ciPjxwYXRoIGQ9Ik0xMSAxMC4yNyA3IDMuMzQiLz48cGF0aCBkPSJtMTEgMTMuNzMtNCA2LjkzIi8+PHBhdGggZD0iTTEyIDIydi0yIi8+PHBhdGggZD0iTTEyIDJ2MiIvPjxwYXRoIGQ9Ik0xNCAxMmg4Ii8+PHBhdGggZD0ibTE3IDIwLjY2LTEtMS43MyIvPjxwYXRoIGQ9Im0xNyAzLjM0LTEgMS43MyIvPjxwYXRoIGQ9Ik0yIDEyaDIiLz48cGF0aCBkPSJtMjAuNjYgMTctMS43My0xIi8+PHBhdGggZD0ibTIwLjY2IDctMS43MyAxIi8+PHBhdGggZD0ibTMuMzQgMTcgMS43My0xIi8+PHBhdGggZD0ibTMuMzQgNyAxLjczIDEiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIyIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIvPjwvc3ZnPg==")' } as React.CSSProperties}
			>
				SETTINGS
			</NavbarLink>
		</div>
	)
}

const NavbarLink = (props: { to: string, children: React.ReactNode, style?: React.CSSProperties }) => {
	const path = useResolvedPath(props.to)
	const isActive = useMatch({ path: path.pathname, end: true })

	return (
		<Link
			className={`nav-link ${isActive && "nav-active"}`}
			style={props.style}
			to={props.to}
		>
			{props.children}
		</Link>
	)
}

export default Navbar
