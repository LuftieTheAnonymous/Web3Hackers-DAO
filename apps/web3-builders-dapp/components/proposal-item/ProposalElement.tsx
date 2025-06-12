'use client';

import { GOVERNOR_CONTRACT_ADDRESS, governorContractAbi } from '@/contracts/governor/config';
import { Check, CircleArrowUp, InfoIcon, LucideBatteryFull, LucideBatteryLow, LucideBatteryMedium, X } from 'lucide-react';
import Link from 'next/link';
import React from 'react'
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import ProposalCallbackItem from './ProposalCallbackItem';
import { formatDistanceStrict } from 'date-fns';

import { ethers } from 'ethers';
import Image from 'next/image';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { MdCancel, MdOutlinePendingActions, MdPending } from 'react-icons/md';

type Props = {proposalId:`0x${string}`, proposalObj:any}

function ProposalElement<T>({
  proposalId,
  proposalObj
}: Props) {
const {address}=useAccount();

    const {data:fullProposalObject}=useReadContract({
      abi:governorContractAbi,
      address: GOVERNOR_CONTRACT_ADDRESS,
      functionName: 'getProposal',
      args:[proposalId],
    });

    const {data:proposalVotes}=useReadContract({
      abi:governorContractAbi,
      address: GOVERNOR_CONTRACT_ADDRESS,
      functionName: 'getStandardProposalVotes',
      args:[proposalId],
    });

    const {writeContractAsync}=useWriteContract({
        

    })

    const castVote=async (voteOption:number )=>{

        writeContractAsync({
            abi:governorContractAbi,
        address: GOVERNOR_CONTRACT_ADDRESS,
        functionName: 'castVote',
        args:[
            (fullProposalObject as any).id, 
            "Because I like this proposal", 
            address, 
            BigInt(voteOption), 
            ethers.encodeBytes32String(""), 
            (fullProposalObject as any).isCustom, 
            voteOption === 0 ? true : false, 
            voteOption !== 0 ? true : false, 
            []],
        })
    }

    const convertAmountOfTokensToPercent = (amountOfTokens: number) => {


   const allOptionsVote=proposalVotes as BigInt[];

        const totalTokens = allOptionsVote.reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue), 0);
        const percentage = (amountOfTokens / totalTokens) * 100;
        if(isNaN(percentage)){
            return 0;
        }
        return percentage;
    }


    const handleVoteClick = (voteOption: number) => {

   if(fullProposalObject && (fullProposalObject as any).state === 1 && new Date(Number(((fullProposalObject as any).startBlockTimestamp)) * 1000).getTime() <= new Date().getTime()) {
     castVote(voteOption);
return;
    }
        toast.error('You can only vote when the proposal is open for voting.', {    classNames:{'default':'bg-zinc-800' }});
    
    
    }

    const searchParams= useSearchParams();


    const stateComponent=(state:number)=>{
      switch(state){
        case 0:
          return <p className='text-sm text-white flex gap-2 items-center'>


             <MdOutlinePendingActions
className='text-(--hacker-green-4)'
/>
Pending...
(
    {
    new Date(Number(((fullProposalObject as any).startBlockTimestamp)) * 1000).getTime() >= new Date().getTime() &&
      <span
  className='text-sm text-(--hacker-green-4)'
  >
   {`Starts in ${formatDistanceStrict(new Date(Number(((fullProposalObject as any).startBlockTimestamp)) * 1000), new Date())}`}
  </span>
   }
  {new Date(Number(((fullProposalObject as any).startBlockTimestamp)) * 1000).getTime()<=new Date().getTime() &&
<p>Should have started:<span
  className='text-sm text-red-500'
  >{' '}
  
   {`${formatDistanceStrict(new Date(Number(((fullProposalObject as any).startBlockTimestamp)) * 1000), new Date())}`} ago
  </span>
</p> 

   }

)
  </p>
 
 case 1: 
  return  <p className={`${new Date(Number(((fullProposalObject as any).endBlockTimestamp)) * 1000).getTime() >= new Date().getTime() ? 'text-(--hacker-green-4)' : 'text-gray-700'}   text-xs`}>
    {new Date(Number(((fullProposalObject as any).endBlockTimestamp)) * 1000).getTime() >= new Date().getTime() && '🔓 Open'}
    {' '}
    <span className='
    text-white
    '>
       {fullProposalObject as any && `${formatDistanceStrict(new Date(Number(((fullProposalObject as any).endBlockTimestamp)) * 1000), new Date())}`}
    </span>
   </p>
  case 2:
    return <p
    className='flex gap-2 items-center text-sm text-white'
    >
      Canceled 
      <MdCancel className='text-red-700' />
    </p>
  
  case 3:
    return <p
    className='flex gap-2 items-center text-sm text-white'
    >
      Defeated
         <MdCancel className='text-red-700 text-lg'/>
    </p>

    case 4:
      return <p
      className='flex gap-2 items-center text-sm text-white'
      >
        Succeeded
         <Check className='text-green-700' />
      </p>

      case 5:
        return <p
        className='flex gap-2 items-center text-sm text-white'>
          Queued
          🔒
        </p>
      
      case 6: 
      return <p
      className='flex gap-2 items-center text-sm text-white'
      >
        Executed
         <Check className='text-green-700' />
      </p>

      }

    }

  return (
<>
{fullProposalObject && proposalObj && <div onClick={() => console.log((fullProposalObject as any))}  className={`bg-zinc-800 ${searchParams.get('filterProperty') !== null && searchParams.get('filterValue') !== null && ((searchParams.get('filterProperty') === 'isCustom' && searchParams.get('filterValue') !== String((fullProposalObject as any).isCustom))  || (searchParams.get('filterProperty') === 'state' && Number(searchParams.get('filterValue'))) !== Number((fullProposalObject as any).state)) && 'hidden'} border shadow-sm ${fullProposalObject && (fullProposalObject as any).state === 1 ? 'shadow-green-400' : (fullProposalObject as any).state === 2 ||  (fullProposalObject as any).state === 3 ? 'shadow-red-500' : ' shadow-gray-500'} flex flex-col ${fullProposalObject && (fullProposalObject as any).state === 1 ? 'border-(--hacker-green-4)' : (fullProposalObject as any).state === 2 ||  (fullProposalObject as any).state === 3 ? 'border-red-500' : 'border-gray-500'
  } max-w-3xl  transition-all duration-700 hover:scale-95 hover:-translate-y-1 w-full rounded-lg h-96`}>
      <div className={`w-full border-b ${fullProposalObject && (fullProposalObject as any).state === 1 ? 'border-(--hacker-green-4)' : 'border-gray-500'} `}>
      <div className="flex justify-between items-center px-3 py-2">
      <div onClick={()=>console.log(proposalObj)} className="flex items-center gap-1 text-white">
       {proposalObj && proposalObj.dao_members && proposalObj.dao_members.photoURL ? <Image width={32} height={32} className='w-8 h-8 object-cover rounded-full' src={proposalObj.dao_members.photoURL} alt="" /> : <div className='w-8 h-8 rounded-full object-cover bg-zinc-600'></div>}
        <p className='text-sm'>@{proposalObj && proposalObj.dao_members &&  proposalObj.dao_members.nickname}</p>
      </div>


  {
    (fullProposalObject as any) &&  stateComponent(Number((fullProposalObject as any).state))
  }


    </div>
      </div>
      <Link href={`/proposal/${(fullProposalObject as any).id}`} className="w-full h-full oveflow-y-auto px-4 flex flex-col gap-3 py-2 text-white text-sm overflow-x-hidden">
        <p className=' font-bold text-base'>{(fullProposalObject as any).description} </p>
   
{proposalObj && <p className='text-sm md:text-base'>{proposalObj.proposal_description}</p>}
     <div className="w-full flex flex-wrap gap-4 items-center">
     {proposalObj
     && proposalObj.calldata_objects
     && proposalObj.calldata_objects.map((item:T, index:number)=>(
       <ProposalCallbackItem key={index} callbackText={(item as any).functionDisplayName} />
     ))}
        
     </div>
      </Link>
      <div className="border-t
      border-gray-500
      py-3 flex justify-between items-center">
        {!(fullProposalObject as any).isCustom ?
(<div className="flex items-center gap-8 px-1 overflow-x-auto">

<div  className="flex ml-3 gap-2 items-center">
<div className='w-6 h-6 sm:w-8 sm:h-8 bg-(--hacker-green-4) rounded-full flex justify-center items-center'>
  <span className='text-[8px] sm:text-xs text-zinc-800'>{proposalVotes as BigInt[] && convertAmountOfTokensToPercent(Math.floor(Number((proposalVotes as BigInt[])[0]))).toFixed(0)}%</span>
</div>

<button onClick={()=>handleVoteClick(0)} className='flex items-center cursor-pointer gap-1 hover:scale-95 transition-all text-(--hacker-green-4)'>
   
    <span className='text-xs sm:text-sm'>
    For
    </span>
  </button>

</div>

<div className="flex gap-1 items-center">
<div className='w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full flex justify-center items-center'>
  <span className='text-[8px] sm:text-xs text-white'>{proposalVotes as BigInt[] && convertAmountOfTokensToPercent(Math.floor(Number((proposalVotes as BigInt[])[2]))).toFixed(0)}%</span>
</div>



  <button onClick={()=>handleVoteClick(2)} className='flex items-center cursor-pointer gap-1 hover:scale-95 transition-all  text-red-500'>

  <span className='text-xs sm:text-sm'>
    Against
  </span>
  </button>
</div>

<div className="flex gap-2 items-center">
<div className='w-6 h-6 sm:w-8 sm:h-8  bg-blue-500 rounded-full overflow-hidden flex justify-center items-center'>
  <span className='text-[8px] sm:text-xs text-white'>{proposalVotes as BigInt[] && convertAmountOfTokensToPercent(Math.floor(Number((proposalVotes as BigInt[])[1]))).toFixed(0)}%</span>
</div>



  <button onClick={()=>handleVoteClick(1)} className='flex items-center cursor-pointer gap-1 hover:scale-95 transition-all  text-blue-500'>
  
    <span className='text-xs sm:text-sm'>
      Abstain
    </span>
  </button>
</div>

</div>) : <div className="flex items-center gap-8 text-sm text-white px-3 overflow-x-auto">
<p>This is a <span className='text-(--hacker-green-4)'>custom proposal</span>, click the proposal content to see options.</p>
</div>
        }

        <div className="flex gap-2 pr-4 items-center">
          
         <p className='text-sm flex items-center gap-1 text-white'>
<span className='hidden md:block'>Urgency:</span>
           {fullProposalObject && (fullProposalObject as any).urgencyLevel === 0 ? <LucideBatteryLow className=' text-red-500' /> : (fullProposalObject as any).urgencyLevel === 1 ? <LucideBatteryMedium className=' text-yellow-400' />  : <LucideBatteryFull className='text-(--hacker-green-4)' />}
         </p>
        </div>
      </div>
    </div>}
</>);
}

export default ProposalElement