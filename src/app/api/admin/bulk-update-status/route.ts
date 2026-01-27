import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // This route was for bulk updating product status in MongoDB.
  // Supabase 'products' table uses 'is_active' boolean, not 'status' string.
  // This functionality is currently deprecated/disabled during migration.

  return NextResponse.json({
    success: true,
    message: 'Migration notice: Bulk status update is disabled for Supabase products.'
  });
}
