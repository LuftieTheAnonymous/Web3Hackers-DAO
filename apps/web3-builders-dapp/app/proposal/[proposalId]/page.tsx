import ProposalContainer from "@/components/proposal/ProposalContainer";
import { createSupabaseClient } from "@/lib/db/supabaseConfigClient";
import { cookies } from "next/headers";



async function ProposalPage({ params }: { params: Promise<{ proposalId: string }> }) {
  const {proposalId}= await params;

const cookiesStore = await cookies();
const token = cookiesStore.get('supabase_jwt');
 const supabase=  createSupabaseClient(!token ? '' : token.value);

const {data}=await supabase.from('dao_proposals').select('*, dao_members:dao_members(*), dao_vote_options:dao_vote_options(*), calldata_objects:calldata_objects(*), dao_voting_comments:dao_voting_comments(*, dao_members:dao_members(*), dao_proposals:dao_proposals(*))').eq('proposal_id', proposalId).single();
  



  return (
    <div className='w-full h-full'>
     
{data && <ProposalContainer proposalId={proposalId} commentsData={data.dao_voting_comments as any[]} proposalData={data} />}

    </div>
  )
}

export default ProposalPage