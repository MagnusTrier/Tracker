import "./chart.css";
import { useMemo, useState, useRef, useEffect } from "react";
import { scaleTime, scaleLinear } from "d3-scale"
import { extent } from "d3-array"
import { line, area, curveCatmullRom } from "d3-shape"
import { format, subDays, startOfDay } from 'date-fns';
import { motion } from 'framer-motion';

// CONFIGURATION
const PRIMARY_COLOR = "var(--color-primary)";
const GRID_COLOR = "rgba(40, 40, 48, 1)";
const TEXT_COLOR = "var(--text-dim)";
const BG_COLOR = "#16161e";

export function D3Chart({ data = [], yAccessor }: { data: any[], yAccessor: string }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	useEffect(() => {
		if (!containerRef.current) return;
		const resizeObserver = new ResizeObserver((entries) => {
			for (let entry of entries) {
				const { width, height } = entry.contentRect;
				setDimensions({ width, height: height || 300 });
			}
		});
		resizeObserver.observe(containerRef.current);
		return () => resizeObserver.disconnect();
	}, []);

	const { points, xScale, yScale, linePath, areaPath, hasData, xTicks, yTicks, xRangePadded } = useMemo(() => {
		const margin = { top: 20, right: 30, bottom: 30, left: 50 };
		const { width, height } = dimensions;

		const pts = data.map(d => ({
			x: startOfDay(new Date(d.date)),
			y: d[yAccessor],
		})).sort((a, b) => a.x.getTime() - b.x.getTime());

		const activeData = pts.length > 0;

		const xDomain = activeData
			? (extent(pts, d => d.x) as [Date, Date])
			: [subDays(new Date(), 7), new Date()];

		let yTicksValues: number[] = [];
		let yDomain: [number, number] = [0, 100];

		if (activeData) {
			const [rawMin, rawMax] = extent(pts, d => d.y) as [number, number];

			const padding = 0.0075 / 2;
			const nTicks = 4;

			const minTick = rawMin * (1 - padding);
			const maxTick = rawMax * (1 + padding);

			const range = maxTick - minTick;
			const step = range / (nTicks - 1);

			yTicksValues = Array.from({ length: nTicks }, (_, i) => {
				return minTick + (step * i);
			});
			yDomain = [minTick, maxTick];
		}

		const xRange = [margin.left, width - margin.right];
		const yRange = [height - margin.bottom, margin.top];

		const x = scaleTime().domain(xDomain).range(xRange);

		const y = scaleLinear().domain(yDomain).range(yRange);
		let xTicksValues: Date[] = [];
		if (activeData) {
			const xStart = xDomain[0].getTime();
			const xEnd = xDomain[1].getTime();
			xTicksValues = [new Date(xStart), new Date((xStart + xEnd) / 2), new Date(xEnd)];
		} else {
			xTicksValues = x.ticks(3);
		}

		const curveFunc = curveCatmullRom.alpha(0.5);

		const l = line<any>()
			.x(d => x(d.x))
			.y(d => y(d.y))
			.curve(curveFunc);

		const a = area<any>()
			.x(d => x(d.x))
			.y0(height - margin.bottom)
			.y1(d => y(d.y))
			.curve(curveFunc);

		return {
			points: pts,
			xScale: x,
			yScale: y,
			xTicks: xTicksValues,
			yTicks: yTicksValues,
			linePath: l(pts),
			areaPath: a(pts),
			hasData: activeData,
			xRangePadded: xRange
		};
	}, [data, yAccessor, dimensions]);

	const styles = {
		container: { width: '100%', height: '100%', minHeight: '200px', position: 'relative' as const },
		svg: { display: 'block', overflow: 'visible' },
		gridLine: { stroke: GRID_COLOR, opacity: 0.5 },
	};

	const TOTAL_DURATION = 1.6;

	return (
		<div ref={containerRef} className="chart" style={styles.container}>
			{dimensions.width > 0 && (
				<svg key={JSON.stringify(data)} width={dimensions.width} height={dimensions.height} style={styles.svg}>
					<defs>
						<linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor={PRIMARY_COLOR} stopOpacity="0.2" />
							<stop offset="100%" stopColor={PRIMARY_COLOR} stopOpacity="0.0" />
						</linearGradient>
						<filter id="line-glow" x="-50%" y="-50%" width="200%" height="200%">
							<feFlood floodColor="var(--color-primary)" floodOpacity="0.7" result="glow-color" />
							<feComposite in="glow-color" in2="SourceGraphic" operator="in" result="glow-onsource" />
							<feGaussianBlur stdDeviation="3.5" result="blurred-glow" />
							<feMerge>
								<feMergeNode in="blurred-glow" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>
						<mask id="gradient-mask">
							<rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="black" />
							<motion.rect
								initial={{ opacity: 0, width: xRangePadded[1] }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.8, ease: "easeInOut", delay: TOTAL_DURATION }}
								y="0" height={dimensions.height} fill="white"
							/>
						</mask>
					</defs>
					{yTicks.map((tick, i) => (
						<g key={i} transform={`translate(0, ${yScale(tick)})`}>
							<line x1={xRangePadded[0] - 10} x2={dimensions.width - 20} style={styles.gridLine} />
							<text x={xRangePadded[0] - 15} className="tick" textAnchor="end" alignmentBaseline="middle">
								{tick % 1 === 0 ? tick : tick.toFixed(1)}
							</text>
						</g>
					))}
					{xTicks.map((date, i) => (
						<text key={i} x={xScale(date)} y={dimensions.height - 10} className="tick" style={{ textAnchor: "middle" }}>
							{format(date, 'MMM d').toUpperCase()}
						</text>
					))}

					{hasData && (
						<>
							<motion.path
								d={areaPath || ""}
								fill="url(#chart-gradient)"
								mask="url(#gradient-mask)"
								stroke="none"
							/>

							<motion.path
								initial={{ pathLength: 0 }}
								animate={{ pathLength: 1 }}
								transition={{ duration: TOTAL_DURATION, ease: "easeInOut", delay: 0.2 }}
								d={linePath || ""}
								fill="none"
								stroke={PRIMARY_COLOR}
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								filter="url(#line-glow)"
							/>

							{points.map((p, i) => (
								<motion.circle
									initial={{ scale: 0, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									transition={{ duration: 0.25, delay: 0.2 + (TOTAL_DURATION / points.length) * i }}
									key={i}
									r='2.5'
									cx={xScale(p.x)}
									cy={yScale(p.y)}
									fill={BG_COLOR}
									stroke={PRIMARY_COLOR}
									strokeWidth="1"
								/>
							))}
						</>
					)}
				</svg>
			)}
			{!hasData && (
				<div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT_COLOR }}>
					NO RECORDS YET
				</div>
			)}
		</div>
	);
}
