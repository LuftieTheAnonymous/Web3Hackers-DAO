import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try{
    const body = await req.json();
  const {  address } = body;

  const payload = {
    wallet_address: address,
    role: 'authenticated',
  };

  const token = jwt.sign(payload, process.env.NEXT_PUBLIC_SUPABASE_JWT_SECRET as string, {
    expiresIn: '30d',
    issuer: 'web3-builders-dao-dapp',

  });

  console.log(token);
  

 return NextResponse.json({ token, error:null });
  }
catch(err){
  console.log(err);
  return NextResponse.json({token: null, error: err});
}

}