'use client';

import { useIsMobile } from '@/hooks/use-mobile'
import React from 'react'
import VoterListElement from './VoterListElement';

type Props = { proposalVotes?: any[]};

function VotesCard({ proposalVotes}: Props) {

  const isMobile = useIsMobile();
  return (
    <div className={`w-full  bg-zinc-800 max-w-xl flex-col p-3 flex h-80 border border-(--hacker-green-4) rounded-lg gap-2`}>
            <p className='text-(--hacker-green-4) text-xl'>Votes</p>
{proposalVotes && (proposalVotes as any[]).length > 0 ? (proposalVotes as any[]).map((vote, index) => (<VoterListElement isMobile={isMobile} voteData={vote}/>)) : <div></div>}
    </div>
  )
}

export default VotesCard