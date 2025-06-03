import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import React from 'react'

type Props = {
    TriggerButton: () => React.ReactNode,
    castVoteFunction: () => void,
    dialogTitle:string,
    typeReasonFunction: (value: string) => void

}

function VotingStandardModal({TriggerButton, dialogTitle,typeReasonFunction, castVoteFunction}: Props) {
  return (
    <Dialog>
  <DialogTrigger>
    <TriggerButton/>
  </DialogTrigger>
  <DialogContent className='bg-zinc-800 text-white max-w-md w-full h-96 border-2 border-(--hacker-green-4) shadow-lg shadow-green-500'>
 <DialogHeader>
<DialogTitle className='text-(--hacker-green-4) text-lg'>
{dialogTitle}
</DialogTitle>
        </DialogHeader>


        <Textarea placeholder='Enter your reason.....' onChange={(e)=>typeReasonFunction(e.target.value)} className='w-full h-52 resize-none border border-(--hacker-green-4)' />

<DialogFooter>
    <Button className='bg-(--hacker-green-4) text-zinc-800 cursor-pointer hover:bg-(--hacker-green-5)' onClick={castVoteFunction}>Cast Vote</Button>
</DialogFooter>
  </DialogContent>
</Dialog>
  )
}

export default VotingStandardModal