import React from 'react'
import VotingsParticipatedChart from './container/charts/VotingsParticipatedChart'
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { GOVERNOR_CONTRACT_ADDRESS, governorContractAbi } from '@/contracts/governor/config';
import VotesTypesCastedChart from './container/charts/VotesTypesCastedChart';
import { Button } from '../ui/button';

type Props = {walletAddress:`0x${string}`,isOpen:boolean

};

function MemberStats({walletAddress,isOpen

}: Props) {

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

{userVotes && userVotedProposalsCount && (userVotes as any[]).length > 0 &&  (userVotedProposalsCount as any) && Number((userVotedProposalsCount as any)) > 0 &&
<div className=
{`flex  gap-4 w-full max-w-6xl
${isOpen ? 'flex-col lg:flex-row' : 'flex-col lg:flex-row'}
items-center  justify-center py-2`}>

 <VotingsParticipatedChart proposals={(userVotes as any[])}/>


 <VotesTypesCastedChart isCustom={isCustom} proposals={(userVotes as any[])}  />

</div>
}


    </div>
  )
}

export default MemberStats