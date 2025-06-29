import HackerEffect from '@/components/HackerEffect'
import { AuroraText } from '@/components/magicui/aurora-text'
import { BlurFade } from '@/components/magicui/blur-fade'
import { BorderBeam } from '@/components/magicui/border-beam'
import { IconCloud } from '@/components/magicui/icon-cloud'
import { SparklesText } from '@/components/magicui/sparkles-text'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FocusCards } from '@/components/ui/focus-cards'
import Image from 'next/image'



import React from 'react'

type Props = {}

function Page({}: Props) {

  const slugs = [
  "solidity",
  "nodejs",
  "typescript",
  "python",
  "javascript",
  "rust",
  "go",
  "java",
  "csharp",
  "php",
  "swift",
  "kotlin",
  "dart",
  "ruby",
  "html",
  "css",
  "react",
  "vue",
  "angular",
  "svelte",
  "nextjs",
  "nuxtjs",
  "express",
  "fastify",
  "flask",
  "django",
  "laravel",
  "spring",
  "rails",
  "aspnet",
  "symfony",
  "dotnet",
  "git",
  "github",
  "move"
  ];
 
  const images = slugs.map(
    (slug) => `https://cdn.simpleicons.org/${slug}/${slug}/:light`,
  );


  return (
    <div className="w-full h-full">
       
        <div className=" max-w-6xl w-full mx-auto flex-col gap-6 flex items-center py-6 px-4">
<HackerEffect />
<div className="flex flex-col justify-center items-center gap-5 w-full">
<BlurFade>
<div className='text-white text-2xl sm:text-3xl text-center lg:text-5xl font-bold flex items-center w-full flex-wrap gap-2'>Welcome to <SparklesText sparklesCount={10} colors={{first:'#05F29B', second: '#03A678'}} className='text-5xl font-bold'>
<AuroraText colors={['#2289ff', '#6e2094']}>Web3</AuroraText>Builders 
</SparklesText></div>
</BlurFade>

<BlurFade>
  <div className="text-white text-2xl font-medium flex flex-wrap gap-2 text-center items-center">A community where Your <AuroraText className='font-bold ' colors={['#05F29B', '#03A678']}>Impact</AuroraText> is proportional to your <AuroraText className='font-bold ' colors={['#05F29B', '#03A678']}>Actions</AuroraText>.</div>
</BlurFade>
        </div>


<div className="flex w-full max-w-6xl my-12 mx-auto justify-between items-center gap-24
flex-col md:flex-row">
  
<BlurFade delay={0.5}>
  <BorderBeam colorFrom='#05F29B' colorTo='#03A678'/>
<Image alt='' className='max-w-sm w-full rounded-lg' src={'/Web3Builders.png'} width={300} height={300}/>
</BlurFade>
<BlurFade delay={0.85}>
  <div className="flex  max-w-xl w-full flex-col gap-5 text-white">
<p className='text-2xl font-bold'>What is <span className='p-2 rounded-lg text-zinc-800 text-animated-first-section'>Web3Builders</span> ?</p>
<p className=' leading-8'>
  Web3Builders is a community, focused on builders, developers, and enthusiasts of Web3, technology, programming and most importantly, <span className='p-2 text-(--hacker-green-4) bg-zinc-800 rounded-lg'>Blockchain</span>. 
</p>
<p className='leading-8'>Our Community's purpose is to create a safe, friendly, relatively small-sized community and welcoming environment for all our members to grow and learn. What should excel us from the rest ? That you can have influence on the server's decision making process.</p>
  </div>
</BlurFade>
</div>

<div className="flex w-full max-w-6xl my-12 justify-between items-center gap-16
flex-col md:flex-row

">
<BlurFade>
<div className="flex max-w-md w-full flex-col gap-5">
<IconCloud
images={images} />
</div>
</BlurFade>


<div className="max-w-2xl w-full flex flex-col gap-5 text-white">
  <p
  className='text-3xl font-bold'
  > Who is the community for ?</p>
  <p className='leading-7'>
    Unfortunately we are not a community for everyone. We are a community for developers, builders and enthusiasts of Web3, technology, programming and most importantly, Blockchain. We are not a community for people who just want to chill and have fun. We are a community for people who want to learn, grow and build together and have fun simultaneously 😎 (We're not numb though). We are a community for people who want to make an impact in the world of Web3. If you are one of those people, then you are in the right place.
  </p>
</div>
</div>



<div className="flex text-white flex-col gap-2 w-full items-center  max-w-6xl my-12
p-3
">
  <p className='text-4xl font-bold
  '>The Founders</p>
  <p>Let's introduce the Founders of Web3Builders, the greatest community of developers, builders and enthusiasts of Web3. Real heros and not just sweet-unicorny talkers 🥰</p>

  <FocusCards cards={[{'title':'Akash Dutta', src:'/founders/Akash.jpg', description:'Founder of Web3Builders, Idea Maker, Web3 Enthusiast'}, {'src':'/founders/Luftie-2.jpg', title:'Luftjunkie', description:"Co-Founder of Web3Builders, DAO Creator, Fullstack Blockchain Developer"},{'title':'Arcane', src:'/founders/Arcane-Jose.jpg', description:'CTO of Web3Builders, Senior Blockchain Developer, Web3 Enthusiast'}]}/>

</div>


<div className="w-full max-w-5xl mx-auto flex flex-col gap-5 items-center">
<p
className='text-4xl font-bold text-white'>Frequently Asked Questions</p>
<p className='text-white'>We are a new community, so we don't have many questions yet. But we will add more questions as we grow.
  But here are some that might pop into your head 😎
</p>

<Accordion type="multiple" className=' max-w-3xl w-full bg-zinc-800 rounded-lg text-white
'>
  <AccordionItem value="item-1" className='p-2'>
    <AccordionTrigger
    className='text-white
    text-xl 
    hover:no-underline
    bg-zinc-800 hover:bg-zinc-700 rounded-lg p-2'>
      <p className='flex items-center gap-2 text-wrap flex-wrap'>
      Who can join
 <span className='text-(--hacker-green-4) '>
  Web3Builders
 </span>
    ?
      </p>
    </AccordionTrigger>
    <AccordionContent
    className='text-white bg-zinc-800 hover:bg-zinc-700 rounded-md p-2'>
  Well firstly, we have to decide whether we take new people or not. For now (29.04.2024) we are not taking new people.
  As the server is not built yet. But if you are a developer, builder or enthusiast of Web3, technology, programming and most importantly, Blockchain, you can message us and we will consider with the community, if we make the exception or not 😉
    </AccordionContent>
  </AccordionItem>


  <AccordionItem value="item-2" className='p-2'>
    <AccordionTrigger
    className='text-white
    text-xl 
    hover:no-underline
    bg-zinc-800 hover:bg-zinc-700 rounded-lg p-2'>
      <p className='flex items-center gap-2 text-wrap flex-wrap'>
  How large is
 <span className='text-(--hacker-green-4) '>
  Web3Builders
 </span>
 going to be 
    ?
      </p>
    </AccordionTrigger>
    <AccordionContent
    className='text-white bg-zinc-800 hover:bg-zinc-700 rounded-md p-2'>
  We're not going to be a large community like (5k) members but in fact I want to keep it small and friendly.
  As the first aim we target a number of 10 members (29.04.2024).
  We want to create a community where you can actually know the people in the community and not just be a number.
  We want to create a community where you can actually make an impact on the server and not be a slave of admins and mods. We 
  want to create a community where you can actually have fun with learning and growing and not get overwhelmed, when the answers are not clear.
    </AccordionContent>
  </AccordionItem>


  
  <AccordionItem value="item-3" className='p-2'>
    <AccordionTrigger
    className='text-white
    text-xl 
    hover:no-underline
    bg-zinc-800 hover:bg-zinc-700 rounded-lg p-2'>
      <p className='flex items-center gap-2 text-wrap flex-wrap'>
What are the requirements to join
 <span className='text-(--hacker-green-4) '>
  Web3Builders
 </span>
    ?
      </p>
    </AccordionTrigger>
    <AccordionContent
    className='text-white bg-zinc-800 hover:bg-zinc-700 rounded-md p-2'>
  The requirements are pretty straight-forward. You have to be:
  <ul className='list-disc list-inside'>
    <li>
      A person who is interested in Web3, technology, programming and most importantly, Blockchain.
    </li>

    <li>
     A developer, a person with programming-background or just starting with programming with aim to contribute to Web3 or already contributing to Web3.
    </li>

<li>
  A guy is intending to take part in the community's events like building projects, a bit of competitions, internal-hackathons, etc.
</li>

    <li>
   A person who is fully devoted to Web3Builders and doesn't treat this community as a joke or a game.
    </li>

    <li>A person, who
      is willing to grow, learn and build together with the community.
    </li>


  </ul>
    </AccordionContent>
  </AccordionItem>

</Accordion>
</div>


    </div>
    
    </div>
  )
}

export default Page