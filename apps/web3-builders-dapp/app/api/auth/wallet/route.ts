import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address } = body;

    const payload = {
      wallet_address: address,
      role: 'authenticated',
    };

    const token = jwt.sign(
      payload,
      process.env.NEXT_PUBLIC_SUPABASE_JWT_SECRET as string,
      {
        expiresIn: '30d',
        issuer: 'web3-builders-dao-dapp',
      }
    );

    // Create a response first
    const res = NextResponse.json({ token, error: null });

    // Set the cookie on that response
    res.cookies.set('supabase_jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return res;
  } catch (err) {
    console.log(err);
    return NextResponse.json({ token: null, error: err });
  }
}
