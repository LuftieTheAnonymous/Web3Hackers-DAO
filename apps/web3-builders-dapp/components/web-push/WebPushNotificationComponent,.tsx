'use client';

import usePushNotifications from '@/hooks/usePushNotifications';
import React from 'react';




export default function WebPushNotificationComponent() {

  const {subscription, message, setMessage, subscribeToPush, unsubscribeFromPush, sendTestNotification,isSupported}=usePushNotifications();


  if(!isSupported) return null;


    return(
        <div className='text-white p-2'>
            <p>Push Notifications</p>
            {subscription ? (<div className='flex flex-col gap-4'>
                <p>Subscribed to push notifications</p>
                <button onClick={unsubscribeFromPush}>Unsubscribe</button>
                <input type="text" name="message" onChange={(e)=>setMessage(e.target.value)} value={message} placeholder="Enter a message" id="notification" />
                <button onClick={sendTestNotification}>Send Notification</button>
            </div>) : (<div>
                <p>Not subscribed to push notifications</p>
                <button onClick={subscribeToPush} className='bg-white text-black cursor-pointer'>Subscribe</button>
            </div>)}
        </div>
    )

}