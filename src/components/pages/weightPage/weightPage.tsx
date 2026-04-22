import "./weightPage.css"
import Swiper from "../../swiper/swiper"
import WeightComponent from "./weight/weightComponent"

const WeightPage = () => {
	return (
		<Swiper slides={[<WeightComponent isOnScreen />, <span>page 2</span>]} />
	)
}

export default WeightPage
