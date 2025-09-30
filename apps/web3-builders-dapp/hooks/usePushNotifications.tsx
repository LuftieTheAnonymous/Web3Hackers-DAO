'use client';
import { subscribeUser, unsubscribeUser } from '@/lib/web-push/actions';
import { upsertWebPushSubscription } from '@/lib/web-push/db/actions';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { useAccount } from 'wagmi';





function usePushNotifications() {
    const {address}=useAccount();

    const [isSupported, setIsSupported]=useState<boolean>(false);
    const [subscription, setSubscription]=useState<PushSubscription|null>(null);

      const urlBase64ToUint8Array=(base64String: string) => {
    console.log(base64String);
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window && window.isSecureContext) {
          setIsSupported(true);
        registerServiceWorker();
        }
      }, []);

      const registerServiceWorker= async ()=>{
      try{
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope:'/',
            updateViaCache: 'none',

        });


        console.log(registration);

        if(registration.installing){
            console.log('Service worker installing');
        }else if (registration.waiting){
            console.log('Service worker installed');
        }else if (registration.active){
            console.log('Service worker active');
        }
    
        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);
      }catch(err){
        toast.error(`Something went wrong ! ${err}`);
        console.log(err);
      }
    }

    const subscribeToPush=async()=>{
     try{
         const subscription = await navigator.serviceWorker.ready;
         console.log(subscription, 'subscription');

        const sub = await subscription.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey:urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY! as string)
        });

       

        setSubscription(sub);
        const serializeSub = JSON.parse(JSON.stringify(sub));
        console.log(serializeSub, 'serializeSub');
        if(address) {
         const {subscription, error, success} = await subscribeUser(serializeSub, address);
         console.log(subscription, error, success);
        await upsertWebPushSubscription(address, {notifyOnNewProposals:true, notifyOnExecution:true, notifyOnSuccess:true, notifyOnCancel:true, notifyOnVote:true, notifyOnUnvoted:true, endpoint:sub.endpoint, p256h_key: serializeSub.keys.p256dh, auth_key: serializeSub.keys.auth});
              toast.success('Subscribed from push notifications !');
      }
     }catch(err){
      console.log(err);
      toast.error(`Something went wrong ! ${err}`);
     }
    }

    const unsubscribeFromPush=async()=>{
   try{
   if(subscription && address){
     await subscription.unsubscribe();
     setSubscription(null);
     const {subscription:object, error, success}=  await unsubscribeUser(address);
     console.log(object, error, success);
        toast.success('Unsubscribed from push notifications !');
   }
   }catch(err){
    console.log(err);
    toast.error(`Something went wrong !:${JSON.stringify(err)}`);
   }
    }

    

    return {
        isSupported,
        subscription,
        subscribeToPush,
        unsubscribeFromPush
    }
}

export default usePushNotifications