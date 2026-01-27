"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Play, Search, User, Video, Clock } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface LearningVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: string;
  category: string;
  adminName: string;
  createdAt: string;
  views: number;
}

export default function LearningPage() {
  const { toast } = useToast();
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'General', 'Order Management', 'User Management', 'Payments', 'Product Management', 'Support'];

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/learning-videos');
      const data = await response.json();
      if (response.ok) {
        setVideos(data.videos || []);
      } else {
        toast({ 
          variant: "destructive", 
          title: "Error", 
          description: data.error || "Failed to load videos" 
        });
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load videos" });
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter(video => {
    const title = video.title || "";
    const description = video.description || "";
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleWatchVideo = (videoUrl: string) => {
    window.open(videoUrl, '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Learning Center</h1>
        <p className="text-gray-600">Watch tutorials to learn how to grow your business</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tutorials..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="text-center py-12">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
           <p>Loading tutorials...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="group hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleWatchVideo(video.videoUrl)}>
              <CardHeader className="p-4">
                <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden group/image">
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105" />
                  ) : (
                    <Video className="h-12 w-12 text-gray-400" />
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity">
                    <Play className="h-16 w-16 text-white fill-current opacity-90" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {video.duration}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">{video.title}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {video.category}
                  </Badge>
                  <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t mt-2">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{video.adminName || 'Team Shopwave'}</span>
                  </div>
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredVideos.length === 0 && (
        <Card>
          <CardContent className="text-center py-16">
            <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No tutorials found</h3>
            <p className="text-gray-500">We are adding new content soon!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
