import React from 'react'
import supabase from '@/lib/db/dbConfig'
import ProposalList from './ProposalList';
import { GOVERNOR_CONTRACT_ADDRESS, governorContractAbi } from '@/contracts/governor/config';





type Props = {}

async function ProposalListContainer({}: Props) {

const {data:proposals} = await supabase.from(`dao_proposals`).select('*, dao_members!inner(*), dao_vote_options:dao_vote_options(*), calldata_objects:calldata_objects(*)');



  return (
    <div className='max-w-[95rem] w-full mx-auto p-2'>
      {
      proposals &&
<ProposalList proposals={proposals ?? []}/>
    }
    </div>
  )
}

export default ProposalListContainer