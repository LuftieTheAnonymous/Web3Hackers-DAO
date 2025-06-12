import ProposalContainer from "@/components/proposal/ProposalContainer";
import { supabase } from "@/lib/db/supabaseConfigClient";



async function ProposalPage({ params }: { params: Promise<any> }) {
  
  const {proposalId}= await params;

const {data}=await supabase.from('dao_proposals').select('*, dao_members:dao_members(*), dao_vote_options:dao_vote_options(*), calldata_objects:calldata_objects(*), dao_voting_comments:dao_voting_comments(*, dao_members:dao_members(*), dao_proposals:dao_proposals(*))').eq('proposal_id', proposalId).single();
  



  return (
    <div className='w-full h-full'>
     
{data && <ProposalContainer proposalId={proposalId} commentsData={data.dao_voting_comments as any[]} proposalData={data} />}

    </div>
  )
}

export default ProposalPage