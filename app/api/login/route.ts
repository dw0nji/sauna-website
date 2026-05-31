import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

export async function POST(req: NextRequest) {
   let { password } = await req.json()
   const isValid = password === ADMIN_PASSWORD
  return NextResponse.json({success: isValid})
}
