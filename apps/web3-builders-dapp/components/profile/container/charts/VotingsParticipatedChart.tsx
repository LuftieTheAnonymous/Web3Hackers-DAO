
"use client"

import * as React from "react"
import { Cell, Label, Pie, PieChart, ResponsiveContainer } from "recharts"



import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A donut chart with text"



type Props = {
  proposals:any[]
}

function VotingsParticipatedChart({proposals}: Props) {
  

  const chartData = [
  { votingType: "customVoting", votesGiven: proposals.filter((vote)=> vote.isCustom).length, fill: "#005eff" },
  { votingType: "standardVoting", votesGiven: proposals.filter((vote)=> !vote.isCustom).length, fill: "#00f3ae" },
]

const chartConfig = {
  votesGiven: {
    label: "Votes Casted",
  
  },
  customVoting: {
    label: "Custom",

  },
  standardVoting: {
    label: "Standard",
    color: "(--hacker-green-4)",
  },
} satisfies ChartConfig



    const allVotes = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.votesGiven, 0)
  }, [])


  return (
    <div className="bg-zinc-800  
p-6 flex flex-col justify-center text-white border border-(--hacker-green-4) items-center rounded-lg max-w-xs md:max-w-sm h-80 w-full">
<p className="text-lg font-bold">Votings Participated </p>
<ChartContainer
config={chartConfig}
  className="w-full h-full">
   <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
        <Pie
  data={chartData}
  dataKey="votesGiven"
  nameKey="votingType"
  innerRadius={60}
  strokeWidth={5}
  stroke="var(--color-zinc-800)"
>
  {chartData.map((entry, index) => (
    <Cell key={`cell-${index}`} fill={entry.fill} />
  ))}
  <Label
    content={({ viewBox }) => {
      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
        return (
          <text
            x={viewBox.cx}
            y={viewBox.cy}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            <tspan
              x={viewBox.cx}
              y={viewBox.cy}
              className="fill-white text-2xl font-bold"
            >
              {allVotes.toLocaleString()}
            </tspan>
            <tspan
              x={viewBox.cx}
              y={(viewBox.cy || 0) + 24}
              className="fill-white text-sm font-semibold"
            >
              Votes Casted
            </tspan>
          </text>
        )
      }
    }}
  />
</Pie>

          </PieChart>
</ChartContainer>
    </div>
  )
}

export default VotingsParticipatedChart