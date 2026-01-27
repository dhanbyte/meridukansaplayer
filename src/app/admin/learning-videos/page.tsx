"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Play, Search, ExternalLink, Clock, User, Video, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export default function LearningVideosPage() {
  const { toast } = useToast();
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    videoUrl: '',
    category: 'General'
  });

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

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/learning-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVideo)
      });

      if (response.ok) {
        toast({ title: "Success", description: "Video added successfully" });
        setIsAddDialogOpen(false);
        setNewVideo({ title: '', description: '', videoUrl: '', category: 'General' });
        fetchVideos();
      } else {
        throw new Error('Failed to add video');
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add video" });
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      const response = await fetch(`/api/learning-videos?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({ title: "Deleted", description: "Video removed successfully" });
        fetchVideos();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete video" });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Learning Videos</h1>
          <p className="text-gray-600">Manage tutorials and help videos</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Video
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Learning Video</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateVideo} className="space-y-4">
              <div className="space-y-2">
                <Label>Video Title</Label>
                <Input 
                  value={newVideo.title} 
                  onChange={e => setNewVideo({...newVideo, title: e.target.value})} 
                  required 
                  placeholder="e.g., How to add products"
                />
              </div>
              <div className="space-y-2">
                <Label>Video URL (YouTube)</Label>
                <Input 
                  value={newVideo.videoUrl} 
                  onChange={e => setNewVideo({...newVideo, videoUrl: e.target.value})} 
                  required 
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newVideo.category}
                  onChange={e => setNewVideo({...newVideo, category: e.target.value})}
                >
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={newVideo.description} 
                  onChange={e => setNewVideo({...newVideo, description: e.target.value})} 
                  placeholder="Brief description of the video content"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Add Video</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search videos..."
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
        <div className="text-center py-12">Loading videos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="p-4">
                <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden group/image">
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                  ) : (
                    <Video className="h-12 w-12 text-gray-400" />
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity cursor-pointer" onClick={() => handleWatchVideo(video.videoUrl)}>
                    <Play className="h-12 w-12 text-white fill-current" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2" title={video.title}>{video.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs ml-2 shrink-0">
                      {video.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2" title={video.description}>{video.description}</p>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{video.adminName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* <Play className="h-3 w-3" />
                    <span>{video.views} views</span> */}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleWatchVideo(video.videoUrl)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Watch
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteVideo(video.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredVideos.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No videos found</h3>
            <p className="text-gray-500">Add some videos to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
