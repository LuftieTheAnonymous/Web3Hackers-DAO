import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import React from 'react'
import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts';

type Props = {proposals:any[], isCustom:boolean}

function VotesTypesCastedChart({proposals, isCustom}: Props) {

  const standardVotingOption={
    Approve: {
      label: "Approve",
      color: "#00ad48", // Green
    },
    Revoke: {
      label: "Revoke",
      color: "#ff4d4f", // Red
    },
    Abstain: {
      label: "Abstain",
      color: "#005eff", // Blue
    },
   
  } satisfies ChartConfig;

  const customVotingOption={
    voteOption: {
      label: "Votes Casted",
      color: "#00ad48", // Green
    },
   

  } satisfies ChartConfig;

  const chartData= [
    {votingOption:'Approving', Approve:'Approve', value: proposals.filter((prop)=> !prop.isCustom && prop.voteOption === 0).length, fill: '#00ad48'},
    {votingOption:'Revoking', Revoke:'Revoke', value: proposals.filter((prop)=> !prop.isCustom && prop.voteOption === 1).length, fill: '#ff4d4f'},
    {votingOption:'Abstaining', Abstain:'Abstain', value: proposals.filter((prop)=> !prop.isCustom && prop.voteOption === 2).length, fill: '#005eff'},
  ];

  const chartCustomData =[
{voteOption:'Approving', 
  value: proposals.filter((prop)=> prop.isCustom && !prop.isDefeatingVote && prop.isApprovingVote).length, 
  fill: '#00ad48'},
{voteOption:'Rejecting',
   value: proposals.filter((prop)=> prop.isCustom && prop.isDefeatingVote && !prop.isApprovingVote).length, 
   fill: '#ff4d4f'},
   {voteOption:'Abstaining',
   value: proposals.filter((prop)=> prop.isCustom && !prop.isDefeatingVote && !prop.isApprovingVote).length, 
   fill: '#005eff'},
  ]



    return (
<div className='flex flex-col gap-2 w-full items-center'>

    <div className="bg-zinc-800 p-4 flex flex-col  text-white border-(--hacker-green-4) border  rounded-lg max-w-xl  lg:max-w-2xl h-80 w-full">
<p className='text-lg font-bold'>Types Of Casted Votes</p>

{proposals.length > 0 && <ChartContainer config={isCustom ? customVotingOption : standardVotingOption} className="w-full max-h-64 h-full">
    <BarChart
            accessibilityLayer
            data={isCustom ? chartCustomData : chartData}
            layout="vertical"
            margin={{
              left: -20,
            }}
          >
            <XAxis  type="number" dataKey='value'  />
        <Bar
              dataKey="value"
              radius={[6, 6, 6, 6]}
              isAnimationActive={true}
              className="cursor-pointer"
             label={{ position: 'right', fill: '#fff', formatter: (value:any) => `${value}` }}
            >
              {isCustom ? chartCustomData.map((entry, i) => <Cell key={i} fill={entry.fill} />) : chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Bar>
          
            <YAxis
  dataKey={'votingOption'}
  type="category"
  tickLine={false}
  tickMargin={10}
  axisLine={false}
/>




            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent label={'votingOption'} />}
            />

          </BarChart>
</ChartContainer>}


</div>
</div>
  )
}

export default VotesTypesCastedChart



