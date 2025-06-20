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

type Props = {
   notificationMemberData:any
}

function NotificationTile({notificationMemberData}: Props) {

     const token = useStore((state) => (state as TokenState).token);
     const supabase =  createSupabaseClient(!token ? '' : token);

   
   const {objectData}=useRealtimeDocument({initialObj:notificationMemberData, tableName: 'notification_settings'});
const [defaultNotificationSettings, setDefaultNotificationSettings] = React.useState<Record<string, boolean>>({
      notifyOnNewProposals: objectData && objectData.notifyOnNewProposals !== undefined ? objectData.notifyOnNewProposals : false,
      notifyOnUnvoted: objectData && objectData.notifyOnUnvoted !== undefined ? objectData.notifyOnUnvoted : false,
      notifyOnRewarding:  objectData && objectData.notifyOnRewarding !== undefined  ? objectData.notifyOnRewarding : false,
      notifyOnPunishing: objectData && objectData.notifyOnPunishing !== undefined ? objectData.notifyOnPunishing :  false,
   });

     const {subscription, }=usePushNotifications();

   const handleUpdateNotificationSettings = async () => {
      try {
        if(subscription && defaultNotificationSettings){
          await supabase.from('notification_settings').update({...defaultNotificationSettings, userAddress: objectData.userAddress}).eq('userAddress', objectData.userAddress);
         console.log('Updated Notification Settings:', defaultNotificationSettings);
         toast.success('Notification settings updated successfully!');
        }
      } catch (error) {
         toast.error('Failed to update notification settings.');
         console.error('Error updating notification settings:', error);
      }
   }


   


  return (
    <div className="flex flex-col justify-between max-w-md w-full bg-zinc-800 border border-(--hacker-green-4) self-center h-[36rem] p-4 rounded-md">
             
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
                }} checked={defaultNotificationSettings?.notifyOnNewProposals ?? false} className='data-[state=checked]:bg-(--hacker-green-4) cursor-pointer  scale-150 data-[state=unchecked]:bg-zinc-600 '/>
             </div>
          
             <div className="flex items-center gap-4 justify-between max-w-4/5 w-full">
                <p className=' text-white text-sm'>Final Proposal-Voting Notification</p>
                <Switch onClick={() => {
                  setDefaultNotificationSettings({...defaultNotificationSettings, notifyOnUnvoted: !defaultNotificationSettings.notifyOnUnvoted });
                }} checked={defaultNotificationSettings?.notifyOnUnvoted ?? false} className='data-[state=checked]:bg-(--hacker-green-4) cursor-pointer  scale-150 data-[state=unchecked]:bg-zinc-600 '/>
             </div>
    
             <div className="flex items-center gap-4 justify-between max-w-4/5 w-full">
                <p className=' text-white text-sm'>Monthly Token Rewards Notification</p>
                <Switch onClick={() => {
                  setDefaultNotificationSettings({...defaultNotificationSettings, notifyOnRewarding: !defaultNotificationSettings.notifyOnRewarding });
                }}  checked={defaultNotificationSettings?.notifyOnRewarding ?? false} className='data-[state=checked]:bg-(--hacker-green-4) cursor-pointer  scale-150 data-[state=unchecked]:bg-zinc-600 '/>
             </div>
    
             <div className="flex items-center gap-2 justify-between max-w-4/5 w-full">
                <p className=' text-white text-sm'>Punishment Tokens Notification</p>
                <Switch onClick={()=>{setDefaultNotificationSettings({...defaultNotificationSettings, notifyOnPunishing: !defaultNotificationSettings.notifyOnPunishing });}} checked={defaultNotificationSettings?.notifyOnPunishing ?? false} className='data-[state=checked]:bg-(--hacker-green-4) cursor-pointer  scale-150 data-[state=unchecked]:bg-zinc-600 '/>
             </div>
    
                       <WebPushNotificationComponent/>
    
              </div>
       <Button onClick={handleUpdateNotificationSettings} className='hover:bg-zinc-700 cursor-pointer hover:text-white bg-(--hacker-green-4) text-zinc-800 hover:scale-105 self-end'>Approve</Button>
    
            </div>
  )
}

export default NotificationTile