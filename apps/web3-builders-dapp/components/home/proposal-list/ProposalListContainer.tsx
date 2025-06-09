import React from 'react'

import ProposalList from './ProposalList';
import { supabase } from '@/lib/db/supabaseConfigClient';





type Props = {searchParams:Record<string,string>}

async function ProposalListContainer({searchParams}: Props) {
  const sortingProperty = searchParams?.sortingProperty || 'created_at';
  const sortingOrder = searchParams?.sortingOrder === 'true';

const {data:proposals,error} = await supabase.from(`dao_proposals`)
.select('*, dao_members!inner(*), dao_vote_options:dao_vote_options(*), calldata_objects:calldata_objects(*)').order( sortingProperty, {ascending: sortingOrder});


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