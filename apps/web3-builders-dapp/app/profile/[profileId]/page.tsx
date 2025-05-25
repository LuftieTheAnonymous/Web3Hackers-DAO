import ProfilePageContainer from '@/components/profile/container/ProfilePageContainer'
import supabase from '@/lib/db/dbConfig'
import React from 'react'

type Props = {
  params:{profileId:string}
}

async function Page({params}: Props) {


  const {profileId} = await params;
const { data, error } = await supabase
  .from('dao_members')
  .select('*, dao_proposals(*)')
  .eq('userWalletAddress', profileId)
  .single();


  return (
   <>
   {data && <ProfilePageContainer
   profileData={data} />}
   </>
  )
}

export default Page