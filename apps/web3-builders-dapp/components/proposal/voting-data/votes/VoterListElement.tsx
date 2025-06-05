import { Button } from '@/components/ui/button'
import React from 'react'

type Props = {
 voteData:any,
}

function VoterListElement({voteData}: Props) {
  return (
        
        <div onClick={()=>{console.log(voteData)}} className="flex flex-col w-full gap-4 ">
      <div className="flex justify-between items-center bg-zinc-700 w-full p-4 rounded-lg h-16">
        <div className="flex items-center gap-2">
        <div className="flex flex-col gap-1">
            <p className='text-(--hacker-green-4) text-sm'>{voteData.voter}</p>
            <p className='text-white text-xs'>
              Voted For: 
   <span
  className={
    voteData.isCustom
      ? voteData.isApprovingVote
        ? 'text-(--hacker-green-4)'
        : voteData.isDefeatingVote
        ? 'text-red-500'
        : 'text-white'
      : Number(voteData.voteOption) === 0
      ? 'text-(--hacker-green-4)'
      : Number(voteData.voteOption) === 1
      ? 'text-blue-500'
      : Number(voteData.voteOption) === 2
      ? 'text-red-500'
      : 'text-white'
  }
>{" "}
   {voteData.isCustom ? (
     voteData.voteOption
  ) : Number(voteData.voteOption) === 0 ? (
    ' Approve'
  ) : Number(voteData.voteOption) === 1 ? (
    ' Abstain'
  ) : Number(voteData.voteOption) === 2 ? (
    ' Defeat'
  ) : (
    ''
  )}
</span>


              </p>
        </div>

        </div>
        {voteData.reason.trim().length > 0 && <Button className='cursor-pointer transition-all hover:scale-95 hover:bg-(--hacker-green-5) hover:text-white bg-(--hacker-green-4) text-zinc-800'>Reason</Button>}
      </div>
        </div>

  )
}

export default VoterListElement