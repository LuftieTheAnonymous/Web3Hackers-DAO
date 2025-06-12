import type { Metadata } from 'next'
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import SidebarComponent from "@/components/sidebar/SidebarComponent";

import { Toaster } from '@/components/ui/sonner';
import ProvidersWrapper from '@/lib/providers/ProvidersWrapper';


const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Web3 Builders DAO Dapp",
  description: "An open source web3 builders DAO dapp. Created for needs of the web3 builders community on discord.",
  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {




  return (
    <html lang="en">

      <body
        className={`${poppins.variable} ${geistMono.variable} w-full h-full bg-[#0D0D0D]  antialiased`}
      >

<ProvidersWrapper>
    <SidebarComponent />

  <div className="flex flex-col w-full h-full gap-2">
<Navbar/>
{children}
<Toaster theme={'system'}  closeButton />
  </div>
</ProvidersWrapper>



      </body>

    </html>
  );
}
