


import { supabase } from '@/lib/db/supabaseConfigClient';
import React from 'react'

type Props = {
    address?:`0x${string}`
}

async function ProposalHeader({address}: Props) {
const {data}=await supabase.from('dao_members').select('*').eq('userWalletAddress', address).single();
  return (
     <div className="flex justify-between items-center px-3 py-2">
      <div className="flex items-center gap-1 text-white">
        <div className='w-8 h-8 bg-zinc-600 rounded-full'></div>
        <p className='text-sm'>@{data ? data.username: 'Connect your wallet to see your username'}</p>
      </div>

      <p></p>
    </div>
  )
}

export default ProposalHeader