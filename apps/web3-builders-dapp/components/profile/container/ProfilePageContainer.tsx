'use client';

import React, { useState } from 'react'
import MemberDetails from '@/components/profile/MemberDetails'
import MemberStats from '@/components/profile/MemberStats'
import MemberTile from '@/components/profile/MemberTile'
import { Button } from '@/components/ui/button'
import useRealtimeDocument from '@/hooks/useRealtimeDocument'

import { useSidebar } from '@/components/ui/sidebar';
import { notFound } from 'next/navigation';
import MemberProposalsCreated from '../MemberProposalsCreated';
import { useAccount, useWriteContract } from 'wagmi';
import { governorTokenContract } from '../../../../backend/config/ethersConfig';
import { TOKEN_CONTRACT_ADDRESS, tokenContractAbi } from '@/contracts/token/config';


type Props = {
    profileData:any,
    walletAddress:string

}

function ProfilePageContainer({profileData,  walletAddress
}: Props) {

const {open}=useSidebar();

    const {objectData}=useRealtimeDocument({initialObj:profileData,tableName:'dao_members'});

    if(!profileData){
      notFound();
    }

    const {address}=useAccount();

    const [isProposalsOpen, setIsProposalsOpen] = useState<boolean>(false);

  

  return (
     <div className='w-full h-full'>
          <div className={`max-w-6xl w-full mx-auto ${open ? 'flex-col lg:flex-row' : 'flex-col lg:flex-row'}  gap-6 flex justify-between items-center py-6 px-4
           `}>
    <MemberTile objectData={objectData}/>
   <MemberDetails objectData={objectData} walletAddress={walletAddress}
   />
           </div>



          <div className="flex flex-col gap-2 w-full mx-auto">
   <div className="flex items-center gap-4 justify-center max-w-7xl mx-auto">
     <Button
    onClick={()=>setIsProposalsOpen(false)}
     className={`cursor-pointer ${!isProposalsOpen ? 'bg-(--hacker-green-4) text-zinc-800 hover:bg-zinc-600 hover:text-zinc-100' : 'bg-zinc-800 hover:bg-(--hacker-green-4) hover:text-zinc-800'} transition-all hover:scale-90`}>Statistics</Button>
     <Button onClick={()=>setIsProposalsOpen(true)}      className={`cursor-pointer ${isProposalsOpen ? 'bg-(--hacker-green-4) text-zinc-800 hover:bg-zinc-600 hover:text-zinc-100' : 'bg-zinc-800 hover:bg-(--hacker-green-4) hover:text-zinc-800'} transition-all hover:scale-90`}>Proposals</Button>
 
   </div>
        {isProposalsOpen ? <MemberProposalsCreated proposals={objectData.dao_proposals as any[]} /> :  <MemberStats
          isOpen={open}
          monthActivities={profileData.dao_month_activity as any[]}
          walletAddress={walletAddress as `0x${string}`}/>}
          </div>
          
    </div>
  )
}

export default ProfilePageContainer