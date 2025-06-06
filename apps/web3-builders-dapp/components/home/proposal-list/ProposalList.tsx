'use client';

import React from 'react'
import DropdownBar from '../drop-down/DropdownBar'
import ProposalElement from '@/components/proposal-item/ProposalElement'
import useRealtimeDocuments from '@/hooks/useRealtimeDocuments'
import useGetLoggedInUser from '@/hooks/useGetLoggedInUser';
import { useAccount } from 'wagmi';
import { Skeleton } from '@/components/ui/skeleton';

type Props = {
    proposals:any[]
}

function ProposalList({proposals}: Props) {

    const {serverData}=useRealtimeDocuments({initialData:proposals,tableName:'dao_proposals',parameterOnChanges:'proposal_id'});
    const {currentUser, isLoading}=useGetLoggedInUser();


  return (
    <>
     
          {serverData && currentUser && !isLoading && <>
          <p onClick={()=>{console.log(serverData)}} className='text-white text-2xl font-semibold '>List with current proposals</p>
          <DropdownBar/>
          </>
          }
    <div className="flex flex-col overflow-y-auto items-center gap-6 w-full">

{isLoading && (serverData || !serverData) && <>
<Skeleton className='w-full max-w-2xl  bg-zinc-800 rounded-lg border border-green-400'>
<div className='w-full flex items-center gap-4 p-4'>
<Skeleton className='w-8 h-8 bg-zinc-600 rounded-full' />
<Skeleton className='w-32 h-4 bg-zinc-400 rounded' />
</div>
<Skeleton className='h-64 p-2 bg-zinc-700'/>
<div className="w-full flex items-center gap-4 p-4">
<Skeleton className='w-8 h-8 bg-zinc-600 rounded-full' />
<Skeleton className='w-8 h-8 bg-zinc-600 rounded-full' />
<Skeleton className='w-8 h-8 bg-zinc-600 rounded-full' />
</div>
</Skeleton>

<Skeleton className='w-full max-w-2xl  bg-zinc-800 rounded-lg border border-green-400'>
<div className='w-full flex items-center gap-4 p-4'>
<Skeleton className='w-8 h-8 bg-zinc-600 rounded-full' />
<Skeleton className='w-32 h-4 bg-zinc-400 rounded' />
</div>
<Skeleton className='h-64 p-2 bg-zinc-700'/>
<div className="w-full flex items-center gap-4 p-4">
<Skeleton className='w-8 h-8 bg-zinc-600 rounded-full' />
<Skeleton className='w-8 h-8 bg-zinc-600 rounded-full' />
<Skeleton className='w-8 h-8 bg-zinc-600 rounded-full' />
</div>
</Skeleton>

<Skeleton className='w-full max-w-2xl  bg-zinc-800 rounded-lg border border-green-400'>
<div className='w-full flex items-center gap-4 p-4'>
<Skeleton className='w-8 h-8 bg-zinc-600 rounded-full' />
<Skeleton className='w-32 h-4 bg-zinc-400 rounded' />
</div>
<Skeleton className='h-64 p-2 bg-zinc-700'/>
<div className="w-full flex items-center gap-4 p-4">
<Skeleton className='w-8 h-8 bg-zinc-600 rounded-full' />
<Skeleton className='w-8 h-8 bg-zinc-600 rounded-full' />
<Skeleton className='w-8 h-8 bg-zinc-600 rounded-full' />
</div>
</Skeleton>
</>}
    {serverData && currentUser && !isLoading && serverData.map((proposal,index)=>(<ProposalElement proposalObj={proposal} key={proposal.proposal_id} proposalId={proposal.proposal_id} />))}
    
    </div>


    
    </>
  )
}

export default ProposalList