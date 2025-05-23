import ProposalList from "@/components/home/proposal-list/ProposalListContainer";
import ProposalCreationCard from "@/components/home/ProposalCreateModal";

export default function Home() {

  return (
    <div className="w-full h-full">
      <div className="w-full h-full p-2">
            <ProposalCreationCard/>

            
            
      </div>
            <ProposalList/>


    </div>
  );
}
