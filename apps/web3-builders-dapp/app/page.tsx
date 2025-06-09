import ProposalList from "@/components/home/proposal-list/ProposalListContainer";
import ProposalCreationCard from "@/components/home/ProposalCreateModal";


export default async function Home({searchParams}:{searchParams: Record<string, string>}) {

  const searchedParams=await searchParams;

  return (
    <div className="w-full h-full">
            <ProposalCreationCard/>
            <ProposalList searchParams={searchedParams}/>
    </div>
  );
}
