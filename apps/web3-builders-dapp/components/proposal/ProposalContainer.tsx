'use client';

import ProposalCallbackItem from '@/components/proposal-item/ProposalCallbackItem'
import ProposalCommentBar from '@/components/proposal/comment/ProposalCommentBar'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { GOVERNOR_CONTRACT_ADDRESS, governorContractAbi } from '@/contracts/governor/config';
import useRealtimeDocument from '@/hooks/useRealtimeDocument';
import React, { useState } from 'react'
import { FaCheck, FaFlag, FaPencilAlt } from 'react-icons/fa'
import { MdCancel } from 'react-icons/md'
import { useAccount, useReadContract, useWatchContractEvent, useWriteContract } from 'wagmi';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from '../ui/dialog';
import { ethers } from 'ethers';
import Image from 'next/image';
import { DialogTitle } from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import VotingDataContainer from './voting-data/VotingDataContainer';
import { VoteIcon } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import VotingStandardModal from './voting-data/VotingStandardModal';
import { decodeEventLog } from 'viem';
import { notFound } from 'next/navigation';
import { formatDistanceStrict, formatDistanceToNow } from 'date-fns';


type Props<T> = {
    proposalData: T,
    commentsData:any[],
    proposalId: string
}

function ProposalContainer<T, U>({
proposalData, commentsData, proposalId
}: Props<T>) {

  const [isReason, setIsReason] = useState<boolean>(false);
  const [reason, setReason] = useState<string>('');

    const {objectData:proposalObj}=useRealtimeDocument({'tableName':'dao_proposals', initialObj: proposalData});
const {address}=useAccount();
const {writeContract}=useWriteContract({

});

if(!proposalData){
  notFound();
}

    const {data:proposalOnchainData, error}=useReadContract({
      abi: governorContractAbi,
      address: GOVERNOR_CONTRACT_ADDRESS,
      functionName: "getProposal",
      args:[proposalId],
    });


    useWatchContractEvent({
      abi: governorContractAbi,
      address: GOVERNOR_CONTRACT_ADDRESS,
      eventName: "ProposalVoted",
      'onLogs': (logs) => {
        console.log('ProposalVoted logs:', logs);
 logs.forEach((log) => {
    try{
      const decoded= decodeEventLog({
        abi: governorContractAbi,
        eventName: "ProposalVoted",
        data: log.data,
        topics: log.topics,
      });

      console.log('Decoded ProposalVoted log:', decoded);
      if(decoded && decoded.args && decoded.args.find((log) => (log as any).votedProposalId === proposalId && (log as any).voter === address)){
        toast.success('Your vote has been cast successfully!');
        setIsReason(false);
        setReason('');
      }
    }catch(e){
      console.error('Error decoding ProposalVoted log:', e);
      return null;
    }
   });


      },
      onError(error) {
        toast.error(`Error casting vote: ${error.message}`);
      },
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
          args:[(proposalObj as any).proposal_id, reason, address, proposalNumber, ethers.encodeBytes32String(""), (proposalObj as any).isCustom, (proposalObj as any).isCustom ? isExecuting : false, (proposalObj as any).isCustom ? isDefeating : false, calldataIndicies ? calldataIndicies.map((index) => BigInt(index)) : []],
        })
    }


    const {state}=useSidebar();
  return (
  <>
    <div className={`mx-auto w-full max-w-[90rem] flex flex-col  ${state === 'expanded' ? ' xl:flex-row': 'lg:flex-row'} p-2 gap-6  lg:py-8 justify-between`}>
    
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto ">
    <div className="w-full bg-zinc-800 max-sm:max-h-80 h-full min-h-96 lg:min-h-[28rem] max-h-[32rem] border-(--hacker-green-4) overflow-y-auto  rounded-lg">
    <div className="w-full flex justify-between sticky top-0 left-0 items-center bg-zinc-900 rounded-t-lg px-2 md:px-4 py-8 h-14">
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-full bg-zinc-600">
            {proposalObj && (proposalObj as any).dao_members.photoURL && <Image alt={'avatar'} src={(proposalObj as any).dao_members.photoURL} width={32} height={32} className='rounded-full w-full h-full'/>}
      </div>
      <p className='text-(--hacker-green-4)'>@{proposalObj && (proposalObj as any).dao_members.nickname}</p>
    </div>
    
    <div className="flex items-center gap-2">
     {proposalOnchainData as any && Number((proposalOnchainData as any).state) !== 1 && 
     new Date(Number((proposalOnchainData as any).startBlockTimestamp) * 1000).getTime() - new Date().getTime() >= 0 
     &&   <p className='text-white text-sm'>
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
  
    
    <div  className={`max-w-2xl mx-auto self-center w-full bg-zinc-800 h-12 rounded-lg flex items-center gap-5 overflow-y-hidden ${proposalOnchainData && (proposalOnchainData as any) && (proposalOnchainData as any).isCustom ? 'justify-center' : 'justify-between'} overflow-x-auto p-7`}>
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

{!isReason && <div className="flex flex-col gap-4">
  {(proposalObj as any).dao_vote_options.map((item:any, index:number)=>(<Button
  key={item.id}
  onClick={()=>handleStandardProposalVote(item.voteOptionIndex, item.calldataIndicies, item.isExecuting, item.isDefeating)}
  className='cursor-pointer transition-all hover:scale-95 hover:bg-(--hacker-green-5) hover:text-white bg-(--hacker-green-4) text-zinc-800'>
    {item.voting_option_text}
  </Button>))}
</div>}

{isReason && <div className="flex flex-col gap-4">
 <Textarea onChange={(e)=>setReason(e.target.value)} placeholder='Reason for voting' className='bg-zinc-800 h-40 resize-none border border-(--hacker-green-4) text-white outline-0'/> 
  </div>}

      <DialogFooter className='flex justify-between  gap-6  mx-auto  w-full'>
        <Button onClick={()=>setIsReason(false)} className={`cursor-pointer hover:bg-zinc-600 hover:text-white bg-(--hacker-green-4) text-zinc-800`}>Votes <VoteIcon/> </Button>
        <Button onClick={()=>setIsReason(true)} className={`cursor-pointer hover:bg-(--hacker-green-5) hover:text-white bg-(--hacker-green-4) text-zinc-800`}>Reason <FaPencilAlt/></Button>
      </DialogFooter>
      </DialogContent>
     </Dialog>
      
      </> : <>
<VotingStandardModal
TriggerButton={()=>(<Button className='cursor-pointer transition-all hover:scale-95 hover:bg-(--hacker-green-5) hover:text-white bg-(--hacker-green-4) text-zinc-800'>Vote For <FaCheck /></Button>)}
dialogTitle='Vote For This Proposal'
typeReasonFunction={(value:string)=>setReason(value)}
castVoteFunction={()=>handleStandardProposalVote(0)}
/>

<VotingStandardModal
TriggerButton={()=>( <Button  className='cursor-pointer transition-all hover:scale-95 bg-blue-500 hover:bg-blue-400 hover:text-zinc-800'>Abstain <FaFlag /></Button>)}
dialogTitle='Abstain This Proposal'
typeReasonFunction={(value:string)=>setReason(value)}
castVoteFunction={()=>handleStandardProposalVote(1)}
/>

<VotingStandardModal
TriggerButton={()=>(<Button className='cursor-pointer transition-all hover:scale-95 hover:bg-red-400 hover:text-zinc-800 bg-red-500'>Vote Against <MdCancel /></Button>)}
dialogTitle='Reject This Proposal'
typeReasonFunction={(value:string)=>setReason(value)}
castVoteFunction={()=>handleStandardProposalVote(2)}
/>

      </> }
    </div>
    </div>
    
    
{proposalObj && commentsData &&    <ProposalCommentBar proposalId={(proposalObj as any).proposal_id} proposalData={commentsData} state={state}/>}
    



    </div>
<VotingDataContainer isCustom={proposalOnchainData && (proposalOnchainData as any) && (proposalOnchainData as any).isCustom} proposalId={proposalId as `0x${string}`}/>

  

  </>
  )
}

export default ProposalContainer