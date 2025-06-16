'use client'

import React from 'react'

type Props = {}

import { Home, User, UserCog2Icon, UserRoundPenIcon } from "lucide-react"
 
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import ProposalModal from '../modal/ProposalModal'
import { ConnectKitButton } from 'connectkit'

import { useAccount } from 'wagmi'
import { usePathname } from 'next/navigation'
import useGetLoggedInUser from '@/hooks/useGetLoggedInUser'


 function SidebarComponent({}: Props) {

  const {address}=useAccount();
  const pathname=usePathname();
  const {currentUser}=useGetLoggedInUser();


    // Menu items.
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
    <>
        <Sidebar className='max-w-32 w-full bg-zinc-800'>
        <SidebarContent className='text-white flex flex-col justify-between   py-16 md:pt-0 bg-zinc-800'>
      
          <SidebarGroup className='flex flex-col gap-4'>
            <SidebarGroupContent>
              <SidebarMenu className='flex flex-col gap-2 justify-center items-center'>
                {items.map((item) => (
                  <SidebarMenuItem  key={item.title}>
                    <SidebarMenuButton className={`${item.isActive ? 'bg-(--hacker-green-4) hover:bg-(--hacker-green-2)': 'hover:bg-(--hacker-green-4)'}   transition-all ${item.display ? '' : 'hidden'}`} asChild>
                      <a href={item.url}>
                        <item.icon size={48} className=' text-5xl' />
                        <span className='hidden lg:block'>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

              </SidebarMenu>
               
                 {(address && currentUser ) && <ProposalModal>
                  <SidebarMenuButton className='hover:bg-(--hacker-green-4) cursor-pointer transition-all w-full' asChild>
               <div className='flex items-center gap-2 px-2'>
                      <UserRoundPenIcon />
                      <span className='hidden lg:block'>Propose</span>
               </div>
                  </SidebarMenuButton>
                  </ProposalModal>}
             
            </SidebarGroupContent>
          </SidebarGroup>

<div className="md:hidden self-center">
<ConnectKitButton  />
</div>

         
         
        </SidebarContent>
      </Sidebar>
    </>
      )
}

export default SidebarComponent