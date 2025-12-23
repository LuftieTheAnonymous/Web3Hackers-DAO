import { MetadataRoute } from "next";

export default function manifest():MetadataRoute.Manifest {
  return  {
    "name": "WEB3 Hackers DAO Dapp",
    "short_name": "WEB3 Hackers",
    "description": "An open source web3 hackers DAO dapp. Created for needs of the web3 hackers community on discord.",
   "display": "standalone",
"start_url": "/",
"scope": "/",
    "background_color": "#0D0D0D",
    
    "theme_color": "#05F29B",
    "icons": [
      {
        "src": "/Web3Hackers.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "/Web3Hackers.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ]
  }
}
