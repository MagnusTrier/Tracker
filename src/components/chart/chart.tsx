import "./chart.css"
import React, { useMemo, useState, useRef, useEffect } from "react"
import { scaleTime, scaleLinear } from "d3-scale"
import { extent } from "d3-array"
import { line, area, curveCatmullRom } from "d3-shape"
import { format, subDays, startOfDay } from 'date-fns'
import { motion } from 'framer-motion'

const PRIMARY_COLOR = "var(--color-primary)"
const GRID_COLOR = "rgba(40, 40, 48, 0.25)"
const TEXT_COLOR = "var(--text-dim)"
const BG_COLOR = "#16161e"
const TOTAL_DURATION = 1.6
const MARGIN = { top: 20, right: 30, bottom: 30, left: 45 }

const ChartDecor = React.memo(({ yTicks, yScale, xTicks, xScale, width, height, xRangePadded }: any) => (
	<g>
		{yTicks.map((tick: number, i: number) => (
			<g key={i} transform={`translate(0, ${yScale(tick)})`}>
				<line x1={xRangePadded[0] - 5} x2={width - MARGIN.right + 5} style={{ stroke: GRID_COLOR }} />
				<text x={xRangePadded[0] - 10} className="tick" textAnchor="end" alignmentBaseline="middle">
					{tick % 1 === 0 ? tick : tick.toFixed(1)}
				</text>
			</g>
		))}
		{xTicks.map((date: Date, i: number) => (
			<text key={i} x={xScale(date)} y={height - 10} className="tick" style={{ textAnchor: "middle" }}>
				{format(date, 'MMM d').toUpperCase()}
			</text>
		))}
	</g>
))

function D3Chart({ data = [], yAccessor }: { data: any[], yAccessor: string }) {
	const containerRef = useRef<HTMLDivElement>(null)
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

	useEffect(() => {
		if (!containerRef.current) return
		const observer = new ResizeObserver((entries) => {
			window.requestAnimationFrame(() => {
				if (!entries[0]) return
				const { width, height } = entries[0].contentRect
				setDimensions({ width, height: height || 300 })
			})
		})

		observer.observe(containerRef.current)
		return () => {
			observer.disconnect()
		}
	}, [])

	const chartCalculations = useMemo(() => {
		const { width, height } = dimensions
		if (width === 0) return null

		const points = data.map(d => ({
			x: startOfDay(d.date),
			y: d[yAccessor]
		})).sort((a, b) => a.x.getTime() - b.x.getTime())

		const activeData = points.length > 0
		const xDomain = activeData ? (extent(points, d => d.x) as [Date, Date]) : [subDays(new Date(), 7), new Date()]

		let yTicksValues: number[] = []
		let yDomain: [number, number] = [0, 100]

		if (activeData) {
			const [rawMin, rawMax] = extent(points, d => d.y) as [number, number]

			const padding = 0.00375

			const minTick = rawMin * (1 - padding)
			const maxTick = rawMax * (1 + padding)

			const range = maxTick - minTick
			const step = range / 3

			yTicksValues = Array.from({ length: 4 }, (_, i) => {
				return minTick + (step * i)
			})
			yDomain = [minTick, maxTick]
		}

		const xRange = [MARGIN.left, width - MARGIN.right]
		const yRange = [height - MARGIN.bottom, MARGIN.top]

		const xScale = scaleTime().domain(xDomain).range(xRange)
		const yScale = scaleLinear().domain(yDomain).range(yRange)

		const xTicksValues = activeData ? [xDomain[0], new Date((xDomain[0].getTime() + xDomain[1].getTime()) / 2), xDomain[1]] : xScale.ticks(3)

		const curveFunc = curveCatmullRom.alpha(0.5)

		const l = line<any>()
			.x(d => xScale(d.x))
			.y(d => yScale(d.y))
			.curve(curveFunc)

		const a = area<any>()
			.x(d => xScale(d.x))
			.y0(height - MARGIN.bottom)
			.y1(d => yScale(d.y))
			.curve(curveFunc)

		return {
			points,
			xScale,
			yScale,
			xTicks: xTicksValues,
			yTicks: yTicksValues,
			linePath: l(points),
			areaPath: a(points),
			hasData: activeData,
			xRangePadded: xRange
		}
	}, [data, yAccessor, dimensions])


	return (
		<div ref={containerRef} className="chart" >
			{dimensions.width > 0 && chartCalculations
				?
				<svg key={chartCalculations.points.length} width={dimensions.width} height={dimensions.height}>
					<defs>
						<linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor={PRIMARY_COLOR} stopOpacity="0.2" />
							<stop offset="100%" stopColor={PRIMARY_COLOR} stopOpacity="0.0" />
						</linearGradient>
						<filter id="line-glow" x="-50%" y="-50%" width="200%" height="200%">
							<feFlood floodColor="var(--color-primary)" floodOpacity="0.7" result="glow-color" />
							<feComposite in="glow-color" in2="SourceGraphic" operator="in" result="glow-onsource" />
							<feGaussianBlur stdDeviation="1.5" result="blurred-glow" />
							<feMerge>
								<feMergeNode in="blurred-glow" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>
						<mask id="gradient-mask">
							<rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="black" />
							<motion.rect
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.8, ease: "easeInOut", delay: TOTAL_DURATION }}
								width={dimensions.width}
								height={dimensions.height}
								fill="white"
							/>
						</mask>
					</defs>
					<ChartDecor
						{
						...chartCalculations
						}
						width={dimensions.width}
						height={dimensions.height}
					/>
					{
						chartCalculations.hasData &&
						<>
							<motion.path
								d={chartCalculations.areaPath || ""}
								fill="url(#chart-gradient)"
								mask="url(#gradient-mask)"
								stroke="none"
							/>
							<motion.path
								initial={{ pathLength: 0 }}
								animate={{ pathLength: 1 }}
								transition={{ duration: TOTAL_DURATION, ease: "easeInOut", delay: 0.2 }}
								d={chartCalculations.linePath || ""}
								fill="none"
								stroke={PRIMARY_COLOR}
								strokeWidth="2"
								filter="url(#line-glow)"
							/>
							{chartCalculations.points.map((p, i) => (
								<motion.circle
									initial={{ scale: 0, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									transition={{ duration: 0.25, delay: 0.2 + (TOTAL_DURATION / chartCalculations.points.length) * i }}
									key={i}
									r='2.5'
									cx={chartCalculations.xScale(p.x)}
									cy={chartCalculations.yScale(p.y)}
									fill={BG_COLOR}
									stroke={PRIMARY_COLOR}
									strokeWidth="1"
								/>
							))}
						</>
					}
				</svg>
				:
				<div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT_COLOR }}>
					NO RECORDS YET
				</div>
			}
		</div>
	)
}
export default React.memo(D3Chart)
