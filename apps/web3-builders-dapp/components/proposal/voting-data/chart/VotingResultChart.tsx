"use client"

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"

import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useSidebar } from "@/components/ui/sidebar";
import { FaCheckCircle, FaDiceFive, FaDiceFour, FaDiceOne, FaDiceThree, FaDiceTwo, FaHandHolding } from "react-icons/fa";
import { MdCancel } from "react-icons/md";




const standardVotingChartConfig = {
  Approve: {
    label: "Approve",
    icon: FaCheckCircle,
    color: "#00e660",
  },
  Abstain: {
    label: "Abstain",
    icon: FaHandHolding,
    color: "#0080ff",
  },
  Defeat: {
    label: "Defeat",
    icon: MdCancel,
    color: "#ff0000",
  },
};



const customVotingChartConfig = {
  "Option 1": {
    label: "Option 1",
    icon: FaDiceOne,
    color: "#f6cd00",
  },
  "Option 2": {
    label: "Option 2",
    icon: FaDiceTwo,
    color: "#00e660",
  },
  "Option 3": {
    label: "Option 3",
    icon: FaDiceThree,
    color: "#006aff",
  },
  "Option 4": {
    label: "Option 4",
    icon: FaDiceFour,
    color: "#ff00a1",
  },
  "Option 5": {
    label: "Option 5",
    icon: FaDiceFive,
    color: "#59008c",
  },
};


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
        <ChartLegend content={<ChartLegendContent payload={chartData}  nameKey="voteOption"/>}/>
      </BarChart>
    </ChartContainer>
  )
}

export default VotingResultChart