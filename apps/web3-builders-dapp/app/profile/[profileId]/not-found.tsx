
import React from 'react'
import cryptoLottieAnimation from '@/public/gifs/Not-found-Lottie.json';
import Lottie from 'lottie-react';


function notFound() {
if (typeof window === "undefined") return null;


  return (
    <div className='w-full h-[calc(100vh-5rem)] flex flex-col justify-center items-center'>
      <h1 className='text-5xl text-white font-bold'>No Results</h1>
     <Lottie
     animationData={cryptoLottieAnimation}
     loop={true}
     />
      <p className='text-(--hacker-green-4) text-sm italic'>{(window.location.pathname as string) && (window.location.pathname as string).includes('proposal') ? `No proposals found for hash-id of: ${window.location.pathname.split('/')[2]}` : `No members found has been found with this id:  ${window.location.pathname.split('/')[2]}`}</p>
    </div>
  )
}

export default notFound