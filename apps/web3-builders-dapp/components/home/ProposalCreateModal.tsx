'use client';

import React from 'react'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { Calendar, EllipsisIcon } from 'lucide-react'
import { useAccount, useWriteContract } from 'wagmi';
import useGetLoggedInUser from '@/hooks/useGetLoggedInUser';
import { TOKEN_CONTRACT_ADDRESS, tokenContractAbi } from '@/contracts/token/config';
import {useLottie} from "lottie-react";
import cryptoLottieAnimation from "@/public/gifs/Crypto-Lottie-Animation.json";
import Image from 'next/image';

type Props = {}

function ProposalCard({}: Props) {

  const {address}=useAccount();
  const {currentUser}=useGetLoggedInUser();

  const options = {
    animationData: cryptoLottieAnimation,
    loop: true
  };

  const { View } = useLottie(options);
  const {writeContract}=useWriteContract();





  return (
    <div className={`w-full h-full  ${(address && !currentUser) ? 'flex flex-col gap-6 justify-center items-center h-screen' : 'h-full'}`}>
{(address && currentUser) &&    <div className="max-w-2xl my-6  drop-shadow-green-500 hover:-translate-y-1 transition-all duration-500 drop-shadow-sm mx-auto rounded-lg flex flex-col gap-2  w-full h-80 bg-zinc-800">
    <div className="flex justify-between items-center px-3 py-2 border-b border-(--hacker-green-4)">
      <div className="flex items-center gap-1 text-white">
        <div className='w-8 h-8 bg-zinc-600 rounded-full'>
          {currentUser && currentUser.photoURL && <Image alt={currentUser.nickname} src={currentUser.photoURL} width={32} height={32} className='rounded-full w-full h-full'/>}
        </div>
        <p className={`text-sm ${currentUser ? 'text-(--hacker-green-4)' : 'text-zinc-600'}`}>@{currentUser ? currentUser.nickname : 'Connect your wallet to see your username'}</p>
      </div>

      <p></p>
    </div>
     <div className="px-3 w-full h-full">

      <Textarea placeholder='Enter your proposal' className="h-full  resize-none border-0 outline-0 text-lg text-white"/>
     </div>
    <div className="flex justify-between  items-center pt-2 border-t border-(--hacker-green-4) py-2 w-full gap-2">
      <div className="flex gap-4 items-center ml-4">
<button className='cursor-pointer'>
  <EllipsisIcon className='text-(--hacker-green-4)'/>
</button>
<button className='cursor-pointer'>
  <Calendar className='text-(--hacker-green-4)'/>
</button>
      </div>
      <Button onClick={()=>{
        writeContract({
          abi: tokenContractAbi,
          address: TOKEN_CONTRACT_ADDRESS,
          functionName:'rewardUser',
          args:[address,BigInt(2000e18)],
        })
      }} className='hover:bg-(--hacker-green-4) cursor-pointer transition-all duration-500  px-6 hover:text-zinc-800 mr-4'>Propose</Button>
    </div>
    </div> }

    {address && !currentUser && <div className='flex flex-col gap-8 items-center w-full h-screen justify-center p-2'>

<p className='text-white text-3xl font-semibold text-center'>You are not a member of our Discord Community and DAO member yet !</p>


<div className="flex justify-center items-center max-w-md w-full h-80 my-6">
{View && View}
</div>


<div className="flex flex-col gap-2 items-center justify-center max-w-2xl w-full text-center">
<p className='text-white text-lg'>If you want to participate in our DAO, you would need to belong to our Discord Community and register your wallet address. Please DM <span className='text-(--hacker-green-4)'>@Luftjunkie_19</span> on Discord, we'll see  !</p>
<p className='text-sm text-white'>And also claim the DAO Tokens 😅</p>
</div>

    
    </div>}


    </div>
  )
}

export default ProposalCard