'use client';
import React from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Bell, SunMoonIcon } from 'lucide-react'
import WebPushNotificationComponent from '../web-push/WebPushNotificationComponent,'
import useRealtimeDocument from '@/hooks/useRealtimeDocument'
import { toast } from 'sonner';
import usePushNotifications from '@/hooks/usePushNotifications';
import { createSupabaseClient } from '@/lib/db/supabaseConfigClient';
import { TokenState, useStore } from '@/lib/zustandConfig';
import { useAccount } from 'wagmi';
import { upsertWebPushSubscription } from '@/lib/web-push/db/actions';

type Props = {
   notificationMemberData:any
}

function NotificationTile({notificationMemberData}: Props) {
const {address}=useAccount();
     const token = useStore((state) => (state as TokenState).token);

   
   const {objectData}=useRealtimeDocument({initialObj:notificationMemberData, tableName: 'notification_settings'});
const [defaultNotificationSettings, setDefaultNotificationSettings] = React.useState<Record<string, boolean>>({
      notifyOnNewProposals: objectData && objectData.notifyOnNewProposals !== undefined ? objectData.notifyOnNewProposals : false,
      notifyOnUnvoted: objectData && objectData.notifyOnUnvoted !== undefined ? objectData.notifyOnUnvoted : false,
      notifyOnSuccess:  objectData && objectData.notifyOnSuccess !== undefined  ? objectData.notifyOnSuccess : false,
      notifyOnExecution: objectData && objectData.notifyOnExecution !== undefined ? objectData.notifyOnExecution :  false,
      notifyOnCancel: objectData && objectData.notifyOnCancel !== undefined ? objectData.notifyOnCancel : false,
      notifyOnVote: objectData && objectData.notifyOnVote !== undefined ? objectData.notifyOnVote : false
   });


   const handleUpdateNotificationSettings = async () => {
      try {
         
  
if(address) {


await upsertWebPushSubscription(address as `0x${string}`, {...defaultNotificationSettings, updateAt:new Date().toISOString(), userAddress:address as `0x${string}`});

      }


        
      } catch (error:any) {
         toast.error(`Failed to update notification settings: ${error?.message}`);
         console.error('Error updating notification settings:', error);
      }
   }

  return (
    <div className="flex flex-col overflow-y-auto justify-between max-w-md w-full bg-zinc-800 border border-(--hacker-green-4) self-center h-[36rem] p-4 rounded-md">
      <div className="flex flex-col gap-4">
                <p className='text-xl text-white font-semibold flex items-center gap-2'>Theme <SunMoonIcon className='text-(--hacker-green-4)' size={32}/> </p>
             <div className="flex items-center gap-4">
                <p className=' text-white text-sm'>Your Current Theme: Dark</p>
                <Switch  className='data-[state=checked]:bg-(--hacker-green-4) cursor-pointer  scale-150 data-[state=unchecked]:bg-zinc-600 '/>
             </div>
             <p className='text-xl text-white font-semibold flex items-center gap-2'>Notifications <Bell className='text-(--hacker-green-4)' size={32}/> </p>
            
             <div className="flex items-center justify-between max-w-4/5 w-full gap-4">
                <p className=' text-white text-sm'>New Proposals Notification</p>
                <Switch onClick={() => {
                  setDefaultNotificationSettings({...defaultNotificationSettings, notifyOnNewProposals: !defaultNotificationSettings.notifyOnNewProposals });
                }} checked={defaultNotificationSettings.notifyOnNewProposals ?? false} className='data-[state=checked]:bg-(--hacker-green-4) cursor-pointer  scale-150 data-[state=unchecked]:bg-zinc-600 '/>
             </div>

             <div className="flex items-center gap-4 justify-between max-w-4/5 w-full">
                <p className=' text-white text-sm'>Final Proposal-Voting Notification</p>
                <Switch onClick={() => {
                  setDefaultNotificationSettings({...defaultNotificationSettings, notifyOnUnvoted: !defaultNotificationSettings.notifyOnUnvoted });
                }} checked={defaultNotificationSettings.notifyOnUnvoted ?? false} className='data-[state=checked]:bg-(--hacker-green-4) cursor-pointer  scale-150 data-[state=unchecked]:bg-zinc-600 '/>
             </div>
    
             <div className="flex items-center gap-4 justify-between max-w-4/5 w-full">
                <p className=' text-white text-sm'>Monthly Token Rewards Notification</p>
                <Switch onClick={() => {
                  setDefaultNotificationSettings({...defaultNotificationSettings, notifyOnSuccess: !defaultNotificationSettings.notifyOnSuccess });
                }}  checked={defaultNotificationSettings.notifyOnSuccess ?? false} className='data-[state=checked]:bg-(--hacker-green-4) cursor-pointer  scale-150 data-[state=unchecked]:bg-zinc-600 '/>
             </div>
    
             <div className="flex items-center gap-2 justify-between max-w-4/5 w-full">
                <p className=' text-white text-sm'>Cancelation Notification</p>
                <Switch onClick={()=>{setDefaultNotificationSettings({...defaultNotificationSettings, notifyOnCancel: !defaultNotificationSettings.notifyOnCancel });}} checked={defaultNotificationSettings.notifyOnCancel ?? false} className='data-[state=checked]:bg-(--hacker-green-4) cursor-pointer  scale-150 data-[state=unchecked]:bg-zinc-600 '/>
             </div>

                 <div className="flex items-center gap-2 justify-between max-w-4/5 w-full">
                <p className=' text-white text-sm'>Vote Notification</p>
                <Switch onClick={()=>{setDefaultNotificationSettings({...defaultNotificationSettings, notifyOnVote: !defaultNotificationSettings.notifyOnVote });}} checked={defaultNotificationSettings.notifyOnVote ?? false} className='data-[state=checked]:bg-(--hacker-green-4) cursor-pointer  scale-150 data-[state=unchecked]:bg-zinc-600 '/>
             </div>

                <div className="flex items-center gap-2 justify-between max-w-4/5 w-full">
                <p className=' text-white text-sm'>Execution Notification</p>
                <Switch onClick={()=>{setDefaultNotificationSettings({...defaultNotificationSettings, notifyOnExecution: !defaultNotificationSettings.notifyOnExecution });}} checked={defaultNotificationSettings.notifyOnExecution ?? false} className='data-[state=checked]:bg-(--hacker-green-4) cursor-pointer  scale-150 data-[state=unchecked]:bg-zinc-600 '/>
             </div>

                       <WebPushNotificationComponent/>
    
              </div>
       <Button onClick={handleUpdateNotificationSettings} className='hover:bg-zinc-700 cursor-pointer hover:text-white bg-(--hacker-green-4) text-zinc-800 hover:scale-105 self-end'>Approve</Button>
    
            </div>
  )
}

export default NotificationTile