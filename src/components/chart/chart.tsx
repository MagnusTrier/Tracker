import "./chart.css"
import React, { useMemo } from "react"
import { scaleTime, scaleLinear } from "d3-scale"
import { extent } from "d3-array"
import { line, area, curveCatmullRom } from "d3-shape"
import { format, subDays, startOfDay } from "date-fns"
import { motion } from "framer-motion"

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
				{format(date, "MMM d").toUpperCase()}
			</text>
		))}
	</g>
))

function D3Chart({ data = [], yAccessor, isOnScreen }: { data: any[], yAccessor: string, isOnScreen: boolean }) {
	const width = 310
	const height = 210

	const chartCalculations = useMemo(() => {
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
	}, [data, yAccessor])


	return (
		<div className="chart" style={{ width: "100%", height: "100%", position: "relative" }}>
			{chartCalculations && isOnScreen
				?
				<svg
					key={chartCalculations.points.length}
					viewBox={`0 0 ${width} ${height}`}
					preserveAspectRatio="none"
					style={{ width: "100%", height: "100%", display: "block" }}
				>
					<defs>
						<linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor={PRIMARY_COLOR} stopOpacity="0.12" />
							<stop offset="100%" stopColor={PRIMARY_COLOR} stopOpacity="0.0" />
						</linearGradient>
						<filter
							id="line-glow"
							x="-10%"
							y="-10%"
							width="120%"
							height="120%"
						>
							<feColorMatrix
								type="matrix"
								values="
								0 0 0 0 0.56
								0 0 0 0 0.59
								0 0 0 0 1.00
								0 0 0 0.6 0
								"
								result="glowColor"
							/>
							<feGaussianBlur stdDeviation="1.5" in="glowColor" result="blurredGlow" />
							<feMerge>
								<feMergeNode in="blurredGlow" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>
					</defs>
					<ChartDecor
						{...chartCalculations}
						width={width}
						height={height}
					/>
					{
						chartCalculations.hasData &&
						<>
							<motion.path
								initial={{ pathLength: 0 }}
								animate={{ pathLength: 1 }}
								transition={{ duration: TOTAL_DURATION, ease: "easeInOut", delay: 0.2 }}
								d={chartCalculations.linePath || ""}
								fill="none"
								stroke={PRIMARY_COLOR}
								strokeWidth="2"
								style={{ transform: "translate3d(0,0,0)", WebkitTransform: "translate3d(0,0,0)", willChange: "transform" }}
							/>
							<motion.g
								initial={{ opacity: 0 }}
								animate={{ opacity: 1, transition: { delay: TOTAL_DURATION, duration: 0.35 } }}
								style={{
									isolation: "isolate",
									pointerEvents: "none"
								}}
							>
								<path
									d={chartCalculations.areaPath || ""}
									fill="url(#chart-gradient)"
									stroke="none"
									style={{ transform: "translate3d(0,0,0)", WebkitTransform: "translate3d(0,0,0)", willChange: "transform", pointerEvents: "none" }}
								/>
								<path
									d={chartCalculations.linePath || ""}
									fill="none"
									stroke={PRIMARY_COLOR}
									strokeWidth="2"
									filter="url(#line-glow)"
									style={{ transform: "translate3d(0,0,0)", WebkitTransform: "translate3d(0,0,0)", willChange: "transform", pointerEvents: "none" }}
								/>
								{chartCalculations.points.map((p, i) => (
									<circle
										key={i}
										r="2.5"
										cx={chartCalculations.xScale(p.x)}
										cy={chartCalculations.yScale(p.y)}
										fill={BG_COLOR}
										stroke={PRIMARY_COLOR}
										strokeWidth="1"
									/>
								))}
							</motion.g>
						</>
					}
				</svg>
				:
				<motion.div
					animate={{ opacity: isOnScreen ? 1 : 0, transition: { delay: 0.2 } }}
					style={{ opacity: 0, position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: TEXT_COLOR }}
				>
					NO RECORDS YET
				</motion.div>
			}
		</div>
	)
}
export default React.memo(D3Chart)
