'use client';

import React from 'react'
import MemberDetails from '@/components/profile/MemberDetails'
import MemberStats from '@/components/profile/MemberStats'
import MemberTile from '@/components/profile/MemberTile'
import { Button } from '@/components/ui/button'
import useRealtimeDocument from '@/hooks/useRealtimeDocument'
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebar } from '@/components/ui/sidebar';


type Props<T> = {
    profileData:T,
    walletAddress:string

}

function ProfilePageContainer<T>({profileData,  walletAddress
}: Props<T>) {

const {open}=useSidebar();

    const {objectData}=useRealtimeDocument({initialObj:profileData,tableName:'dao_members'});

  return (
     <div className='w-full h-full'>
          <div className={` max-w-6xl w-full mx-auto ${open ? 'flex-col xl:flex-row' : 'flex-col lg:flex-row'}  gap-6 flex justify-between items-center py-6 px-4
           `}>
    <MemberTile objectData={objectData}/>
   <MemberDetails objectData={objectData} walletAddress={walletAddress}
   />
           </div>
          
          <div className="flex flex-col gap-2 w-full mx-auto">
   <div className="flex items-center gap-4 justify-center max-w-7xl mx-auto">
     <Button className='bg-zinc-800 cursor-pointer hover:bg-(--hacker-green-4) hover:text-zinc-800 transition-all hover:scale-90'>Statistics</Button>
     <Button className='bg-zinc-800 cursor-pointer hover:bg-(--hacker-green-4) hover:text-zinc-800 hover:scale-90'>Proposals</Button>
 
   </div>
          <MemberStats
          isOpen={open}
          walletAddress={walletAddress as `0x${string}`}/>
          </div>
    </div>
  )
}

export default ProfilePageContainer