
-- =====================================================
-- 8. LEARNING VIDEOS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS learning_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration VARCHAR(20) DEFAULT '00:00',
    category VARCHAR(50) DEFAULT 'General',
    admin_name VARCHAR(100) DEFAULT 'Admin',
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for learning_videos
CREATE INDEX IF NOT EXISTS idx_learning_videos_category ON learning_videos(category);
CREATE INDEX IF NOT EXISTS idx_learning_videos_created_at ON learning_videos(created_at DESC);

-- Enable RLS
ALTER TABLE learning_videos ENABLE ROW LEVEL SECURITY;

-- Allow read for all, write for authenticated/admin only (simplifying to all for now)
CREATE POLICY "Allow all access to learning_videos" ON learning_videos FOR ALL USING (true);
