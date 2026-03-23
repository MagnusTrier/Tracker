import "./wheelPicker.css"
import { useState, useRef, useEffect } from "react"


const optionsInt: string[] = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, "0"))
// const optionsDecimals: string[] = Array.from({ length: 100 }, (_, i) => i.toString())

export const WheelPicker = () => {
	return (
		<div>
			<Wheel
				onChange={() => { }}
				options={optionsInt}
			/>
		</div>
	)
}



interface WheelProps {
	onChange: (weight: string) => void;
	options: string[];
}

const Wheel = ({ options }: WheelProps) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const pickerRef = useRef<HTMLDivElement>(null);

	const [selected, setSelected] = useState<string>("0")

	const handleChange = (value: string) => {
		setSelected(value);
	};
	useEffect(() => {
		if (selected && pickerRef.current) {
			const index = options.indexOf(selected);
			if (index >= 0) {
				setCurrentIndex(index);
				const itemHeight = pickerRef.current.offsetHeight / 5; // Assuming 5 items are visible
				pickerRef.current.scrollTop = index * itemHeight;
			}
		}
	}, [selected]);

	const handleScroll = () => {
		if (!pickerRef.current) return;

		const { scrollTop, offsetHeight } = pickerRef.current;
		const itemHeight = offsetHeight / 5; // Assuming 5 items visible at a time
		const index = Math.round(scrollTop / itemHeight);

		setCurrentIndex(index);
		handleChange(optionsInt[index]);
	};

	return (
		<div className="wheel-picker-container">
			<div className="wheel-picker" ref={pickerRef} onScroll={handleScroll}>
				<div style={{ height: '40%' }}></div>
				{optionsInt.map((option, index) => (
					<div
						key={index}
						className={`wheel-picker-item ${index === currentIndex ? 'active' : ''}`}
						style={{ height: '20%' }}
					>
						{option}
					</div>
				))}
				<div style={{ height: '40%' }}></div>
			</div>
		</div>
	);
};
