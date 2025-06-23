'use client';
import { UserIcon } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { Input } from '../ui/input'
import { FaImage } from 'react-icons/fa'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { toast } from 'sonner';
import { useAccount } from 'wagmi';
import useRealtimeDocument from '@/hooks/useRealtimeDocument';
import Image from 'next/image';

import DeleteAccount from './DeleteAccount';
import { TokenState, useStore } from '@/lib/zustandConfig';
import { createSupabaseClient } from '@/lib/db/supabaseConfigClient';
import { description } from '../profile/container/charts/VotingsParticipatedChart';


type Props = {intialDocument:any}

function UserProfileTile({intialDocument}: Props) {
  const [customCover, setCustomCover] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {address}=useAccount();

  const {objectData}=useRealtimeDocument({initialObj:intialDocument, tableName:'dao_members'});
    const token = useStore((state) => (state as TokenState).token);
     const supabase =  createSupabaseClient(!token ? '' : token);
  

  const handleFileUpload=(e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    
    if (file) {
      if(file.size > 10000000){
        toast.error('File size exceeds 10MB limit')
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        console.log(base64String);
        setCustomCover(base64String);
      };
      reader.readAsDataURL(file);
    } 

  }

  const handleSave=async()=>{
try{

  const image = await supabase.storage.from('profile-cover').upload(`${address}`, fileInputRef.current?.files?.[0] as File, {
    upsert: true,
  });
  console.log(image);

  if(image.error){
    toast.error('Something went wrong !');
    console.log(image.error);
    return;
  }

  const { data } =  supabase.storage.from('profile-cover').getPublicUrl(`${address}`);

  if(!data.publicUrl){
    toast.error('Something went wrong while uploading the image !');
    return;
  }

    await supabase.from('dao_members').update({photoURL: data.publicUrl, nickname: objectData.nickname, description: objectData.description}).eq('userWalletAddress', address);
    toast.success('Profile updated successfully !');

}catch(e){
  console.log(e);
}
  }

  return (
     <div className="flex flex-col overflow-y-auto gap-3 justify-between max-w-sm w-full bg-zinc-800 border border-(--hacker-green-4) self-center h-[36rem] p-4 rounded-md">
  <div className="flex flex-col gap-6">
                <p className='text-xl text-white font-semibold flex items-center gap-2'>Information <UserIcon className='text-(--hacker-green-4)' size={32}/> </p>
        
          <div className="flex flex-col gap-4 p-2">
<div onClick={() => fileInputRef.current?.click()} className='w-36 self-center h-36 cursor-pointer bg-zinc-700 rounded-full flex justify-center items-center'>
{objectData && objectData.photoURL && !customCover && <Image alt={'avatar'} src={objectData.photoURL} width={160} height={160} className='rounded-full object-cover w-36 h-36'/>}
 {objectData && objectData.photoURL && customCover && <img src={customCover} className='w-36 h-36 rounded-full object-cover'/> }
 {!objectData && <FaImage className='text-(--hacker-green-4) text-2xl'/>}
  <input onChange={handleFileUpload} accept='image/*' ref={fileInputRef} type="file" className='hidden'/>
</div>
<div className="flex flex-col gap-2">
  <p className='text-(--hacker-green-4)'>Username</p>
  <Input onChange={(e)=>{
    if(objectData){
      objectData.nickname=e.target.value
    }
  }} defaultValue={objectData?.nickname} placeholder='Enter your username....' className='max-w-xs w-full text-white'/>
</div>

<div className="flex flex-col gap-2">
  <p className='text-(--hacker-green-4)'>Bio</p>
  <Textarea onChange={(e)=>{
       if(objectData){
      objectData.description=e.target.value
    }
  }}  defaultValue={objectData?.description} placeholder='Enter your bio....' className='max-w-xs resize-none w-full h-24 text-white'/>
</div>
          </div>
    
        

             
    
              </div>

<DeleteAccount/>


<div className='self-end'>
  <Button onClick={handleSave}  className='bg-(--hacker-green-4) px-6 text-zinc-800 cursor-pointer hover:bg-(--hacker-green-5) hover:text-white hover:scale-90'>
    Save
  </Button>
</div>

    </div>
  )
}

export default UserProfileTile