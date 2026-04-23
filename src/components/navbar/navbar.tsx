import "./navbar.css"
import { Link, useResolvedPath, useMatch } from "react-router-dom";
import { ChartNoAxesCombined, Weight, Dumbbell, Cog } from "lucide-react"

const Navbar = () => {
	return (
		<div
			className="navbar"
		>
			<NavbarLink to="/weight">
				<Weight strokeWidth="1.5" height="28" />
				WEIGHT
			</NavbarLink>
			<NavbarLink to="/workout">
				<Dumbbell strokeWidth="1.5" size="28" />
				WORKOUT
			</NavbarLink>
			<NavbarLink to="/status">
				<ChartNoAxesCombined strokeWidth="1.5" size="28" />
				STATUS
			</NavbarLink>
			<NavbarLink to="/settings">
				<Cog strokeWidth="1.5" size="28" />
				SETTINGS
			</NavbarLink>
		</div>
	)
}

const NavbarLink = (props: { to: string, children: React.ReactNode }) => {
	const path = useResolvedPath(props.to)
	const isActive = useMatch({ path: path.pathname, end: true })

	return (
		<Link
			className={`nav-link ${isActive && "nav-active"}`}
			to={props.to}
		>
			{props.children}
		</Link>
	)
}

export default Navbar
