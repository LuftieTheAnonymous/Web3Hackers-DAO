import ProfilePageContainer from '@/components/profile/container/ProfilePageContainer'

import { supabase } from '@/lib/db/supabaseConfigClient'
import { notFound } from 'next/navigation'
import React from 'react'



async function Page({ params }: { params: Promise<any> }) {


  const {profileId} = await params;
const { data, error } = await supabase
  .from('dao_members')
  .select('*, dao_proposals:dao_proposals(*, dao_members:dao_members(*), dao_vote_options:dao_vote_options(*), calldata_objects:calldata_objects(*))')
  .eq('userWalletAddress', profileId)
  .single();

  if(error && !data){
notFound();
  }


  return (
   <>
   {data && <ProfilePageContainer walletAddress={profileId}
   profileData={data} />}
   </>
  )
}

export default Page