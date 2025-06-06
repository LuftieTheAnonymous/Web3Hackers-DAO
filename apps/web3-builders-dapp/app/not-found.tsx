'use client'

import { useLottie } from 'lottie-react';
import { usePathname } from 'next/navigation';
import React from 'react'
import cryptoLottieAnimation from '@/public/gifs/Not-found-Lottie.json';
type Props = {}

function notFound({}: Props) {

  const pathname = usePathname();
  const {View}=useLottie({animationData: cryptoLottieAnimation, loop: true, className:'max-w-md w-full h-80'});

  return (
    <div className='w-full h-[calc(100vh-5rem)] flex flex-col justify-center items-center'>
      <h1 className='text-5xl text-white font-bold'>No Results</h1>
      {View}
      <p className='text-(--hacker-green-4) text-sm italic'>{(pathname as string) && (pathname as string).includes('proposal') ? `No proposals found for hash-id of: ${pathname.split('/')[2]}` : `No members found has been found with this id:  ${pathname.split('/')[2]}`}</p>
    </div>
  )
}

export default notFound