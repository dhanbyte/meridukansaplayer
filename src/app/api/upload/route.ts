import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('No file provided');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('File received:', file.name, file.size, 'bytes');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || 'public_fKueib9N0GT7AiYjJYoC0Kh7FT8=';
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || 'private_yV9RZWXA9kCQqBCruPcRU/0rE04=';
    
    console.log('Using ImageKit keys:', { publicKey: publicKey.substring(0, 10) + '...' });

    // ImageKit upload
    const uploadFormData = new FormData();
    uploadFormData.append('file', new Blob([buffer]), file.name);
    uploadFormData.append('publicKey', publicKey);
    uploadFormData.append('fileName', `product_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`);

    console.log('Uploading to ImageKit...');
    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(privateKey + ':').toString('base64')
      },
      body: uploadFormData
    });

    const result = await response.json();
    console.log('ImageKit response:', response.status, result);
    
    if (result.url) {
      console.log('Upload successful:', result.url);
      return NextResponse.json({ url: result.url });
    } else {
      console.error('ImageKit upload failed:', result);
      return NextResponse.json({ error: 'Upload failed', details: result }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed', details: error.message }, { status: 500 });
  }
}