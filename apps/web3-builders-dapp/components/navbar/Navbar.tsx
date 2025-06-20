'use client';

import React from 'react'
import { Button } from '../ui/button'

import { useRouter } from 'next/navigation';
import { ConnectKitButton } from 'connectkit';
import { SidebarTrigger } from '../ui/sidebar';
import Link from 'next/link';
import { useAccountEffect, useSignMessage } from 'wagmi';
import { config } from '@/lib/config';
import { toast } from 'sonner';
import { supabase } from '@/lib/db/supabaseConfigClient';
import { TokenState, useStore } from '@/lib/zustandConfig';

type Props = {}

function Navbar({}: Props) {
  const router = useRouter();
  const { signMessageAsync } = useSignMessage({ config });
const setToken = useStore((state) => (state as TokenState).setToken);
const unsetToken = useStore((state) => (state as TokenState).unsetToken)

const token = useStore((state) => (state as TokenState).token);
  useAccountEffect({
    onConnect: async ({ address }) => {
      if (typeof window === 'undefined') return;

      if (!token) {
        await signMessageAsync({ message: `Welcome message...` });
        const res = await fetch("/api/auth/wallet", {
          method: "POST",
          body: JSON.stringify({ address }),
        });
        const { token } = await res.json();
        setToken(token);
      }
    },
    onDisconnect: () => {
      unsetToken();
      toast('You have been disconnected ! We hope to see you again !');
    }
  });

  return (
    <div className='w-full sticky top-0 left-0 h-16 bg-zinc-900 flex p-2 justify-center items-center
    z-[9999]
    '>

<div className="flex items-center justify-between gap-2 w-full max-w-7xl">
        <Link href={'/'} className=' @min-xs:text-xl lg:text-2xl text-(--hacker-green-4) font-bold'>Web3 Builders DAO</Link>


<div className=" justify-between hidden lg:flex  items-center gap-3">
<Button className='cursor-pointer
 bg-(--hacker-green-4) hover:bg-(--hacker-green-5)
 hover:text-white
 transition-all 
 '

 variant={'secondary'} onClick={()=>router.push('/')}>Home</Button> 

  <Button 
  className='cursor-pointer
  bg-(--hacker-green-4) hover:bg-(--hacker-green-5)
  hover:text-white
  transition-all 
  '
  variant={'secondary'} onClick={async ()=>{
     await supabase.from('dao_members').select('*').single();
    console.log(supabase);
  }}>About Us</Button>
</div>

<div className="flex items-end gap-2">
  <div className="hidden md:block">

<ConnectKitButton    />
  </div>
<SidebarTrigger className='hover:bg-(--hacker-green-4) cursor-pointer bg-zinc-800 text-white'/>
</div>



</div>


 
    </div>
  )
}

export default Navbar