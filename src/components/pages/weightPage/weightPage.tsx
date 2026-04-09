import "./weightPage.css"
import Swiper from "../../swiper/swiper"
import WeightComponent from "./weight/weightComponent"
import { PageContainer } from "../../generics"

const WeightPage = () => {
	return (
		<PageContainer>
			<Swiper slides={[<WeightComponent isOnScreen />, <span>page 2</span>]} />
		</PageContainer>
	)
}

export default WeightPage
