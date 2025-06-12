'use client';

import { GOVERNOR_CONTRACT_ADDRESS, governorContractAbi } from '@/contracts/governor/config';
import { TOKEN_CONTRACT_ADDRESS, tokenContractAbi } from '@/contracts/token/config';
import useRealtimeDocuments from '@/hooks/useRealtimeDocuments';
import { config } from '@/lib/config';
import { CloudLightningIcon, CoinsIcon, FilePlus2Icon, LucideVote, SmartphoneChargingIcon } from 'lucide-react'
import React from 'react'
import { readContract } from 'viem/actions';
import { useAccount, useReadContracts } from 'wagmi';


type Props
 = {objectData:any, walletAddress:string};

function MemberDetails({objectData, walletAddress}: Props) {



const tokenContractData =   {
    address:TOKEN_CONTRACT_ADDRESS,
    abi:tokenContractAbi
} as const;

const governorContractData= {
    address: GOVERNOR_CONTRACT_ADDRESS,
    abi:governorContractAbi
} as const;

    const {data}=useReadContracts({
        contracts:[
            {
              ...tokenContractData,
                functionName:'balanceOf',
                args:[walletAddress]
              },
              {
                ...tokenContractData,
                functionName:'totalSupply',
              }, 
                {
                    ...governorContractData,
                    functionName:'getUserVotedCount',
                    args:[walletAddress]
                }
             
        ]
    });





  return (
    <div
    className='
    bg-zinc-800 lg:max-w-3xl max-w-2xl w-full rounded-lg flex flex-col gap-3 p-2 border border-(--hacker-green-4)
 min-h-64 
    '    
    >
<div className="
flex items-center gap-2 self-center
">
    <CoinsIcon
    size={32}
    className='text-(--hacker-green-4) 

    '/>
    <span className='text-white text-lg lg:text-xl'>
     {isNaN(Number(data?.[0].result)) ? 0 : (Number(data?.[0].result) / 10**18).toFixed(2)}<span className='text-(--hacker-green-4) font-semibold'> BUILD</span>
    </span>
</div>

<div className="flex items-center sm:flex-row gap-6 justify-center">
    
    <div className="bg-zinc-900 px-2 py-6 max-w-44  sm:max-w-64 text-white rounded-md lg:max-w-1/3  w-full flex justify-between items-center gap-2 flex-col">

<LucideVote
size={24}
className='
text-(--hacker-green-4)
'
/>

<span onClick={()=>{console.log(data)}} className='
text-2xl
lg:text-3xl
font-bold
'>
{isNaN(Number(data?.[2].result)) ? 0 : Number(data?.[2].result)}
</span>

<span
className='text-sm lg:text-base'
>
    Casted Votes
</span>

    </div>


    <div className="
    bg-zinc-900 px-2
    py-6 max-w-44  sm:max-w-64
    text-white rounded-md lg:max-w-1/3 w-full
    flex justify-between
     items-center gap-2 flex-col
    ">

<SmartphoneChargingIcon
size={24}
className='
text-(--hacker-green-4)
'
/>

<span className='
text-lg md:text-2xl
font-bold
'>
  {isNaN((Number(data?.[0].result) / Number(data?.[1].result) * 100)) ? 0 : (Number(data?.[0].result) / Number(data?.[1].result) * 100).toFixed(2)}%
</span>

<span className='text-sm lg:text-base'>

    Voting Power
</span>

    </div>

    <div className="
      bg-zinc-900 px-2
    py-6
    text-white rounded-md lg:max-w-1/3 max-w-44  sm:max-w-64 w-full
    flex justify-between
     items-center gap-2 flex-col
    ">

<FilePlus2Icon
    
size={24}
className='
text-(--hacker-green-4)
'
/>

<span className='
text-2xl lg:text-3xl
font-bold
'>
    <p >{objectData && objectData.dao_proposals.length}</p>
</span>


<span className='text-xs sm:text-sm text-center lg:text-base'
> Created Proposals
</span>

    </div>
</div>

    </div>
  )
}

export default MemberDetails