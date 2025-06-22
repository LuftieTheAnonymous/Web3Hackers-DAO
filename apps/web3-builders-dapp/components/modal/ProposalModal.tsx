'use client';
import { z } from 'zod';
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { FormProvider, useForm
} from 'react-hook-form'
import { StepContainer } from './steps/Steps';
import {readContract} from "@wagmi/core";
import {config} from '@/lib/config';
import {AiOutlineLoading3Quarters } from 'react-icons/ai';

type Props = {children: React.ReactNode}
// Emoji regex — catches most emojis, flags, skin tones, etc.
const emojiRegex = /^[^\p{Emoji_Presentation}\p{Extended_Pictographic}]*$/u;


export const proposalObject = z.object({
  title: z.string().min(1),

  shortDescripton: z.string().min(1,{

message: 'Title must be at least 1 character',
}
).max(100,
{
  message: 'Title must be less than 100 characters',
}
).regex(emojiRegex, 'Invalid title, emoji characters found'),
longDescription: z.string().min(1, {
message:'Description must be at least 1 character',
}),


functionsCalldatas:z.array(z.object({
target: z.string().startsWith('0x').length(42,{message:'Invalid address'}),
value: z.bigint(),
calldata: z.string(),
destinationAddress: z.string().startsWith('0x').length(42,{message:'Invalid address'}),
tokenAmount:z.bigint({'message':'Token Amount must be a number'}),
})),

proposalEndTime: z.date({'message':'proposalEndTime must be a date'}),
proposalEndtimeHour: z.optional(z.number({'message':'The proposal end time hour must be a number'})),
proposalEndTimeMinutes:  z.optional(z.number({'message':'The proposal end time minutes must be a number'})),


proposalDelay: z.number({'message':'proposalDelay must be a number'}),
proposalDelayUnit: z.number({'message':'proposalDelayUnit must be a number'}),

timelockPeriod: z.number({'message':'timelockPeriod must be a number'}),
timelockUnit: z.number({'message':'timelockUnit must be a number'}),

urgencyLevel: z.bigint({'message':'urgencyLevel must be a number'}),

isCustom: z.string().min(1,{'message':'The voting type must be selected'}),

customVotesOptions: z.array(z.object({
title: z.string(),
calldataIndicies: z.array(z.number()).optional(),
})).length(5).optional(),

});

import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from '../ui/form';
import { useAccount, useBlockNumber, usePublicClient, useReadContract, useWaitForTransactionReceipt, useWatchContractEvent, useWriteContract } from 'wagmi';
import { GOVERNOR_CONTRACT_ADDRESS, governorContractAbi } from '@/contracts/governor/config';
import { TOKEN_CONTRACT_ADDRESS, tokenContractAbi } from '@/contracts/token/config';
import { decodeEventLog, encodeFunctionData } from 'viem';
import { toast } from 'sonner';
import { FaCheckCircle, FaTruckLoading } from 'react-icons/fa';

import useGetLoggedInUser from '@/hooks/useGetLoggedInUser';
import { TokenState, useStore } from '@/lib/zustandConfig';
import { createSupabaseClient } from '@/lib/db/supabaseConfigClient';



function ProposalModal({children}: Props) {
const {address}=useAccount();
const [currentStep, setCurrentStep] = useState<number>(0);
const {writeContractAsync,writeContract, data, isError: writeContractIsError, error: writeContractError, isPending: writeContractIsPending, isIdle, isPaused, isSuccess: writeContractIsSuccess}=useWriteContract();
const client = usePublicClient();
const {currentUser}=useGetLoggedInUser();
const {data:receipt, isError, error, isLoading, isSuccess, isPending, isPaused:waitForTransactionError, isLoadingError, errorUpdatedAt,}=useWaitForTransactionReceipt({
  hash:data as `0x${string}`,
  'onReplaced': async (replaceData) => {


    console.log(replaceData, 'replaced transaction data');
  },
  
  });
    const token = useStore((state) => (state as TokenState).token);
     const supabase =  createSupabaseClient(!token ? '' : token);
  useWatchContractEvent({
    'abi': governorContractAbi,
    'address': GOVERNOR_CONTRACT_ADDRESS,
    'eventName': 'ProposalCreated',
    'onLogs': async (logs) => {
      console.log(logs, 'proposal created logs');
      toast.success('Proposal created successfully !');
    }
  })


const methods = useForm<z.infer<typeof proposalObject>>({
  resolver: zodResolver(proposalObject),
  defaultValues: {
    title: "",
    longDescription: "",
    shortDescripton: "",
    isCustom: '',
    functionsCalldatas: [],
    urgencyLevel: BigInt(0),
    customVotesOptions: [
      {
        'calldataIndicies':[],
        'title':'',
      },
      {
        'calldataIndicies':[],
        'title':'',
      },
      {
        'calldataIndicies':[],
        'title':'',
      },
      {
        'calldataIndicies':[],
        'title':'',
      },
      {
        'calldataIndicies':[],
        'title':'',
      }
    ]
  }
});

async function onSubmit(values: z.infer<typeof proposalObject>) {
 try{
  console.log(values);

  if(!currentUser){
    toast.error('You must be logged in to create a proposal');
    return;
  }

  const proposalEligility = await fetch(`http://localhost:2137/governance/create-proposal-eligibility/${currentUser.discord_member_id}`, {
    method:'POST',
    headers:{
      'x-backend-eligibility': process.env.NEXT_PUBLIC_FRONTEND_ACCESS_SECRET as string,
      authorization:`Bearer ${currentUser.discord_member_id}`,
    }
  });

  const res=await proposalEligility.json();
  console.log(res);
  if(res.error && !res.data){
    toast.error(`${res.error.code}: ${res.error}`);
    return;
  }




  const targets= values['functionsCalldatas'].map((item) => item['target']);
  const calldataValues = values['functionsCalldatas'].map((item) => BigInt(item['value']));

  console.log(calldataValues);

  const calldataEndodedBytes = values['functionsCalldatas'].map((item) =>  encodeFunctionData({
    abi: tokenContractAbi,
    functionName: item.calldata.slice(0, item.calldata.indexOf('(')),
      args: [item['destinationAddress'], BigInt(Number(item['tokenAmount']) * 1e18)],
    }));


  writeContractAsync({
      abi: governorContractAbi,
      address: GOVERNOR_CONTRACT_ADDRESS,
      type:'eip1559',
      functionName:'createProposal',
      args:[
      values['shortDescripton'],
      targets,
      calldataValues,
      calldataEndodedBytes,
      BigInt(values['urgencyLevel']),
      values['isCustom'] === 'standard' ? false : true,
      BigInt(new Date(values['proposalEndTime']).getTime()) / BigInt(1000),
      BigInt(Number(values['timelockPeriod']) * Number(values['timelockUnit'])),
      BigInt(Number(values['proposalDelay']) * Number(values['proposalDelayUnit']))
      ],
    },{
     onError: (error) => {
        console.log(error);
        toast('Proposal creation failed 🤬 ! Try again later 😉');
      },
      'onSuccess': (data) => {
        console.log(data);
        toast('Proposal Creation Transaction Created successfully 🎉 !');
      },
      onSettled: async (data, error, variables, context)=> {
        console.log(data);
        console.log(error);
        console.log(variables);
        console.log(context);

         const receipt = await client!.waitForTransactionReceipt({hash: data as `0x${string}`});

        const log = decodeEventLog({
          abi: governorContractAbi,
          'eventName': 'ProposalCreated',
          data: receipt!.logs[0].data,
        'topics': receipt!.logs[0].topics,
        });

        console.log(log.args);

        const {id, proposer}=log.args as unknown as {id: BigInt, proposer: `0x${string}`};

        const proposalSet = await readContract(config, {
          abi: governorContractAbi,
          address: GOVERNOR_CONTRACT_ADDRESS,
          functionName: 'getProposal',
          args:[id],
        });

        if(proposalSet){

          console.log(values);

          const proposalObj = await supabase.from('dao_proposals').insert([{
            proposal_id: id,
            proposer_id: proposer,
            created_at: new Date(),
            proposal_description: values['longDescription'],
            proposal_title: values['title'],
            isCustom: values['isCustom'] === 'custom' ? true : false,
            proposal_delay: Math.floor(Number(values['proposalDelay']) * Number(values['proposalDelayUnit'])).toFixed(0),
            expires_at: new Date(Number(values['proposalEndTime'])),
          }]);

          if(proposalObj.error) {
            console.log(proposalObj.error);
             toast.error(proposalObj.error.message);
            throw new Error(proposalObj.error.message);
          }


          const calldataRows = values.functionsCalldatas.map((item) => ({
  proposal_id: id,
  method_signature: encodeFunctionData({
    abi: tokenContractAbi,
    functionName: item.calldata.slice(0, item.calldata.indexOf('(')),
    args: [item.destinationAddress, BigInt(Number(item.tokenAmount) * 1e18)],
  }),
  target_address: item.target,
  value: Number(item.value),
  addressParameter: item.destinationAddress,
  amountParameter: Number(item.tokenAmount),
  isFunctionRewarding: false,
  isFunctionPunishing: false,
  functionDisplayName: item.calldata,
}));

         const calldataObjs = await supabase.from('calldata_objects').insert(calldataRows); 

         if(calldataObjs.error) {
          console.log(calldataObjs.error);
          toast.error(calldataObjs.error.message);
            throw new Error(calldataObjs.error.message);
          }


   if (values.isCustom === 'custom' && values.customVotesOptions && values.customVotesOptions?.length > 0) {
  const voteOptionRows = values.customVotesOptions.map((item, index) => ({
    proposal_id: id,
    calldata_indicies: item.calldataIndicies && item.calldataIndicies.map((index) => Number(index)),
    voteOptionIndex: index,
    isExecuting: item.calldataIndicies && item.calldataIndicies?.length > 0,
    isDefeating: item.calldataIndicies && item.calldataIndicies?.length === 0,
    voting_option_text: item.title,
  }));

  const voteOptionObjs = await supabase.from('dao_vote_options').insert(voteOptionRows);

  if(voteOptionObjs.error) {
    console.log(voteOptionObjs.error);
    toast.error(voteOptionObjs.error.message);
    throw new Error(voteOptionObjs.error.message);
  }
}
        }
      },
    });
 }catch(err){
  console.log(err);
 }


}

const {data:blockNumber}=useBlockNumber();

const {
  data: delegateData,
}=useReadContract({
  abi: tokenContractAbi,
  address: TOKEN_CONTRACT_ADDRESS,
  functionName: 'getPastVotes',
  query:{
    enabled:typeof blockNumber === 'bigint',
  },

  args: [address, blockNumber],
});



return (
<Dialog >
  <DialogTrigger className='w-full'>
    {children}
  </DialogTrigger>
  <DialogContent  className='bg-zinc-800 border border-(--hacker-green-4) drop-shadow-xs shadow-green-400/40'>
    <DialogHeader>
      <DialogTitle className='text-white'>DAO Proposal</DialogTitle>
      <DialogDescription onClick={()=>{console.log(token)}}>
        Make a proposal to the DAO, and vote for it to be implemented in the future.
      </DialogDescription>


<Button  onClick={()=>{
  writeContract({
    abi: tokenContractAbi,
    address: TOKEN_CONTRACT_ADDRESS,
    functionName:'delegate',
    args:[address],
  },{
onError: (error) => {
      console.log(error);
      toast('Tokens Delegation Transaction Failed 🤬 ! Try again later 😉');
    },
    'onSettled': (data) => {
      console.log(data);
      toast('Tokens Delegation Transaction Created successfully 🎉 !');
    }
  });
}} className={`hover:bg-(--hacker-green-4) ${(delegateData as unknown as any)
   && Number(delegateData) === Number(0) && 'hidden'} hover:text-zinc-800 hover:scale-95 transition-all cursor-pointer`}>
  Delegate Tokens</Button>





    </DialogHeader>

    <FormProvider {...methods}>
<Form {...methods}>
  <form onSubmit={methods.handleSubmit(onSubmit,(err)=>{
    setCurrentStep(0);
    Object.values(err).map((item) => toast(item.message)); 
    console.log(err);
  })}  className='flex flex-col gap-2 w-full'>
    {methods.formState.isSubmitted ? 
    <div className='flex flex-col gap-2 w-full'>

{isLoading ? <div className='flex flex-col gap-2 items-center w-full'>

<AiOutlineLoading3Quarters className=' animate-spin text-blue-500 text-6xl'/>

<p className='text-white'>Transaction is pending...</p>

</div> : isSuccess &&
<div className='flex flex-col items-center gap-6 w-full'>

<FaCheckCircle className=' text-(--hacker-green-4) text-6xl'/>

<p className='text-white'>Transaction is Succeeded.</p>

<Button className='hover:bg-(--hacker-green-4) cursor-pointer transition-all duration-500 mt-6 px-6 hover:text-zinc-800 ' onClick={(e) => {
  e.preventDefault();
  window.location.reload();
}}>Go back to Home</Button>
</div>}

{error && <>
  <p className='text-red-500'>{error.name}</p>
  <p>{error.message}</p>
  <Button onClick={() => console.log(error.cause)} className='hover:bg-red-500 cursor-pointer transition-all duration-500 mt-6 px-6 hover:text-zinc-800 '>
    See the Cause
  </Button>
</>}
    </div> 
    :
  <StepContainer currentStep={currentStep}/>
    }



{
  currentStep === 4 && !methods.formState.isSubmitted &&
  <Button type='submit'  className='hover:bg-(--hacker-green-4) cursor-pointer transition-all duration-500 mt-6 px-6 hover:text-zinc-800 '>
  Propose
</Button>
}


  </form>


</Form>

    </FormProvider>
    <div className="flex flex-col pt-3 gap-4">
<div className="flex gap-3 items-center justify-start
">
{
  currentStep !== 0 && currentStep !== 4 &&
<div className='flex justify-end'>
<Button onClick={() => {
setCurrentStep(currentStep - 1);
}} className='hover:bg-(--hacker-green-4) cursor-pointer transition-all duration-500 
 px-6 hover:text-zinc-800 '>
  Back
</Button>

</div>
}

{
  currentStep !== 4 &&
<div className='flex justify-end'>
<Button onClick={() => {
setCurrentStep(currentStep + 1);
}} className='hover:bg-(--hacker-green-4) cursor-pointer transition-all duration-500 
 px-6 hover:text-zinc-800 '>
  Next
</Button>

</div>
}

</div>



</div>

  </DialogContent>
</Dialog>
  )
}

export default ProposalModal
