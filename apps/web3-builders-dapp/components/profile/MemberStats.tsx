import React from 'react'
import VotingsParticipatedChart from './container/charts/VotingsParticipatedChart'
import { useReadContract } from 'wagmi'
import { GOVERNOR_CONTRACT_ADDRESS, governorContractAbi } from '@/contracts/governor/config';
import VotesTypesCastedChart from './container/charts/VotesTypesCastedChart';
import { Button } from '../ui/button';
import  format  from 'date-fns/format';
import { FaCoins } from 'react-icons/fa';
import Lottie from 'lottie-react';

import notFound from '@/public/gifs/Not-found-Lottie.json';

type Props = {walletAddress:`0x${string}`, monthActivities:any[]

};

function MemberStats({walletAddress, monthActivities}: Props) {

const [isCustom, setIsCustom] = React.useState(false);
  const {data:userVotedProposalsCount} = useReadContract({
    abi: governorContractAbi,
    address: GOVERNOR_CONTRACT_ADDRESS,
    functionName: 'getUserVotedCount',
    args:[walletAddress]
  });

  const {data:userVotes} = useReadContract({
    abi: governorContractAbi,
    address: GOVERNOR_CONTRACT_ADDRESS,
    functionName: 'getUserVotes',
    args:[walletAddress]
  });



  return (
    <div className='max-w-[97.5rem] p-3 w-full mx-auto'>

<div  className="flex flex-col gap-1">
<p className='text-white text-2xl font-semibold'>Member's Statistics </p>
<p className='text-gray-500 text-sm'> Here's a summary of your stats in the DAO so far.</p>
</div>


<div className={`flex items-center
gap-3 py-4`}>
  <Button onClick={()=>{setIsCustom(true)}} className={`cursor-pointer ${isCustom ? `bg-(--hacker-green-3)` : `bg-zinc-800`}`}>Custom</Button>
  <Button onClick={()=>{setIsCustom(false)}} className={`cursor-pointer ${!isCustom ? `bg-(--hacker-green-3)` : `bg-zinc-800`}`}>Standard</Button>
</div>

{userVotes && userVotedProposalsCount  && (userVotedProposalsCount as any) && Number((userVotedProposalsCount as any)) !== 0 &&   Number((userVotedProposalsCount as BigInt)) !== 0 &&
<div className=
{`flex  gap-6 w-full max-w-6xl mx-auto
 flex-col sm:flex-row
items-center  justify-center py-2`}>

 <VotingsParticipatedChart proposals={(userVotes as any[])}/>


 <VotesTypesCastedChart isCustom={isCustom} proposals={(userVotes as any[])}  />

</div>
}

<div className="max-w-4xl mt-2 w-full flex-col mx-auto gap-2 flex">
<p className='text-white text-2xl flex items-center gap-2 font-semibold'> <FaCoins className='text-(--hacker-green-4)'/> Monthly Token Distribution</p>
<div className="h-80 w-full bg-zinc-800 rounded-lg flex flex-col gap-2 items-center border-2 border-(--hacker-green-4) p-2 max-w-3xl">
  {monthActivities.length === 0 && <>
  <p className='text-white text-lg font-semibold'>No monthly activities found</p>

  <Lottie loop animationData={notFound}/>
  
  </>}
  {monthActivities.length > 0 && monthActivities.map((activity, index)=>(<div key={index} className='flex justify-between items-center gap-2 bg-zinc-600 p-4 rounded-lg max-w-9/10 w-full'>
   <div className="flex flex-col gap-1">
     <p className='text-white text-base font-semibold'>{format(activity.reward_month, 'MM-yyyy')}</p>
     <p className={`${activity.is_rewarded ? 'text-(--hacker-green-4)' : 'text-zinc-400'} text-sm`}>{activity.is_rewarded ? 'Rewarded ✅' : 'Not Rewarded Yet ❌'}</p>
   </div>

<div className="flex items-center gap-1">
     <p className='text-(--hacker-green-4) text-lg font-bold'>{((activity.daily_sent_reports * 125e15 + activity.votings_participated + activity.proposals_accepted * 3e17 + activity.problems_solved * 175e15 + activity.proposals_created * 3e16 + activity.crypto_discussion_messages * 145e16 + activity.resource_share * 1e14) / 1e18).toFixed(3)}</p>
     <p className='text-(--hacker-green-4) tracking-wider text-sm'>BUILD</p>
</div>
  </div>))}
</div>
</div>

</div>
)
}

export default MemberStats