import { MetadataRoute } from "next";

export default function manifest():MetadataRoute.Manifest {
  return  {
    "name": "WEB3 Builders DAO Dapp",
    "short_name": "WEB3 Builders",
    "description": "An open source web3 builders DAO dapp. Created for needs of the web3 builders community on discord.",
   "display": "standalone",
"start_url": "/",
"scope": "/",
    "background_color": "#0D0D0D",
    
    "theme_color": "#05F29B",
    "icons": [
      {
        "src": "/Web3Builders.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "/Web3Builders.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ]
  }
}
