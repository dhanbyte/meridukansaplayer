"use client";

import { useState } from "react";
import type { WebsiteContent } from "@/lib/types";
import { generateCode } from "@/lib/generate-code";
import { Copy, Check } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "../ui/button";

const CodeBlock = ({ code }: { code: string }) => {
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm max-h-[400px]">
        <code>{code}</code>
      </pre>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 h-8 w-8"
        onClick={copyToClipboard}
      >
        {hasCopied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default function CodeExportDialog({
  children,
  content,
}: {
  children: React.ReactNode;
  content: WebsiteContent;
}) {
  const codeFiles = generateCode(content);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Export Your Website Code</DialogTitle>
          <DialogDescription>
            Copy the code below to create your Next.js application.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="page.tsx" className="w-full">
          <TabsList>
            {Object.keys(codeFiles).map((filename) => (
              <TabsTrigger key={filename} value={filename}>
                {filename}
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(codeFiles).map(([filename, code]) => (
            <TabsContent key={filename} value={filename}>
              <CodeBlock code={code as string} />
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
