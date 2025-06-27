'use client';
import { readContract } from '@wagmi/core';

import React, { useEffect, useMemo, useState } from 'react';
import DropdownBar from '../drop-down/DropdownBar';
import ProposalElement from '@/components/proposal-item/ProposalElement';
import useRealtimeDocuments from '@/hooks/useRealtimeDocuments';
import { useAccount, useWatchContractEvent } from 'wagmi';
import { Skeleton } from '@/components/ui/skeleton';
import { useLottie } from 'lottie-react';
import cryptoLottieAnimation from '@/public/gifs/Decentalized-Lottie.json';
import { GOVERNOR_CONTRACT_ADDRESS, governorContractAbi } from '@/contracts/governor/config';
import { decodeEventLog } from 'viem';
import { toast } from 'sonner';
import { TokenState, useStore } from '@/lib/zustandConfig';

type Props = {
    proposals: any[];
};

function ProposalList({ proposals }: Props) {
  const { address } = useAccount();

  const token =useStore((state) => (state as TokenState).token); 


  const { serverData, isLoading } = useRealtimeDocuments({
    initialData: proposals,
    tableName: 'dao_proposals',
    parameterOnChanges: 'proposal_id',
    otherParameterOnChanges:
      'dao_members:dao_members(*), dao_vote_options:dao_vote_options(*), calldata_objects:calldata_objects(*)',
    matchOnChangeParam: 'proposal_id',
  });

  const { View } = useLottie({ animationData: cryptoLottieAnimation, loop: true });

  // useWatchContractEvent({
  //   abi: governorContractAbi,
  //   address: GOVERNOR_CONTRACT_ADDRESS,
  //   eventName: 'ProposalVoted',
  //   onLogs: (logs) => {
  //     console.log('ProposalVoted logs:', logs);
  //     logs.forEach((log) => {
  //       try {
  //         const decoded = decodeEventLog({
  //           abi: governorContractAbi,
  //           eventName: 'ProposalVoted',
  //           data: log.data,
  //           topics: log.topics,
  //         });

  //         console.log('Decoded ProposalVoted log:', decoded);
  //         if (
  //           decoded &&
  //           decoded.args &&
  //           decoded.args.find((log) => (log as any).voter === address)
  //         ) {
  //           toast.success('Your vote has been cast successfully!', {
  //             classNames: { toast: 'bg-zinc-800 text-white' },
  //           });
  //         }
  //       } catch (e) {
  //         console.error('Error decoding ProposalVoted log:', e);
  //       }
  //     });
  //   },
  //   onError(error) {
  //     toast.error(`Error casting vote: ${error.message}`);
  //   },
  // });



  return (
    <>
      {serverData && token && (
        <>
          <DropdownBar />
        </>
      )}

      <div className='flex flex-col overflow-y-auto items-center gap-6 w-full'>
        {isLoading && (
          <>
            {[...Array(3)].map((_, i) => (
              <Skeleton
                key={i}
                className='w-full max-w-2xl  bg-zinc-800 rounded-lg border border-green-400'
              >
                <div className='w-full flex items-center gap-4 p-4'>
                  <Skeleton className='w-8 h-8 bg-zinc-600 rounded-full' />
                  <Skeleton className='w-32 h-4 bg-zinc-400 rounded' />
                </div>
                <Skeleton className='h-64 p-2 bg-zinc-700' />
                <div className='w-full flex items-center gap-4 p-4'>
                  {[...Array(3)].map((_, j) => (
                    <Skeleton key={j} className='w-8 h-8 bg-zinc-600 rounded-full' />
                  ))}
                </div>
              </Skeleton>
            ))}
          </>
        )}

        {!isLoading && !address && (
          <div className='flex flex-col gap-8 items-center justify-center w-full h-screen'>
            <p className='text-white text-center text-2xl flex flex-col gap-2 md:text-4xl font-semibold break-words '>
              Welcome to{' '}
              <span className='text-(--hacker-green-4) bg-zinc-700 leading-8 p-2 rounded-lg'>
                Web3 Builders DAO
              </span>
            </p>

            <div className='w-full max-w-md h-80 flex justify-center items-center'>{View}</div>
            <p className='text-(--hacker-green-4) text-2xl font-semibold '>
              A place where your decision really matters !
            </p>
            <p className='text-white text-sm italic'>
              * If you have already registered your wallet on discord, please connect your wallet
              with the app to continue *
            </p>
          </div>
        )}

        {!isLoading &&
          serverData && 
          serverData.map((proposal, index) => (
            <ProposalElement
              proposalObj={proposal}
              key={proposal.proposal_id}
              proposalId={proposal.proposal_id}
            />
          ))}
      </div>
    </>
  );
}

export default ProposalList;
