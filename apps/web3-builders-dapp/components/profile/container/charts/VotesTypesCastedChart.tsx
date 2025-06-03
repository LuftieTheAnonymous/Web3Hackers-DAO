import { Button } from '@/components/ui/button';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import React from 'react'
import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts';

type Props = {proposals:any[], isCustom:boolean}

function VotesTypesCastedChart({proposals, isCustom}: Props) {

  const standardVotingOption={
    votingOption: {
      label: "Votes Casted",
      color: "#00ad48", // Green
    },
   
  } satisfies ChartConfig;

  const customVotingOption={
    votingType: {
      label: "Votes Casted",
      color: "#00ad48", // Green
    },

  } satisfies ChartConfig;

  const chartData= [
    {votingOption:'Approve', value: proposals.filter((prop)=> !prop.isCustom &&  prop.voteOption === 0).length, fill: '#00ad48'},
    {votingOption:'Revoke', value: proposals.filter((prop)=> !prop.isCustom &&  prop.voteOption === 1).length, fill: '#ff4d4f'},
    {votingOption:'Abstain', value: proposals.filter((prop)=> !prop.isCustom && prop.voteOption === 2).length, fill: '#005eff'},
  ];

  const chartCustomData =[
{votingType:'Approving', value: proposals.filter((prop)=> prop.isCustom && !prop.isDefeatingVote && prop.isApprovingVote).length, fill: '#00ad48'},
{votingType:'Rejecting', value: proposals.filter((prop)=> prop.isCustom && prop.isDefeatingVote && !prop.isApprovingVote).length, fill: '#ff4d4f'},
  ]



    return (
<div className='flex flex-col gap-2 w-full'>

    <div className="bg-zinc-800 mt-3 p-4 flex flex-col  text-white border-(--hacker-green-4) border  rounded-lg max-w-2xl h-80 w-full">
<p className='text-lg font-bold'>Types Of Casted Votes</p>

<ChartContainer config={isCustom ? customVotingOption : standardVotingOption} className="w-full h-64">
    <BarChart
            accessibilityLayer
            data={isCustom ? chartCustomData : chartData}
            layout="vertical"
            margin={{
              left: -20,
            }}
          >
          
          
            <XAxis type="number" dataKey='value'  />
        <Bar
              dataKey="value"
              radius={[6, 6, 6, 6]}
              isAnimationActive={true}
              className="cursor-pointer"
            >
              {chartCustomData.map((entry, index) => (
                <Cell  key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          
            <YAxis
  dataKey={isCustom ? 'votingType' : 'votingOption'}
  type="category"
  tickLine={false}
  tickMargin={10}
  axisLine={false}
/>




            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent label={isCustom ? 'votingType' : 'votingOption'} />}
            />

          </BarChart>
</ChartContainer>


</div>
</div>
  )
}

export default VotesTypesCastedChart



