import "./App.css"
import { useState } from 'react';
// import { supabase, type WeightEntry } from './lib/supabase';
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules";
import { WeightComponent } from "./components/weight/weightComponent";

function App() {
	// const [logs, setLogs] = useState<WeightEntry[]>([]);
	// const [inputValue, setInputValue] = useState('');
	const [currentPage, setCurrentPage] = useState<number>(0)

	// 1. READ: Get data when the component loads
	// async function getWeights() {
	// 	const { data, error } = await supabase
	// 		.from('weight_logs') // Name of your table in Supabase
	// 		.select('*')
	// 		.order('created_at', { ascending: false });
	//
	// 	if (error) console.error('Error fetching:', error);
	// 	else setLogs(data || []);
	// }

	// useEffect(() => {
	// 	getWeights();
	// }, []);

	// 2. CREATE: Send new weight to Supabase
	// async function handleSubmit(e: React.FormEvent) {
	// 	e.preventDefault();
	// 	const numWeight = parseFloat(inputValue);
	// 	if (isNaN(numWeight)) return;
	//
	// 	const { error } = await supabase
	// 		.from('weight_logs')
	// 		.insert([{ weight: numWeight }]);
	//
	// 	if (!error) {
	// 		setInputValue('');
	// 		getWeights(); // Refresh the list
	// 	}
	// }

	// 3. DELETE: Remove a row by its ID
	// async function deleteEntry(id: number) {
	// 	await supabase.from('weight_logs').delete().eq('id', id);
	// 	getWeights();
	// }

	return (
		<div className="app-container">
			<Swiper
				className="swiper-container"
				slidesPerView={1}
				threshold={10}
				onSlideChange={(e) => setCurrentPage(e.activeIndex)}
				allowSlidePrev={currentPage !== 0}
				modules={[Pagination]}
				pagination={{ dynamicBullets: true }}
				style={{ position: "relative" }}
			>
				<SwiperSlide
					key="slide-1"
					className="swiper-slide"
				>
					<WeightComponent />
				</SwiperSlide>
				<SwiperSlide
					key="slide-2"
					className="swiper-slide"
				>
					<div
						className="card blur"
					>
						Slide 2
					</div>
				</SwiperSlide>
			</Swiper>
			{/* <h1>Weight Tracker</h1> */}
			{/**/}
			{/* <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}> */}
			{/* 	<input */}
			{/* 		type="number" */}
			{/* 		step="0.1" */}
			{/* 		value={inputValue} */}
			{/* 		onChange={(e) => setInputValue(e.target.value)} */}
			{/* 		placeholder="Weight (kg/lbs)" */}
			{/* 	/> */}
			{/* 	<button type="submit">Log It</button> */}
			{/* </form> */}
			{/**/}
			{/* <WheelPicker /> */}
			{/* <ul> */}
			{/* 	{logs.map((log) => ( */}
			{/* 		<li key={log.id} style={{ marginBottom: '10px' }}> */}
			{/* 			{log.weight} - {new Date(log.created_at).toLocaleDateString()} */}
			{/* 			<button onClick={() => deleteEntry(log.id)} style={{ marginLeft: '10px' }}>×</button> */}
			{/* 		</li> */}
			{/* 	))} */}
			{/* </ul> */}
			<div className="paginator-display blur">
			</div>
		</div>
	);
}

export default App;
