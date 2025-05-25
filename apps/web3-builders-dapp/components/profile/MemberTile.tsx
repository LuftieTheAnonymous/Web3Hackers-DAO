
import { formatDate } from 'date-fns'
import Image from 'next/image'
import React from 'react'
type Props = {
objectData:any
}

function MemberTile({objectData}: Props) {
  return (
    <div className='max-w-72 w-full bg-zinc-800 rounded-lg flex flex-col gap-3 border border-(--hacker-green-4)
     p-2 items-center
    '>

        <div
        className='w-40
         h-40
          bg-zinc-600 rounded-full 
         '>
     {objectData && objectData.photoURL && <Image alt={'avatar'} src={objectData.photoURL} width={160} height={160} className='rounded-full w-40 h-40'/>}
        </div>
        <p className='text-white text-sm'>
            @{objectData.nickname}
        </p>
        <p className="text-(--hacker-green-4) text-xs">
          Joined  {formatDate(objectData.created_at, 'dd/MM/yyyy')}
        </p>
    </div>
  )
}

export default MemberTile