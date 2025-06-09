'use client';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ArrowDownWideNarrowIcon, Funnel } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback } from 'react'

type Props = {}

function DropdownBar({}: Props) {

  const router = useRouter();

const setSortingParam = useCallback((param: { sortingProperty: string, sortingOrder: string }) => {
  const params = new URLSearchParams(window.location.search); // 🧠 preserve existing
  params.set('sortingProperty', param.sortingProperty);
  params.set('sortingOrder', param.sortingOrder);
  router.push(`${window.location.pathname}?${params.toString()}`);
}, [router]);

const setFilterParam = useCallback((param: { filterProperty: string, filterValue: any }) => {
  const params = new URLSearchParams(window.location.search);
  params.set('filterProperty', param.filterProperty);
  params.set('filterValue', param.filterValue);
  router.push(`${window.location.pathname}?${params.toString()}`);
},[router]);
  
  return (
    <div className='flex items-center gap-2 py-3'>
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
  <DropdownMenuItem onClick={()=>setFilterParam({filterProperty:'state', filterValue:0})} className='cursor-pointer'>
        Pending Voting
    </DropdownMenuItem>
    <DropdownMenuItem onClick={()=>setFilterParam({filterProperty:'state', filterValue:1})} className='cursor-pointer'>
        Live Voting
    </DropdownMenuItem>
        <DropdownMenuItem onClick={()=>setFilterParam({filterProperty:'state', filterValue:2})} className='cursor-pointer'>
        Canceled Voting
    </DropdownMenuItem>
           <DropdownMenuItem onClick={()=>setFilterParam({filterProperty:'state', filterValue:3})} className='cursor-pointer'>
       Defeated Voting
    </DropdownMenuItem>
           <DropdownMenuItem onClick={()=>setFilterParam({filterProperty:'state', filterValue:4})} className='cursor-pointer'>
        Succeeded Voting 
    </DropdownMenuItem>
           <DropdownMenuItem onClick={()=>setFilterParam({filterProperty:'state', filterValue:5})} className='cursor-pointer'>
       Queued Voting 
    </DropdownMenuItem>
        <DropdownMenuItem onClick={()=>setFilterParam({filterProperty:'state', filterValue:6})} className='cursor-pointer'>
     Executed Voting 
    </DropdownMenuItem>
          <DropdownMenuItem onClick={()=>setFilterParam({filterProperty:'isCustom', filterValue:'true'})} className='cursor-pointer'>
     Custom Voting 
    </DropdownMenuItem>
          <DropdownMenuItem onClick={()=>setFilterParam({filterProperty:'isCustom', filterValue:'false'})} className='cursor-pointer'>
     Standard Voting 
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

    <DropdownMenuItem onClick={()=>setSortingParam({sortingProperty:'proposal_title', sortingOrder:'ascending'})} className='cursor-pointer'>
        Alphabetical (A-Z)
    </DropdownMenuItem>
    <DropdownMenuItem onClick={()=>setSortingParam({sortingProperty:'proposal_title', sortingOrder:'descending'})} className='cursor-pointer'>
        Alphabetical (Z-A)
    </DropdownMenuItem>
    <DropdownMenuItem onClick={()=>setSortingParam({sortingProperty:'created_at', sortingOrder:'descending'})} className='cursor-pointer'>
        Most recent
    </DropdownMenuItem>
    <DropdownMenuItem onClick={()=>setSortingParam({sortingProperty:'created_at', sortingOrder:'ascending'})} className='cursor-pointer'>
        Least recent
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

    </div>
  )
}

export default DropdownBar