"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

type Theme = "light" | "dark" | "vibrant";
type Layout = "standard" | "minimal";

const themes: { name: Theme; label: string; colors: string[] }[] = [
  { name: "light", label: "Light", colors: ["bg-slate-100", "bg-white", "bg-sky-500"] },
  { name: "dark", label: "Dark", colors: ["bg-slate-900", "bg-slate-800", "bg-sky-400"] },
  { name: "vibrant", label: "Vibrant", colors: ["bg-purple-50", "bg-white", "bg-purple-500"] },
];

const layouts: { name: Layout; label: string }[] = [
  { name: "standard", label: "Standard" },
  { name: "minimal", label: "Minimal" },
];

type Step3ThemeProps = {
  onSubmit: (data: { theme: Theme; layout: Layout }) => void;
  onBack: () => void;
};

const ThemeCard = ({ theme, selected, onClick }: { theme: { name: Theme; label: string; colors: string[] }, selected: boolean, onClick: () => void }) => (
  <div className="relative" onClick={onClick}>
    <div
      className={cn(
        "border-2 rounded-lg p-2 cursor-pointer transition-all",
        selected ? "border-primary" : "border-transparent hover:border-muted-foreground/50"
      )}
    >
      <div className={cn("h-24 w-full rounded-md flex flex-col p-2 gap-1", theme.colors[0])}>
        <div className={cn("h-4 rounded w-1/3", theme.colors[2])}></div>
        <div className={cn("h-8 rounded w-full", theme.colors[1])}></div>
        <div className="flex-1 flex gap-1">
          <div className={cn("h-full rounded w-1/2", theme.colors[1])}></div>
          <div className={cn("h-full rounded w-1/2", theme.colors[1])}></div>
        </div>
      </div>
      <p className="text-center mt-2 font-medium">{theme.label}</p>
    </div>
    {selected && <CheckCircle2 className="absolute -top-2 -right-2 h-6 w-6 text-primary bg-background rounded-full" />}
  </div>
);

const LayoutCard = ({ layout, selected, onClick }: { layout: { name: Layout, label: string }, selected: boolean, onClick: () => void }) => (
  <div className="relative" onClick={onClick}>
    <div
      className={cn(
        "border-2 rounded-lg p-4 cursor-pointer transition-all h-full",
        selected ? "border-primary" : "border-transparent hover:border-muted-foreground/50"
      )}
    >
       <div className={cn("h-24 w-full rounded-md flex flex-col p-2 gap-1 bg-muted")}>
        <div className="h-4 rounded w-full bg-muted-foreground/20"></div>
        {layout.name === 'standard' && <div className="h-8 rounded w-full bg-muted-foreground/40"></div>}
        <div className="flex-1 flex gap-1">
          <div className="h-full rounded w-full bg-muted-foreground/20"></div>
          {layout.name === 'standard' && <div className="h-full rounded w-full bg-muted-foreground/20"></div>}
        </div>
      </div>
      <p className="text-center mt-2 font-medium">{layout.label}</p>
    </div>
    {selected && <CheckCircle2 className="absolute -top-2 -right-2 h-6 w-6 text-primary bg-background rounded-full" />}
  </div>
);

export default function Step3Theme({ onSubmit, onBack }: Step3ThemeProps) {
  const [selectedTheme, setSelectedTheme] = useState<Theme>("light");
  const [selectedLayout, setSelectedLayout] = useState<Layout>("standard");

  const handleSubmit = () => {
    onSubmit({ theme: selectedTheme, layout: selectedLayout });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a Theme & Layout</CardTitle>
        <CardDescription>
          Select a visual style and structure for your new website.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h3 className="font-semibold text-lg mb-4">Color Theme</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {themes.map((theme) => (
              <ThemeCard 
                key={theme.name}
                theme={theme}
                selected={selectedTheme === theme.name}
                onClick={() => setSelectedTheme(theme.name)}
              />
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-4">Page Layout</h3>
          <div className="grid grid-cols-2 gap-4">
            {layouts.map((layout) => (
              <LayoutCard 
                key={layout.name}
                layout={layout}
                selected={selectedLayout === layout.name}
                onClick={() => setSelectedLayout(layout.name)}
              />
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit}>Preview Website</Button>
      </CardFooter>
    </Card>
  );
}
