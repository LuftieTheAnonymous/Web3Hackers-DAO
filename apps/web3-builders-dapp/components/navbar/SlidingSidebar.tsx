

import React from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
import { PanelLeftIcon } from 'lucide-react'
import { useAccount } from 'wagmi'
import { usePathname } from 'next/navigation'
import useGetLoggedInUser from '@/hooks/useGetLoggedInUser'
import ProposalModal from '../modal/ProposalModal'
import { ConnectKitButton } from 'connectkit'

import { Home, User, UserCog2Icon, UserRoundPenIcon } from "lucide-react"
import { Button } from '../ui/button'
import Image from 'next/image'
type Props = {}

function SlidingSidebar({}: Props) {
    
  const {address}=useAccount();
  const pathname=usePathname();
  const {currentUser}=useGetLoggedInUser();

    const items = [
    {
      title: "Home",
      url: "/",
      icon: Home,
      display:true,
      isActive: pathname === "/"
    },
    {
      title: "Profile",
      url: `/profile/${address}`,
      icon: User,
      display: (address && currentUser )? true : false,
      isActive: pathname === `/profile/${address}`
    },
    {
      title: "Settings",
      url: `/settings/${address}`,
      icon: UserCog2Icon,
      display:  (address && currentUser ) ? true : false,
      isActive: pathname === `/settings/${address}`
    },
    {
      title: "About Us",
      url: "/about-us",
      icon: User,
      display: true,
      isActive: pathname === "/about-us"
    },
   


  ];

  return (
<Sheet>
  <SheetTrigger className='hover:bg-(--hacker-green-4) transition-all cursor-pointer text-xs bg-zinc-700 p-2 rounded-lg text-white'>
        <PanelLeftIcon size={16} className='text-xs' />
  </SheetTrigger>
  <SheetContent side='left' style={{zIndex:9999999}} className='bg-zinc-800 text-white rounded-r-lg shadow-green-300  border-(--hacker-green-4)  border-r-4  max-w-64 w-full p-2 '>
    
    <SheetHeader className='flex items-center justify-between gap-2 p-2'>
                  <Image src={'/Web3Builders.png'} alt='logo' width={32} height={32} className='w-8 h-8 rounded-lg'/>

      <SheetTitle className='text-lg text-white'>Web3 Builders
        <span className='text-(--hacker-green-4)'>DAO</span>

      </SheetTitle>
    
    </SheetHeader>

<div className="flex flex-col justify-between gap-6 w-full h-full">
<div className="flex flex-col w-full gap-2">
  
 {items.map((item) => (
                  <div  key={item.title} className='w-full'>
                    <Button className={`${item.isActive ? 'bg-(--hacker-green-4) hover:bg-(--hacker-green-2)': 'hover:bg-(--hacker-green-4)'} w-full transition-all ${item.display ? '' : 'hidden'}`} asChild>
                      <a href={item.url}>
                        <item.icon size={48} className=' text-5xl' />
                        <span className=''>{item.title}</span>
                      </a>
                    </Button>
                  </div>
                ))}
</div>


    <div className="flex flex-col w-full gap-2 justify-between items-center">
      <ConnectKitButton    />
    </div>
</div>

    
  </SheetContent>
</Sheet>
  )
}

export default SlidingSidebar