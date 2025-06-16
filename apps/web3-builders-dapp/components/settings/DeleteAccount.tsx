'use client';
import React from 'react'
import { Button } from '../ui/button'
import useGetLoggedInUser from '@/hooks/useGetLoggedInUser';
import { toast } from 'sonner';

type Props = {}

function DeleteAccount({}: Props) {

const {currentUser}=useGetLoggedInUser();


    const handleDeleteAccount=async ()=>{
try{

    if(!currentUser.discord_member_id){
        toast.success('You are not logged in or no such user in DB !');
        return;
    }
      const fetchDelete=await fetch(`http://localhost:2137/gov_token/influence/remove/${currentUser.discord_member_id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
          'x-backend-eligibility': process.env.NEXT_PUBLIC_FRONTEND_ACCESS_SECRET as string,
          'authorization': `Bearer ${currentUser.discord_member_id}`
        },
    });

    console.log(fetchDelete);

    const res=await fetchDelete.json();
    console.log(res);


}catch(err){
    console.log(err);
}

    }


  return (
    <div className='flex flex-col text-white gap-2'>
      <div className="">
          <p className='text-base font-bold
        '>Delete Account</p>
        <p className='text-xs'>If you are no longer willing to participate in our DAO, you can delete your account.</p>
      </div>

      <Button
      onClick={handleDeleteAccount}
      className='cursor-pointer hover:scale-95 bg-red-500 hover:bg-red-700 text-white'>
        Delete
      </Button>
    </div>
  )
}

export default DeleteAccount