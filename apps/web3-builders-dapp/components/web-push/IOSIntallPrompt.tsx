'use client';

import React, { useEffect, useState } from 'react'

type Props = {}

function IOSIntallPrompt({}: Props) {
    const [isIOS, setIsIOS] = useState<boolean>(false);
const [isStandalone, setIsStandalone] = useState<boolean>(false);

useEffect(()=>{
    setIsIOS(
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);

        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
},[]);

if(!isIOS || isStandalone){
    return null;
}

  return (
    <div>
        <p>Install the app</p>
        <button>Add to home screen</button>
        {isIOS && (<p>
to install this app on your iOS device, tap the share button <span role='img' aria-label='share icon'>
🔗
</span>
and then tap 'Add to homescreen'
<span role='img' aria-label='arrow icon'>
🡆
</span>

        </p>)}
    </div>
  )
}

export default IOSIntallPrompt