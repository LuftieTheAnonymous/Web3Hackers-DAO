import ProposalList from "@/components/home/proposal-list/ProposalListContainer";
import ProposalCreationCard from "@/components/home/ProposalCreateModal";
import IOSIntallPrompt from "@/components/web-push/IOSIntallPrompt";
import WebPushNotificationComponent from "@/components/web-push/WebPushNotificationComponent,";

export default function Home() {

  return (
    <div className="w-full h-full">

      
      <WebPushNotificationComponent/>

            <ProposalCreationCard/>
  
            <ProposalList/>


    </div>
  );
}
