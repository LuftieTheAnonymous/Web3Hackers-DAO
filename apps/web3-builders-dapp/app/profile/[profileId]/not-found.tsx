'use client';

import React from 'react'
import NotFoundLottie from "@/public/gifs/Not-found-Lottie.json"
import Lottie from 'lottie-react';

type Props = {}

function NotFound({}: Props) {
  return (
    <div className='w-full h-screen flex flex-col gap-1 justify-center items-center'>

      <p className='text-white text-2xl font-bold'>Something went wrong with account retrieval</p>
      <Lottie className='max-w-3xl w-full ' loop animationData={NotFoundLottie} />

      <p className='text-white'>It's likely that a user like this does not exist in our service. In </p>
    </div>
  )
}

export default NotFound