"use client";
import Link from 'next/link';
import {
  Users,
  Package,
  Home,
  LogOut,
  Users2,
  Wallet,
  MessageSquare,
  Menu,
  X,
  ChevronDown,
  Video,
  BookOpen,
  Plus
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
  };

  const navItems = [
    { href: "/admin", icon: Home, label: "Dashboard" },
    { href: "/admin/orders", icon: Package, label: "Orders" },
    { href: "/admin/create-order", icon: Plus, label: "Create Order" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/wallet", icon: Wallet, label: "Wallet" },
    { href: "/admin/products", icon: Package, label: "Products" },
    { href: "/admin/tickets", icon: MessageSquare, label: "Support" },
    { href: "/admin/learning-videos", icon: BookOpen, label: "Learning Videos" },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
              <Button type="submit" className="w-full">
                Access Admin Panel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-4">
                <SheetHeader className="mb-6">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Package className="h-4 w-4 text-white" />
                    </div>
                    <span>Admin Panel</span>
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Navigation menu for admin panel
                  </SheetDescription>
                </SheetHeader>
                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:flex"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-16 bg-white border-r border-gray-200">
        <nav className="flex flex-col items-center gap-6 px-2 py-6">
          <Link
            href="/admin"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-blue-600 text-white transition-all hover:bg-blue-700"
          >
            <Home className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">Dashboard</span>
          </Link>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/users"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:text-gray-900 hover:bg-gray-100 md:h-9 md:w-9"
                >
                  <Users className="h-5 w-5" />
                  <span className="sr-only">Users</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Users</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/orders"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 transition-colors hover:text-blue-900 hover:bg-blue-200 md:h-9 md:w-9"
                >
                  <Package className="h-5 w-5" />
                  <span className="sr-only">Orders</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Orders</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/create-order"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:text-gray-900 hover:bg-gray-100 md:h-9 md:w-9"
                >
                  <Plus className="h-5 w-5" />
                  <span className="sr-only">Create Order</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Create Order</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/users"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:text-gray-900 hover:bg-gray-100 md:h-9 md:w-9"
                >
                  <Users className="h-5 w-5" />
                  <span className="sr-only">Users</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Users</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/wallet"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:text-gray-900 hover:bg-gray-100 md:h-9 md:w-9"
                >
                  <Wallet className="h-5 w-5" />
                  <span className="sr-only">Wallet Requests</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Wallet Requests</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/products"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:text-gray-900 hover:bg-gray-100 md:h-9 md:w-9"
                >
                  <Package className="h-5 w-5" />
                  <span className="sr-only">Products</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Products</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/tickets"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:text-gray-900 hover:bg-gray-100 md:h-9 md:w-9"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="sr-only">Support Tickets</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Support Tickets</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/learning-videos"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:text-gray-900 hover:bg-gray-100 md:h-9 md:w-9"
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="sr-only">Learning Videos</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Learning Videos</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:text-gray-900 hover:bg-gray-100 md:h-9 md:w-9"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Logout</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-16 flex flex-col min-h-screen">
        {/* Desktop Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="h-9"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-4 py-4">
          <div className="text-center text-sm text-gray-500">
            © 2024 Shopwave Dropshipping. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
