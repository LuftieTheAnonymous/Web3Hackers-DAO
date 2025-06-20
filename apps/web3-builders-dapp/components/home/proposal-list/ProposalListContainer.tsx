import React from 'react'

import ProposalList from './ProposalList';
import { supabase } from '@/lib/db/supabaseConfigClient';


async function ProposalListContainer() {
  

const {data:proposals,error} = await supabase.from(`dao_proposals`)
.select('*, dao_members:dao_members(*), dao_vote_options:dao_vote_options(*), calldata_objects:calldata_objects(*)');


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