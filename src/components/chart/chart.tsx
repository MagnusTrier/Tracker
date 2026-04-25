import React, { useRef, useEffect, useMemo, useState } from "react";
import { scaleTime, scaleLinear } from "d3-scale";
import { extent } from "d3-array";
import { line, area, curveCatmullRom } from "d3-shape";
import { startOfDay, format } from "date-fns";

interface CanvasChartProps {
	data: any[];
	yAccessor: string;
	isOnScreen: boolean;
}

const PRIMARY_COLOR = "#9097ff";
const GRID_COLOR = "rgba(255, 255, 255, 0.05)";
const TEXT_COLOR = "rgba(90, 90, 100, 1)";
const BG_COLOR = "#16161e";
const ANIMATION_DURATION = 2400;
const MARGIN = { top: 30, right: 80, bottom: 85, left: 120 };

const CanvasChart = ({ data = [], yAccessor, isOnScreen }: CanvasChartProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const requestRef = useRef<number | null>(null);
	const startTimeRef = useRef<number | null>(null);

	const [isDone, setIsDone] = useState(false);
	const [{ width, height }, setDimensions] = useState({ width: 0, height: 0 });
	const dpr = window.devicePixelRatio || 2;

	useEffect(() => {
		if (!containerRef.current) return;
		const observer = new ResizeObserver((entries) => {
			const { width: w, height: h } = entries[0].contentRect;
			setDimensions({ width: w * dpr, height: h * dpr });
		});
		observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, [dpr]);

	const calculations = useMemo(() => {
		if (width === 0 || data.length < 2) return null;
		setIsDone(false);

		const points = data
			.map((d) => ({ x: startOfDay(new Date(d.date)), y: d[yAccessor] }))
			.sort((a, b) => a.x.getTime() - b.x.getTime());

		const xDomain = extent(points, (d) => d.x) as [Date, Date];
		const [rawMin, rawMax] = extent(points, (d) => d.y) as [number, number];

		const xScale = scaleTime().domain(xDomain).range([MARGIN.left, width - MARGIN.right]);
		const yScale = scaleLinear().domain([rawMin, rawMax]).range([height - MARGIN.bottom, MARGIN.top]);

		const range = rawMax - rawMin;
		const step = range / 3;
		const yTicksValues = Array.from({ length: 4 }, (_, i) => rawMin + step * i);
		const xTicksValues = [xDomain[0], new Date((xDomain[0].getTime() + xDomain[1].getTime()) / 2), xDomain[1]];

		const curveFunc = curveCatmullRom.alpha(0.5);
		const lineGen = line<any>().x(d => xScale(d.x)).y(d => yScale(d.y)).curve(curveFunc);
		const areaGen = area<any>().x(d => xScale(d.x)).y0(height - MARGIN.bottom).y1(d => yScale(d.y)).curve(curveFunc);

		return {
			points, xScale, yScale,
			fullPath: new Path2D(lineGen(points)!),
			areaD: areaGen(points)!,
			yTicks: yTicksValues,
			xTicks: xTicksValues
		};
	}, [data, yAccessor, width, height]);

	useEffect(() => {
		setIsDone(false);
		startTimeRef.current = null;
		if (!canvasRef.current || !calculations || !isOnScreen) return;

		const ctx = canvasRef.current.getContext("2d");
		if (!ctx) return;

		canvasRef.current.width = width;
		canvasRef.current.height = height;

		const renderFrame = (progress: number) => {
			const { xScale, yScale, points, fullPath, yTicks, xTicks } = calculations;
			ctx.clearRect(0, 0, width, height);

			ctx.textAlign = "right";
			ctx.textBaseline = "middle";
			ctx.font = `bold ${20 * (dpr / 2)}px Manrope, sans-serif`;
			ctx.fillStyle = TEXT_COLOR;
			ctx.strokeStyle = GRID_COLOR;
			ctx.lineWidth = 2 * (dpr / 2);

			yTicks.forEach(tick => {
				const y = yScale(tick);
				ctx.beginPath();
				ctx.moveTo(MARGIN.left - 10, y);
				ctx.lineTo(width - MARGIN.right + 10, y);
				ctx.stroke();
				ctx.fillText(tick.toFixed(1), MARGIN.left - 25, y);
			});

			ctx.textAlign = "center";
			xTicks.forEach(tick => {
				ctx.fillText(format(tick, "MMM d").toUpperCase(), xScale(tick), height - MARGIN.bottom + 50);
			});

			// 2. DRAW ANIMATED LINE
			const revealX = MARGIN.left + (width - MARGIN.left - MARGIN.right + 60) * progress;
			ctx.save();
			ctx.beginPath();
			ctx.rect(0, 0, revealX, height);
			ctx.clip();

			ctx.shadowBlur = 15 * (dpr / 2);
			ctx.shadowColor = "rgba(144, 151, 255, 0.4)";
			ctx.strokeStyle = PRIMARY_COLOR;
			ctx.lineWidth = 3 * (dpr / 2);
			ctx.stroke(fullPath);
			ctx.restore();

			points.forEach((point) => {
				const dotX = xScale(point.x);
				const dotY = yScale(point.y);
				const opacity = Math.max(0, Math.min(1, (revealX - dotX + 10) / 40));
				if (opacity > 0) {
					ctx.save();
					ctx.globalAlpha = opacity;
					ctx.beginPath();
					ctx.arc(dotX, dotY, 4.5 * (dpr / 2), 0, Math.PI * 2);
					ctx.fillStyle = BG_COLOR;
					ctx.fill();
					ctx.strokeStyle = PRIMARY_COLOR;
					ctx.lineWidth = 2 * (dpr / 2);
					ctx.stroke();
					ctx.restore();
				}
			});
		};

		const animate = (time: number) => {
			if (!startTimeRef.current) startTimeRef.current = time;
			const p = Math.min((time - startTimeRef.current) / ANIMATION_DURATION, 1);
			renderFrame(p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2); // EaseInOut

			if (p < 0.98) requestRef.current = requestAnimationFrame(animate);
			else setIsDone(true);
		};

		requestRef.current = requestAnimationFrame(animate);
		return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
	}, [calculations, isOnScreen, width, height, dpr]);

	return (
		<div ref={containerRef} style={{ position: "relative", minHeight: 0, aspectRatio: "16/9" }}>
			<canvas ref={canvasRef} style={{ width: "100%", height: "100%", position: "absolute" }} />

			{calculations && (
				<svg viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", width: "100%", height: "100%", pointerEvents: "none" }}>
					<defs>
						<linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor={PRIMARY_COLOR} stopOpacity="0.18" />
							<stop offset="100%" stopColor={PRIMARY_COLOR} stopOpacity="0" />
						</linearGradient>
					</defs>
					<path
						d={calculations.areaD}
						fill="url(#chartFill)"
						style={{
							opacity: (isOnScreen && isDone) ? 1 : 0,
							transition: isDone
								? "opacity 600ms ease-out"
								: "none",
						}}
					/>
				</svg>
			)}
		</div>
	);
};

export default React.memo(CanvasChart);
