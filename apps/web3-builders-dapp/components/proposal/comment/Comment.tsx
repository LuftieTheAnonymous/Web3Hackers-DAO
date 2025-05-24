import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import React from 'react'

type Props= {state: 'expanded' | 'collapsed',   commentObj:any}

function Comment({state, commentObj}: Props) {
  return (
   <>
   {commentObj && <div className={`flex flex-col gap-1 p-2 ${state === 'expanded' ? 'bg-zinc-800 lg:bg-zinc-900' : 'bg-zinc-900'}  mx-1 max-w-2xl rounded-lg`}>
    <div className="flex items-center gap-2 p-2">
      <div className="w-10 h-10 bg-zinc-600 rounded-full">
        {commentObj.dao_members && commentObj.dao_members.photoURL && <Image alt={'avatar'} src={commentObj.dao_members.photoURL} width={40} height={40} className='rounded-full w-full h-full'/>}
      </div>
      <div className="flex items-center gap-2">
        <p className='text-white text-sm'>@{commentObj.dao_members && commentObj.dao_members.nickname}</p>
        <p className='text-(--hacker-green-4) text-xs'>{formatDistanceToNow(commentObj.created_at)} ago</p>
      </div>
    </div>
      <div className="text-white text-sm px-2">
        <p>{commentObj.message}</p>
      </div>
    </div>}
   </>
  )
}

export default Comment