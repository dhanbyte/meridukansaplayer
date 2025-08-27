"use client";

import type { WebsiteContent } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PreviewPanel from "./preview-panel";
import CodeExportDialog from "./code-export-dialog";

type Step4PreviewProps = {
  content: WebsiteContent;
  onStartOver: () => void;
};

export default function Step4Preview({
  content,
  onStartOver,
}: Step4PreviewProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Congratulations! Here's Your Website.</CardTitle>
        <CardDescription>
          Review your generated website below. You can export the code or start
          over.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PreviewPanel content={content} />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onStartOver}>
          Start Over
        </Button>
        <CodeExportDialog content={content}>
          <Button>Export Code</Button>
        </CodeExportDialog>
      </CardFooter>
    </Card>
  );
}
