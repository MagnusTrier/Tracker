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
	const requestRef = useRef<number | null>(null);
	const startTimeRef = useRef<number | null>(null);

	const [isDone, setIsDone] = useState(false);

	const dpr = 3;
	const width = 340 * dpr;
	const height = width * 9 / 16;

	const calculations = useMemo(() => {
		setIsDone(false)
		const points = data
			.map((d) => ({
				x: startOfDay(new Date(d.date)),
				y: d[yAccessor],
			}))
			.sort((a, b) => a.x.getTime() - b.x.getTime());

		if (points.length < 2) return null;

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
			points,
			xScale,
			yScale,
			fullPath: new Path2D(lineGen(points)!),
			areaD: areaGen(points)!,
			yTicks: yTicksValues,
			xTicks: xTicksValues
		};
	}, [data, yAccessor, width, height]);

	useEffect(() => {
		// 1. Instantly hide gradient whenever data or view changes
		setIsDone(false);
		startTimeRef.current = null;

		if (!canvasRef.current || !calculations || !isOnScreen) return;

		const ctx = canvasRef.current.getContext("2d");
		if (!ctx) return;

		const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

		const renderFrame = (progress: number) => {
			ctx.clearRect(0, 0, width, height);
			const { xScale, yScale, points, fullPath } = calculations;
			const revealX = MARGIN.left + (width - MARGIN.left - MARGIN.right + 60) * progress;

			ctx.save();
			ctx.beginPath();
			ctx.rect(0, 0, revealX, height);
			ctx.clip();

			ctx.shadowBlur = 15;
			ctx.shadowColor = "rgba(144, 151, 255, 0.4)";
			ctx.strokeStyle = PRIMARY_COLOR;
			ctx.lineWidth = 5;
			ctx.lineJoin = "round";
			ctx.lineCap = "round";
			ctx.stroke(fullPath);
			ctx.restore();

			points.forEach((point) => {
				const dotX = xScale(point.x);
				const dotY = yScale(point.y);
				const distancePastDot = revealX - dotX;
				const opacity = Math.max(0, Math.min(1, (distancePastDot + 10) / 40));

				if (opacity > 0) {
					ctx.save();
					ctx.globalAlpha = opacity;
					const s = 0.8 + (0.2 * opacity);
					ctx.beginPath();
					ctx.arc(dotX, dotY, 7 * s, 0, Math.PI * 2);
					ctx.fillStyle = BG_COLOR;
					ctx.fill();
					ctx.strokeStyle = PRIMARY_COLOR;
					ctx.lineWidth = 4;
					ctx.stroke();
					ctx.restore();
				}
			});
		};

		const animate = (time: number) => {
			if (!startTimeRef.current) startTimeRef.current = time;
			const p = Math.min((time - startTimeRef.current) / ANIMATION_DURATION, 1);
			renderFrame(easeInOutQuad(p));

			if (p < 1 - 0.1) {
				requestRef.current = requestAnimationFrame(animate);
			} else {
				// 2. Trigger gradient bloom once line is complete
				setIsDone(true);
			}
		};

		requestRef.current = requestAnimationFrame(animate);

		return () => {
			if (requestRef.current) cancelAnimationFrame(requestRef.current);
		};
	}, [calculations, isOnScreen, width, height]);

	if (!calculations) return null;

	return (
		<div className="chart-container" style={{ position: "relative", width: "100%", aspectRatio: 16 / 9 }}>
			<svg
				viewBox={`0 0 ${width} ${height}`}
				preserveAspectRatio="none"
				style={{
					position: "absolute",
					top: 0, left: 0, width: "100%", height: "100%",
					pointerEvents: "none", zIndex: 0
				}}
			>
				<defs>
					<linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor={PRIMARY_COLOR} stopOpacity="0.18" />
						<stop offset="100%" stopColor={PRIMARY_COLOR} stopOpacity="0" />
					</linearGradient>
				</defs>

				{/* Grid Lines */}
				{calculations.yTicks.map((tick, i) => (
					<g key={`${i}-${tick}`}>
						<line
							x1={MARGIN.left - 10}
							x2={width - MARGIN.right + 10}
							y1={calculations.yScale(tick)}
							y2={calculations.yScale(tick)}
							stroke={GRID_COLOR}
							strokeWidth="2"
						/>
						<text
							x={MARGIN.left - 25}
							y={calculations.yScale(tick)}
							fill={TEXT_COLOR}
							fontSize="30"
							fontWeight="700"
							fontFamily="Manrope Variable, sans-serif"
							textAnchor="end"
							dominantBaseline="middle"
						>
							{tick.toFixed(1)}
						</text>
					</g>
				))}

				{/* X-Axis Labels */}
				{calculations.xTicks.map((tick, i) => (
					<text
						key={`${i}-${tick.getTime()}`}
						x={calculations.xScale(tick)}
						y={height - MARGIN.bottom + 50}
						fill={TEXT_COLOR}
						fontSize="28"
						fontWeight="700"
						fontFamily="Manrope Variable, sans-serif"
						textAnchor="middle"
					>
						{format(tick, "MMM d").toUpperCase()}
					</text>
				))}

				{/* Reactive Gradient Path */}
				<path
					d={calculations.areaD}
					fill="url(#chartFill)"
					style={{
						opacity: (isOnScreen && isDone) ? 1 : 0,
						// "none" when isDone is false so it vanishes instantly on data change
						transition: isDone ? "opacity 500ms ease-out" : "none"
					}}
				/>
			</svg>

			{/* CANVAS LAYER: GPU Path Animation */}
			<canvas
				ref={canvasRef}
				width={width}
				height={height}
				style={{
					position: "absolute",
					top: 0, left: 0, width: "100%", height: "100%",
					display: "block", zIndex: 1
				}}
			/>
		</div>
	);
};

export default React.memo(CanvasChart);
