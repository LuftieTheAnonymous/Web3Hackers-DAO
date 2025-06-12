"use client"

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"

import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useSidebar } from "@/components/ui/sidebar";




const standardVotingChartConfig = {
  voteOption: {
    label: "Vote Option",
    color: "#00e660",
  },

} satisfies ChartConfig;


const customVotingChartConfig = {
  voteOption:{
    label: "Vote Option",
    color: "#00b643",
  },
  
}satisfies ChartConfig;

type Props = {
  chartData: any[],
  isCustom: boolean
}

function VotingResultChart({chartData, isCustom}: Props) {
  const {state}=useSidebar();
  return (
    <ChartContainer config={isCustom ? customVotingChartConfig : standardVotingChartConfig} className={`w-full p-2 bg-zinc-800 border border-(--hacker-green-4) rounded-lg ${state === 'expanded' ? 'max-w-lg lg:max-w-md' : 'max-w-xl'} min-h-72`}>
      <BarChart accessibilityLayer data={chartData}>
<CartesianGrid vertical={false} />
<XAxis dataKey={'voteOption'} tickLine={false} axisLine={false} />

<YAxis dataKey={'value'}/>
<Bar
  dataKey="value"
  radius={6}
  isAnimationActive={false}
  fill="#00e660"
  className="cursor-pointer"
>
  {chartData.map((entry, index) => (
    <Cell key={`cell-${index}`} fill={entry.fill} />
  ))}
</Bar>

        <ChartTooltip content={<ChartTooltipContent  labelKey="voteOption" />}/>
        <ChartLegend content={<ChartLegendContent  nameKey="voteOption"/>}/>
      </BarChart>
    </ChartContainer>
  )
}

export default VotingResultChart