'use client';

import { useIsMobile } from '@/hooks/use-mobile'
import React from 'react'
import VoterListElement from './VoterListElement';
import { useReadContract } from 'wagmi';
import { GOVERNOR_CONTRACT_ADDRESS, governorContractAbi } from '@/contracts/governor/config';
type Props = {proposalId: `0x${string}`, proposalVotes?: any[]};

function VotesCard({proposalId, proposalVotes}: Props) {


  const isMobile = useIsMobile();
  return (
    <div className={`w-full  bg-zinc-800 max-w-xl flex-col p-3 flex h-80 border border-(--hacker-green-4) rounded-lg gap-2`}>
            <p className='text-(--hacker-green-4) text-xl'>Votes</p>
{proposalVotes && (proposalVotes as any[]).length > 0 ? (proposalVotes as any[]).map((vote, index) => (<VoterListElement voteData={vote}/>)) : <div></div>}
    </div>
  )
}

export default VotesCard