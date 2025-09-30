'use client';

import usePushNotifications from '@/hooks/usePushNotifications';
import React from 'react';
import { Button } from '../ui/button';

export default function WebPushNotificationComponent() {

  const {subscription, subscribeToPush, unsubscribeFromPush,isSupported}=usePushNotifications();


  if(!isSupported) return null;


    return(
        <div className='text-white flex flex-col gap-2 p-2'>
            <p className='text-lg font-bold'>Push Notifications Subscription</p>
            {subscription ? (
                <Button className='cursor-pointer hover:scale-95 bg-red-500 hover:bg-red-700' onClick={unsubscribeFromPush}>Unsubscribe</Button>
          ) : (
                <Button onClick={subscribeToPush} className='cursor-pointer hover:scale-95 bg-(--hacker-green-4) hover:bg-(--hacker-green-5)'>Subscribe</Button>
         )}
        </div>
    )

}