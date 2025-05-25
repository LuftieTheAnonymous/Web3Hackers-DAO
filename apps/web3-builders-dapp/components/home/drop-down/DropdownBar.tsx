import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ArrowDownWideNarrowIcon, Funnel } from 'lucide-react';
import React from 'react'

type Props = {}

function DropdownBar({}: Props) {
  return (
    <div className='flex items-center gap-2
    py-3
    '>
        <DropdownMenu>
  <DropdownMenuTrigger 
    className='
    bg-(--hacker-green-4)
    px-6 py-2 rounded-lg cursor-pointer
    flex items-center gap-3
    hover:bg-(--hacker-green-5) 
    hover:text-white transition-all
     hover:scale-95
    ' 
  
  >
    Filters
    <Funnel/>
  </DropdownMenuTrigger>
  <DropdownMenuContent
  className='
  bg-zinc-800 text-white border border-green-400
  '
  >
           <DropdownMenuItem className='cursor-pointer'>
        Pending Voting
    </DropdownMenuItem>
    <DropdownMenuItem className='cursor-pointer'>
        Live Voting
    </DropdownMenuItem>
        <DropdownMenuItem className='cursor-pointer'>
        Voting Closed
    </DropdownMenuItem>
        <DropdownMenuItem className='cursor-pointer'>
     Executed Voting 
    </DropdownMenuItem>
 
  </DropdownMenuContent>
</DropdownMenu>

<DropdownMenu>
  <DropdownMenuTrigger
   className='
   bg-(--hacker-green-4)
   px-6 py-2 rounded-lg cursor-pointer
   flex items-center gap-3
   hover:bg-(--hacker-green-5) 
   hover:text-white transition-all
    hover:scale-95
   ' 
  >
    Sorting <ArrowDownWideNarrowIcon/>
  </DropdownMenuTrigger>
  <DropdownMenuContent
className=' bg-zinc-800 text-white border border-green-400'
  >

    <DropdownMenuItem className='cursor-pointer'>
        Alphabetical (A-Z)
    </DropdownMenuItem>
    <DropdownMenuItem className='cursor-pointer'>
        Alphabetical (Z-A)
    </DropdownMenuItem>
    <DropdownMenuItem className='cursor-pointer'>
        Most recent
    </DropdownMenuItem>
    <DropdownMenuItem className='cursor-pointer'>
        Least recent
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

    </div>
  )
}

export default DropdownBar