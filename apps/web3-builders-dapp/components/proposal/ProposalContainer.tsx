'use client';

import ProposalCallbackItem from '@/components/proposal-item/ProposalCallbackItem'
import ProposalCommentBar from '@/components/proposal/comment/ProposalCommentBar'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { GOVERNOR_CONTRACT_ADDRESS, governorContractAbi } from '@/contracts/governor/config';
import useRealtimeDocument from '@/hooks/useRealtimeDocument';
import useRealtimeDocuments from '@/hooks/useRealtimeDocuments';
import { formatDistanceStrict, formatDistanceToNow } from 'date-fns';
import React, { useEffect, useState } from 'react'
import { FaCheck, FaFlag, FaPaperPlane } from 'react-icons/fa'
import { MdCancel } from 'react-icons/md'
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../ui/dialog';
import { ethers } from 'ethers';
import Image from 'next/image';
import { DialogTitle } from '@radix-ui/react-dialog';
import { toast } from 'sonner';

type Props<T, U> = {
    proposalData: T,
    commentsData:U[],
    proposalId: string
}

function ProposalContainer<T, U>({
proposalData, commentsData, proposalId
}: Props<T, U>) {

    const {objectData:proposalObj}=useRealtimeDocument({'tableName':'dao_proposals', initialObj: proposalData});
const [timeToStart, setTimeToStart] = useState<{seconds: number, minutes: number, hours: number, days: number}>({
  seconds: 0,
  minutes: 0,
  hours: 0,
  days: 0
});
    const {serverData}=useRealtimeDocuments({initialData:commentsData,tableName:'dao_voting_comments',parameterOnChanges:'proposal_id'});
const {address}=useAccount();
const {writeContract}=useWriteContract({
  
});

    const {data:proposalOnchainData, error}=useReadContract({
      abi: governorContractAbi,
      address: GOVERNOR_CONTRACT_ADDRESS,
      functionName: "getProposal",
      args:[proposalId],
    });


    const handleStandardProposalVote =  (proposalNumber: number, calldataIndicies?: number[], isExecuting?: boolean, isDefeating?: boolean) => {
      if(proposalOnchainData && (proposalOnchainData as any).state !== 1){
        toast.error("Proposal has not started yet, please wait until it starts to vote.");
        return;
      } 
   writeContract({
          abi: governorContractAbi,
          address: GOVERNOR_CONTRACT_ADDRESS,
          functionName: "castVote",
          args:[(proposalObj as any).proposal_id, "", address, proposalNumber, ethers.encodeBytes32String(""), (proposalObj as any).isCustom, (proposalObj as any).isCustom ? isExecuting : false, (proposalObj as any).isCustom ? isDefeating : false, calldataIndicies ? calldataIndicies.map((index) => BigInt(index)) : []],
        })
    }


    const {state, isMobile}=useSidebar();
  return (
  <>
    <div className={`mx-auto w-full max-w-[90rem] flex flex-col ${state === 'expanded' ? 'sm:flex-col xl:flex-row': 'lg:flex-row'} p-2 gap-6  lg:py-8 justify-between`}>
    
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto ">
    <div className="w-full bg-zinc-800 max-sm:max-h-80 h-full min-h-96 lg:min-h-[28rem] max-h-[32rem] border-(--hacker-green-4) overflow-y-auto  rounded-lg">
    <div className="w-full flex justify-between sticky top-0 left-0 items-center bg-zinc-900 rounded-t-lg px-2 md:px-4 py-8 h-14">
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-full bg-zinc-600">
            {proposalObj && (proposalObj as any).dao_members.photoURL && <Image alt={'avatar'} src={(proposalObj as any).dao_members.photoURL} width={32} height={32} className='rounded-full w-full h-full'/>}
      </div>
      <p className='text-(--hacker-green-4)' >@{proposalObj && (proposalObj as any).dao_members.nickname}</p>
    </div>
    
    <div className="flex items-center gap-2">
     {proposalOnchainData as any && Number((proposalOnchainData as any).state) !== 1 && 
     new Date(Number((proposalOnchainData as any).startBlockTimestamp) * 1000).getTime() - new Date().getTime() >= 0 
     &&      <p className='text-white text-sm'>
     <span className='text-(--hacker-green-4)'>{formatDistanceToNow(new Date(Number((proposalOnchainData as any).startBlockTimestamp) * 1000))}</span>
     to start
     </p>
     } 

     {proposalOnchainData && (proposalOnchainData as any).state === 1 &&
           <p className={`${new Date(Number(((proposalOnchainData as any).endBlockTimestamp)) * 1000).getTime() >= new Date().getTime() ? 'text-(--hacker-green-4)' : 'text-gray-700'}   text-xs`}>{proposalOnchainData as any && `${formatDistanceStrict(new Date(Number(((proposalOnchainData as any).endBlockTimestamp)) * 1000), new Date())}`} <span className='text-white'>until the end</span></p>
     }
    </div>
    </div>
    
    <div className="w-full  h-full flex flex-col  justify-between gap-2 py-2 px-2">
      <p className='text-white text-sm'>{(proposalObj as any).proposal_description}</p>
    </div>
    
    </div>
    {(proposalObj as any).calldata_objects.length > 0 &&
  (  <div className="flex flex-col gap-3 p-2">
      <p className='text-white text-2xl gap-2'><span className='text-(--hacker-green-4)'>@username's </span> Proposal Includes</p>
      <div className={`grid  grid-cols-1 ${state === 'expanded' ? 'sm:grid-cols-2': 'lg:grid-cols-3'}   bg-zinc-800 rounded-lg p-4 gap-4 w-full max-h-48 h-full overflow-y-auto overflow-x-hidden`}>
   {(proposalObj as any).calldata_objects.map((item:any, index:number)=>(<ProposalCallbackItem key={index} callbackText={item.functionDisplayName} />))}

      </div>
    
    
    </div>)  
  }
  
    
    <div onClick={()=>console.log(proposalOnchainData)} className={`max-w-2xl mx-auto self-center w-full bg-zinc-800 h-12 rounded-lg flex items-center gap-5 overflow-y-hidden ${proposalOnchainData && (proposalOnchainData as any) && (proposalOnchainData as any).isCustom ? 'justify-center' : 'justify-between'} overflow-x-auto p-7`}>
      {proposalOnchainData && (proposalOnchainData as any) && (proposalOnchainData as any).isCustom ? <>
     <Dialog>


       <DialogTrigger>
      <Button className='cursor-pointer transition-all hover:scale-95 hover:bg-(--hacker-green-5) hover:text-white bg-(--hacker-green-4) text-zinc-800'>See the options</Button>
      </DialogTrigger>
      <DialogContent className='bg-zinc-800 border-2 border-(--hacker-green-4) shadow-lg shadow-green-500'>
        <DialogHeader>
<DialogTitle className='text-white text-lg'>
  Available Vote Options
</DialogTitle>
        </DialogHeader>

<div className="flex flex-col gap-4">
  {(proposalObj as any).dao_vote_options.map((item:any, index:number)=>(<Button
  key={item.id}
  onClick={()=>handleStandardProposalVote(item.voteOptionIndex, item.calldataIndicies, item.isExecuting, item.isDefeating)}
  className='cursor-pointer transition-all hover:scale-95 hover:bg-(--hacker-green-5) hover:text-white bg-(--hacker-green-4) text-zinc-800'>
    {item.voting_option_text}
  </Button>))}
</div>

      </DialogContent>
     </Dialog>
      
      </> : <>
      <Button onClick={()=>handleStandardProposalVote(0)} className='cursor-pointer transition-all hover:scale-95 hover:bg-(--hacker-green-5) hover:text-white bg-(--hacker-green-4) text-zinc-800'>Vote For <FaCheck /></Button>
      <Button onClick={()=>handleStandardProposalVote(1)} className='cursor-pointer transition-all hover:scale-95 bg-blue-500 hover:bg-blue-400 hover:text-zinc-800'>Abstain <FaFlag /></Button>
      <Button onClick={()=>handleStandardProposalVote(2)} className='cursor-pointer transition-all hover:scale-95 hover:bg-red-400 hover:text-zinc-800 bg-red-500'>Vote Against <MdCancel /></Button>
      </> }
    </div>
    </div>
    
    
{serverData && proposalObj && commentsData &&    <ProposalCommentBar proposalId={(proposalObj as any).proposal_id} proposalData={serverData} state={state}/>}
    



    </div>

  
  <div className="w-full  flex flex-wrap p-6 h-full  gap-8">
    <div className={`w-full max-w-xl ${isMobile ? 'flex-col' : 'flex-row'} flex h-80 border border-(--hacker-green-4) rounded-lg gap-4`}>
      <div className="w-full h-full bg-zinc-800 rounded-lg p-4 overflow-y-auto">
        <p className='text-(--hacker-green-4) text-xl'>Votes</p>
        <div className="flex flex-col w-full gap-4 mt-4">
      <div className="flex justify-between items-center bg-zinc-700 w-full p-4 rounded-lg h-16">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-zinc-600 rounded-full"></div>
        <div className="flex flex-col gap-1">
            <p className='text-(--hacker-green-4) text-sm'>Username</p>
            <p className='text-white text-xs'>Voted For: <span className='text-(--hacker-green-4)'>Option 1</span></p>
        </div>

        </div>
        <Button className='cursor-pointer transition-all hover:scale-95 hover:bg-(--hacker-green-5) hover:text-white bg-(--hacker-green-4) text-zinc-800'>Reason</Button>
      </div>
        </div>
      </div>
    </div>

       <div className={`w-full max-w-xl  ${isMobile ? 'flex-col' : 'flex-row'} h-80 border-(--hacker-green-4) border rounded-lg flex gap-4`}>
      <div className="w-full h-full bg-zinc-800 rounded-lg p-4 overflow-y-auto">
        <p className='text-(--hacker-green-4) text-xl'>Voters</p>
        <div className="flex gap-6 mt-4">
          <div className="flex flex-col items-center gap-1">

            <div className="w-12 h-12 bg-zinc-600 rounded-full cursor-pointer transition-all hover:animate-spin">
              
            </div>
            <p className='text-white text-sm'>Username</p>
          </div>

            <div className="flex flex-col items-center gap-1">

            <div className="w-12 h-12 bg-zinc-600 rounded-full cursor-pointer transition-all hover:animate-spin">
              
            </div>
            <p className='text-white text-sm'>Username</p>
          </div>

            <div className="flex flex-col items-center gap-1">

            <div className="w-12 h-12 bg-zinc-600 rounded-full cursor-pointer transition-all hover:animate-spin">
              
            </div>
            <p className='text-white text-sm'>Username</p>
          </div>

            <div className="flex flex-col items-center gap-1">

            <div className="w-12 h-12 bg-zinc-600 rounded-full cursor-pointer transition-all hover:animate-spin">
              
            </div>
            <p className='text-white text-sm'>Username</p>
          </div>
             
            
        </div>
      </div>
    </div>
  </div>

  </>
  )
}

export default ProposalContainer