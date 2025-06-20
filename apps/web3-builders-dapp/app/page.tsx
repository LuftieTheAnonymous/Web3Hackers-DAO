import ProposalList from "@/components/home/proposal-list/ProposalListContainer";
import ProposalCreationCard from "@/components/home/ProposalCreateModal";


export default function Home() {

  return (
    <div className="w-full h-full">
            <ProposalCreationCard/>
            <ProposalList />
    </div>
  );
}
