import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold">Dropship Partner Portal</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Welcome to the portal.
        </p>
        <div className="mt-8 flex gap-4">
          <Button asChild>
            <Link href="/login">Partner Login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/login">Admin Login</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
