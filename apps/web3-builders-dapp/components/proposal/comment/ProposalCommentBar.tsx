'use client';

import { LucideMessageCircle } from 'lucide-react'
import React from 'react'
import CommentList from './CommentList'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FaPaperPlane } from 'react-icons/fa'
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { supabase } from '@/lib/db/supabaseConfigClient';


type Props = {
  state: 'expanded' | 'collapsed',
  proposalData: any[],
  proposalId: string
}

function ProposalCommentBar({state, proposalData, proposalId}: Props) {
  const {address}=useAccount();




  const zodMessageObject=z.object({
    message: z.string().min(1,{message:'Message must be at least 1 character'}).max(500, {message:'Message must be less than 500 characters'}),
  })

  const methods=useForm<z.infer<typeof zodMessageObject>>({
    resolver: zodResolver(zodMessageObject),
    defaultValues:{'message':''}
  });

  const insertNewComment=async (values:{message: string})=>{
    try{
    const {data:success, error}=  await supabase.from('dao_voting_comments').insert([{
        proposal_id: proposalId,
        message: values.message,
        user_wallet_id: address,
      }]);

      if(!error){
        methods.reset();
        toast.success('Comment added successfully !');
      }

    }catch(err){
      toast.error('Something went wrong !');
      console.log(err);
    }
  }


  return (
<div className={` ${state === 'expanded' ? 'w-full border-0 bg-none lg:max-w-sm lg:border-(--hacker-green-4) lg:bg-zinc-800 ': 'border-none  lg:max-w-sm lg:border-(--hacker-green-4) lg:bg-zinc-800'}   w-full md:flex  h-full lg:max-h-[42rem] rounded-lg border   flex-col justify-between`}>
<div className="flex flex-col gap-1">
<div className="flex items-center gap-2 p-3 text-white">
  <LucideMessageCircle size={32} className='text-(--hacker-green-4)' />
  <p className='text-xl'>Comments</p>
</div>


  <CommentList state={state} commentsData={proposalData} />

</div>
<Form {...methods}>
  <form onSubmit={methods.handleSubmit(insertNewComment, error=>console.log(error))} className="bg-zinc-900 h-16 w-full rounded-b-lg flex items-center border-t border-(--hacker-green-4) px-2">
    <div className="flex w-full justify-between items-center gap-2 px-2">
      <Input {...methods.register('message', {
        required: true,
        minLength: 1,
      })} placeholder='Write a comment...' className='max-w-sm p-2 w-full bg-zinc-800 rounded-sm border-0 text-white outline-none'/>
    </div>
    <Button type='submit' className='bg-(--hacker-green-4) hover:bg-(--hacker-green-5) hover:text-white hover:scale-95 transition-all cursor-pointer text-zinc-800'><FaPaperPlane size={40} /></Button>
  </form>
</Form>
</div>
  )
}

export default ProposalCommentBar