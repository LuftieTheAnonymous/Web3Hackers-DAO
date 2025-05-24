'use client';

import React from 'react'
import DropdownBar from '../drop-down/DropdownBar'
import ProposalElement from '@/components/proposal-item/ProposalElement'
import useRealtimeDocuments from '@/hooks/useRealtimeDocuments'
import useGetLoggedInUser from '@/hooks/useGetLoggedInUser';
import { useAccount } from 'wagmi';

type Props = {
    proposals:any[]
}

function ProposalList({proposals}: Props) {

    const {serverData}=useRealtimeDocuments({initialData:proposals,tableName:'dao_proposals',parameterOnChanges:'proposal_id'});

    const {address}=useAccount();
    const {currentUser}=useGetLoggedInUser();


  return (
    <>
     <p onClick={()=>{console.log(serverData)}} className='text-white text-2xl font-semibold '>List with current proposals</p>
       <DropdownBar/>
    <div className="flex flex-col overflow-y-auto items-center gap-6  w-full">

    {serverData && serverData.map((proposal,index)=>(<ProposalElement proposalObj={proposal} key={proposal.proposal_id} proposalId={proposal.proposal_id} />))}
    
    </div>


    
    </>
  )
}

export default ProposalList