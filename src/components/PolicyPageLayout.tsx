import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PolicyPageProps {
  title: string;
  content: React.ReactNode;
}

export const PolicyPageLayout: React.FC<PolicyPageProps> = ({ title, content }) => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card className="shadow-lg border-none bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b bg-gradient-to-r from-brand-navy/5 to-transparent">
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-navy to-blue-600">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8 prose prose-slate max-w-none">
          {content}
        </CardContent>
      </Card>
    </div>
  );
};
