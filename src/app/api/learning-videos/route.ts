import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ videos: [], error: 'Supabase not configured' });
    }

    const { data: videos, error } = await supabase
      .from('learning_videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      // If table doesn't exist, return empty array but with a warning or specialized error
      if (error.code === '42P01') {
        return NextResponse.json({ 
          videos: [], 
          error: 'Learning videos table not found. Please run the SQL schema.',
          code: 'TABLE_NOT_FOUND' 
        }, { status: 404 });
      }
      throw error;
    }

    // Normalize
    const normalizedVideos = (videos || []).map((v: any) => ({
      id: v.id,
      title: v.title || 'Untitled Video',
      description: v.description || '',
      videoUrl: v.video_url || '',
      thumbnailUrl: v.thumbnail_url || '',
      duration: v.duration || '00:00',
      category: v.category || 'General',
      adminName: v.admin_name || 'Admin',
      createdAt: v.created_at || new Date().toISOString(),
      views: v.views || 0
    }));

    return NextResponse.json({ videos: normalizedVideos });

  } catch (error: any) {
    console.error('Learning videos fetch error:', error);
    return NextResponse.json({ 
      videos: [], 
      error: error.message || 'Failed to fetch videos' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const body = await request.json();

    // Basic YouTube ID extraction for thumbnail
    let thumbnailUrl = body.thumbnailUrl;
    if (!thumbnailUrl && body.videoUrl.includes('youtube.com') || body.videoUrl.includes('youtu.be')) {
       const videoId = body.videoUrl.split('v=')[1]?.split('&')[0] || body.videoUrl.split('/').pop();
       if (videoId) {
         thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
       }
    }

    const newVideo = {
      title: body.title,
      description: body.description,
      video_url: body.videoUrl,
      thumbnail_url: thumbnailUrl,
      duration: body.duration || '10:00', // Placeholder or user input
      category: body.category || 'General',
      admin_name: 'Admin', // In real app, get from session
      views: 0,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('learning_videos')
      .insert([newVideo])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, video: data });

  } catch (error: any) {
    console.error('Create video error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create video' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { error } = await supabase
      .from('learning_videos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete video error:', error);
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}
