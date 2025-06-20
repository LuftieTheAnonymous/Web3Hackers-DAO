import NotificationTile from '@/components/settings/NotificationTile'
import UserProfileTile from '@/components/settings/UserProfileTile'
import { createSupabaseClient } from '@/lib/db/supabaseConfigClient';


import { SettingsIcon } from 'lucide-react'
import { cookies } from 'next/headers';
import React from 'react'



async function Page({ params }: { params: Promise<{ memberId: string }>
 }
) {
const cookiesStore = await cookies();
const token = cookiesStore.get('supabase_jwt');
 const supabase=  createSupabaseClient(!token ? '' : token.value);
    const paramsReceived=  await params;
    const memberId=paramsReceived.memberId;
    const {data}=await supabase.from('dao_members').select('*').eq('userWalletAddress', memberId).single();
    const {data: userData}=await supabase.from('notification_settings').select('*').eq('userAddress', memberId).single();
  return (
    <div className='w-full h-full '>
       <div className="mx-auto max-w-4xl w-full flex flex-col gap-4 py-6 px-2 ">

       <p className='text-white text-2xl font-bold flex items-center gap-1'>Settings <SettingsIcon/> </p> 
        
        <div className="flex w-full gap-8 items-center flex-col md:flex-row">

<UserProfileTile intialDocument={data}/>

<NotificationTile notificationMemberData={userData}/>


        </div>
        
        </div> 
    </div>
  )
}

export default Page