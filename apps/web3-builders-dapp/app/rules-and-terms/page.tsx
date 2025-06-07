'use client';
import React from 'react'
import floatingClasses from '@/animations/floatingText.module.css';
import LuigiThink from "@/public/gifs/rules&terms/luigi-think.gif"
import Image from 'next/image';
import sleepyRaccon from "@/public/gifs/rules&terms/SleepyRaccon.gif";
import {FaDiscord} from "react-icons/fa";
import {IoIosWallet} from "react-icons/io";
import {RiSurveyFill } from "react-icons/ri";
import { LucideHandCoins } from 'lucide-react';
import { MdHowToVote } from "react-icons/md";
import {IoCodeSlash} from "react-icons/io5";


type Props = {};

function RulesAndTermsPage({}: Props) {
  return (
    <div className='w-full h-full'>

<div className="max-w-6xl w-full mx-auto flex flex-col gap-6 p-6">
  <div className="flex gap-2 items-center self-center">
  {"Rules And Terms".split("").map((letter, index) => (<p data-letter={letter} key={index} style={{
    animationDelay: `${index * 0.05}s`
  }} className={`text-6xl font-bold  ${floatingClasses[`letter`]} text-white tracking-widest }`}>{letter}</p>))}
  </div>
</div>

<div className="flex items-center justify-between gap-8 mx-auto max-w-6xl w-full ">

<div className="flex text-white max-w-2xl gap-2 w-full flex-col">
<p className='text-3xl font-bold'>Welcome to the most boring 🥱 section !</p>
<p className='text-sm max-w-xl w-full'>Here you will find every rule and term you need to know in order to join, participate, and thrive within our DAO. 
We believe that jointly, we can create a safe and welcoming environment for all our members to grow and learn. That's why your power is in your hands ! Our motto ? Contribute, Grow and impact !</p>
</div>
  
  <div className="max-w-md w-full">
    <Image src={sleepyRaccon} alt={'SleepyRaccon'} className='w-full h-96 object-cover'/>
  </div>
</div>

<div className="max-w-6xl w-full  mx-auto">
  <p className='text-center text-white text-4xl font-bold'>Details of the rules and terms</p>
  <div className="w-full flex sm:flex-col lg:flex-row  justify-between gap-12 p-6 ">

    <div className="max-w-sm w-full h-[32rem] rounded-lg bg-white flex justify-center items-center">
      <p>Here's the place for the PDF document.</p>
    </div>

<div className="flex flex-col text-white max-w-xl gap-2">
  <p className=' text-3xl font-light'>Rules and Terms</p>
  <p>Here is the entire document on what is our DAO about and how it works. Both from theoretical and practical side. But in order not to let you fall asleep here are some key-requirements you have to fulfill in order to become a member in our DAO.</p>
  <div className="flex flex-col gap-4  max-w-sm py-3 w-full">
  <div className="max-w-md items-center justify-around w-full flex gap-2 bg-zinc-800 border-(--hacker-green-4) border rounded-lg p-2">
      <IoIosWallet className='text-(--hacker-green-4)' size={42} />
      <p className=''>Have A Crypto-Wallet Account</p>
    </div>
    
    
    <div className="max-w-md items-center justify-around w-full flex gap-2 bg-zinc-800 border-(--hacker-green-4) border rounded-lg p-2">
      <FaDiscord className='text-(--hacker-green-4)' size={42} />
      <p className=''>Be A Member On Discord Server</p>
    </div>

    <div className="max-w-md items-center justify-around w-full flex gap-2 bg-zinc-800 border-(--hacker-green-4) border rounded-lg p-2">
      <RiSurveyFill className='text-(--hacker-green-4)' size={42} />
      <p className=''>Go Through Discord Onboarding</p>
    </div>

    <div className="max-w-md items-center justify-around w-full flex gap-2 bg-zinc-800 border-(--hacker-green-4) border rounded-lg p-2">
      <LucideHandCoins  className='text-(--hacker-green-4)' size={42} />
      <p className=''>Claim your initial amount of tokens</p>
    </div>

  </div>
</div>


  </div>
</div>

<div className="flex items-center justify-between gap-8 mx-auto max-w-6xl w-full py-4 ">

<div className="flex text-white max-w-3xl gap-2 w-full flex-col">
<p className='text-4xl font-bold'>How can I be part of <span className='text-(--hacker-green-4)'>Web3Builders</span> ?</p>
<p className='max-w-xl w-full'>To join Web3Builders, first of all we have to seek for new member. If your interests match our values, and you will get a positive result in voting process, you will be invited to join our community.</p>
</div>
  
  <div className="max-w-72 w-full">
    <Image src={LuigiThink} alt={'LuigiThink'} className='w-full h-72'/>
  </div>
</div>

<div className="max-w-6xl w-full py-4 mx-auto text-white">

<p className='text-center text-3xl font-bold'>What if you're already a <span className='text-(--hacker-green-4)'>member</span> of the community and <span className='text-(--hacker-green-4)'>DAO Participant</span> ?</p>

<div className="flex items-center justify-between max-w-6xl gap-6 py-6">

  <div className="max-w-xs h-[28rem] w-full items-center rounded-lg border-(--hacker-green-4) border p-4 justify-between flex flex-col gap-4 bg-zinc-800 ">
    <p className='text-2xl font-semibold text-center'>Be An Active Member on Discord !</p>
    <FaDiscord  className='text-(--hacker-green-4)' size={100}/>
    <p className='text-center text-sm'>Contributing to the discord community is the main and the key to have the influence on future decisions. By being active there, you can help us grow and improve our community !</p>
  </div>

  <div className="max-w-xs h-[28rem]  w-full items-center rounded-lg p-4 border-(--hacker-green-4) border justify-between flex flex-col gap-4 bg-zinc-800 ">
    <p className='text-2xl text-center font-semibold '>Code, Develop and Contribute !</p>
    <IoCodeSlash className='text-(--hacker-green-4)' size={100}/>
    <p className='text-sm text-center'>By sharing your progress in coding in our community, you can earn tokens, because that's what the aim of the community is ! And you would be the proof of it !</p>
  </div>

  <div className="max-w-xs h-[28rem]  w-full items-center rounded-lg p-4 border-(--hacker-green-4) border justify-between flex flex-col gap-4 bg-zinc-800 ">
    <p className='text-2xl text-center font-semibold '>Participate in Votings !</p>
    <MdHowToVote className='text-(--hacker-green-4)' size={100}/>
    <p className='text-sm text-center'>You can earn additional tokens by participating in our votings ! It's because by you voting you're contributing to the growth of our community ! So why shouldn't you be rewarded ?</p>
  </div>
</div>


  <p className='text-center text-2xl font-bold'>If you have any questions, you can always reach out to <span className='text-(--hacker-green-4)'>Luftjunkie</span> on <span className='text-[#5865F2]'>Discord</span> !</p>
</div>


    </div>  
  )
}

export default RulesAndTermsPage