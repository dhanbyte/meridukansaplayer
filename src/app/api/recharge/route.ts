import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Buffer } from 'buffer';

export async function POST(request: NextRequest) {
  try {
    console.log('Processing recharge request...');
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const amount = formData.get('amount') as string;
    const file = formData.get('screenshot') as File;
    const transactionId = `TXN${Date.now()}`;

    if (!userId || userId === 'undefined' || userId === 'null') {
      console.error('Invalid User ID:', userId);
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 });
    }

    if (!amount || !file) {
      console.error('Missing fields:', { hasAmount: !!amount, hasFile: !!file });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Upload to ImageKit
    let screenshotUrl = '';
    try {
      const bytes = await file.arrayBuffer();
      
      // Use keys from env or fallback
      const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || 'public_fKueib9N0GT7AiYjJYoC0Kh7FT8=';
      const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || 'private_yV9RZWXA9kCQqBCruPcRU/0rE04=';

      const uploadFormData = new FormData();
      uploadFormData.append('file', new Blob([bytes]), file.name);
      uploadFormData.append('publicKey', publicKey);
      uploadFormData.append('fileName', `recharge_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
      // Removing folder param to ensure compatibility with existing permissions
      
      console.log('Uploading screenshot to ImageKit...');
      const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(privateKey + ':').toString('base64')
        },
        body: uploadFormData
      });

      const uploadResult = await uploadResponse.json();

      if (uploadResult.url) {
        screenshotUrl = uploadResult.url;
        console.log('Screenshot uploaded successfully:', screenshotUrl);
      } else {
        console.error('ImageKit upload error response:', uploadResult);
        throw new Error('ImageKit upload failed: ' + (uploadResult.message || JSON.stringify(uploadResult)));
      }
    } catch (uploadError: any) {
      console.error('Screenshot upload exception:', uploadError);
      return NextResponse.json({ error: 'Failed to upload screenshot: ' + uploadError.message }, { status: 500 });
    }

    // 2. Insert into Supabase
    if (!supabase) {
      console.error('Supabase client not configured');
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    console.log(`Inserting recharge record for User: ${userId}, Amount: ${amount}`);
    
    const { data, error } = await supabase
      .from('recharge_history')
      .insert([
        {
          partner_id: userId,
          amount: parseFloat(amount),
          transaction_id: transactionId,
          screenshot_url: screenshotUrl,
          status: 'pending',
          payment_method: 'upi'
        }
      ])
      .select();

    if (error) {
      console.error('Supabase insert error details:', error);
      throw new Error('Database error: ' + error.message);
    }

    console.log('Recharge request created successfully:', data?.[0]?.id);
    return NextResponse.json({ 
      success: true, 
      id: data?.[0]?.id,
      message: 'Recharge request submitted successfully'
    });

  } catch (error: any) {
    console.error('Unhandled API error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}
