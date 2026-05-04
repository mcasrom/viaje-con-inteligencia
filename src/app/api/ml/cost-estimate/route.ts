import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    message: 'API ML Cost Estimate stub',
    version: 'v2.1-refactor' 
  });
}
