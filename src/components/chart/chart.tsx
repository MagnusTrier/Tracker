import "./chart.css"
import { useMemo, useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import { format, parseISO, subDays } from 'date-fns';
import { motion } from 'framer-motion';

export function D3Chart({ data = [], yAccessor }: { data: any[], yAccessor: string }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	useEffect(() => {
		if (!containerRef.current) return;
		const resizeObserver = new ResizeObserver((entries) => {
			for (let entry of entries) {
				const { width, height } = entry.contentRect;
				setDimensions({ width, height: height || 400 });
			}
		});
		resizeObserver.observe(containerRef.current);
		return () => resizeObserver.disconnect();
	}, []);

	const { points, xScale, yScale, linePath, hasData, xTicks, yTicks } = useMemo(() => {
		const margin = { top: 20, right: 30, bottom: 30, left: 50 };
		const { width, height } = dimensions;

		const pts = data.map(d => ({
			x: typeof d.created_at === 'string' ? parseISO(d.created_at) : d.created_at,
			y: Number(d[yAccessor]),
		})).sort((a, b) => a.x.getTime() - b.x.getTime());

		const activeData = pts.length > 0;

		const xDomain = activeData
			? (d3.extent(pts, d => d.x) as [Date, Date])
			: [subDays(new Date(), 7), new Date()];

		const yDomain = activeData ? (() => {
			const [min, max] = d3.extent(pts, d => d.y) as [number, number];
			const padding = (max - min) * 0.1;
			return [min - padding, max + padding] as [number, number];
		})() : [0, 100];

		const x = d3.scaleTime().domain(xDomain).range([margin.left, width - margin.right]);
		const y = d3.scaleLinear().domain(yDomain).range([height - margin.bottom, margin.top]);

		let yTicksValues: number[] = [];
		let xTicksValues: Date[] = [];

		if (activeData) {
			// Y Ticks: [Min, Mid, Max]
			const yMin = yDomain[0];
			const yMax = yDomain[1];
			const step = (yMax - yMin) / 4; // 4 segments = 5 ticks

			yTicksValues = [
				yMin,
				yMin + step,
				yMin + step * 2,
				yMin + step * 3,
				yMax
			];
			// X Ticks: [Start, Mid, End]
			const xStart = xDomain[0].getTime();
			const xEnd = xDomain[1].getTime();
			xTicksValues = xStart === xEnd
				? [new Date(xStart)]
				: [new Date(xStart), new Date((xStart + xEnd) / 2), new Date(xEnd)];
		} else {
			yTicksValues = [0, 50, 100];
			xTicksValues = x.ticks(3);
		}

		const line = d3.line<any>()
			.x(d => x(d.x))
			.y(d => y(d.y))
			.curve(d3.curveMonotoneX);

		return {
			points: pts,
			xScale: x,
			yScale: y,
			xTicks: xTicksValues,
			yTicks: yTicksValues,
			linePath: line(pts),
			hasData: activeData
		};
	}, [data, yAccessor, dimensions]);

	const styles = {
		container: { width: '100%', height: '100%', minHeight: '200px', position: 'relative' as const },
		svg: { display: 'block', overflow: 'visible' }, // Changed to visible so edge labels aren't cut
		gridLine: { stroke: 'rgba(40, 40, 48, 1)', opacity: 0.5 },
		axisText: { fill: 'rgba(180, 180, 200, 0.7)', fontSize: '10px', fontFamily: 'sans-serif' }
	};

	return (
		<div ref={containerRef} className="chart" style={styles.container}>
			{dimensions.width > 0 && (
				<svg width={dimensions.width} height={dimensions.height} style={styles.svg}>
					{/* Explicit Y Ticks */}
					{yTicks.map((tick, i) => (
						<g key={i} transform={`translate(0, ${yScale(tick)})`}>
							<line x1={40} x2={dimensions.width - 20} style={styles.gridLine} />
							<text x={35} style={styles.axisText} textAnchor="end" alignmentBaseline="middle">
								{Math.round(tick * 10) / 10}
							</text>
						</g>
					))}

					{xTicks.map((date, i) => {
						let anchor = "middle";
						return (
							<text
								key={i}
								x={xScale(date)}
								y={dimensions.height - 5}
								style={{ ...styles.axisText, textAnchor: anchor as any }}
							>
								{format(date, 'MMM d')}
							</text>
						);
					})}

					{hasData && (
						<>
							<motion.path
								initial={{ pathLength: 0 }}
								animate={{ pathLength: 1 }}
								d={linePath || ""}
								fill="none"
								stroke="var(--color-primary)"
								strokeWidth="1.5"
							/>
							{points.map((p, i) => (
								<circle
									key={i}
									cx={xScale(p.x)}
									cy={yScale(p.y)}
									r="3"
									fill="var(--bg-color, #000)"
									stroke="var(--color-primary)"
									strokeWidth="1.5"
								/>
							))}
						</>
					)}
				</svg>
			)}
			{!hasData && (
				<div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
					No data available
				</div>
			)}
		</div>
	);
}
