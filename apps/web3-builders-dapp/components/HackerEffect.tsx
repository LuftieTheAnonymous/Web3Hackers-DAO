'use client';

import React from 'react'
import HackerBackground from './eldoraui/hackerbg'

type Props = {}

function HackerEffect({}: Props) {
  return (
    <div className='w-full h-full'>
    <HackerBackground className='z-[-100000] w-full h-full opacity-50 bg-transparent fixed top-0 left-0' color='#05F29B' speed={2}/>
    </div>
  )
}

export default HackerEffect