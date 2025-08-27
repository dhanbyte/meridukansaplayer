"use client";

import { useState } from "react";
import type { WebsiteContent } from "@/lib/types";
import { generateInitialContent } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

import { MagicWandIcon } from "@/components/magic-wand-icon";
import StepIndicator from "@/components/generator/step-indicator";
import Step1Details from "@/components/generator/step-1-details";
import Step2Content from "@/components/generator/step-2-content";
import Step3Theme from "@/components/generator/step-3-theme";
import Step4Preview from "@/components/generator/step-4-preview";

export default function Home() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState<WebsiteContent>({
    niche: "",
    productInfo: "",
    rearrangedContent: "",
    suggestions: [],
    selectedHeadline: "",
    finalContent: "",
    theme: "light",
    layout: "standard",
  });
  const { toast } = useToast();

  const handleDetailsSubmit = async (data: {
    niche: string;
    productInfo: string;
  }) => {
    setIsLoading(true);
    setContent((prev) => ({ ...prev, ...data }));
    try {
      const result = await generateInitialContent(data);
      if (result.error) {
        throw new Error(result.error);
      }
      setContent((prev) => ({
        ...prev,
        ...data,
        rearrangedContent: result.rearrangedContent ?? "",
        suggestions: result.suggestions ?? [],
      }));
      setStep(2);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error Generating Content",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentSubmit = (data: {
    selectedHeadline: string;
    finalContent: string;
  }) => {
    setContent((prev) => ({ ...prev, ...data }));
    setStep(3);
  };

  const handleThemeSubmit = (data: { theme: string; layout: string }) => {
    setContent((prev) => ({ ...prev, ...data }));
    setStep(4);
  };

  const handleStartOver = () => {
    setContent({
      niche: "",
      productInfo: "",
      rearrangedContent: "",
      suggestions: [],
      selectedHeadline: "",
      finalContent: "",
      theme: "light",
      layout: "standard",
    });
    setStep(1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1Details
            onSubmit={handleDetailsSubmit}
            initialData={{ niche: content.niche, productInfo: content.productInfo }}
            isLoading={isLoading}
          />
        );
      case 2:
        return (
          <Step2Content
            onSubmit={handleContentSubmit}
            rearrangedContent={content.rearrangedContent}
            suggestions={content.suggestions}
            onBack={handleBack}
          />
        );
      case 3:
        return <Step3Theme onSubmit={handleThemeSubmit} onBack={handleBack} />;
      case 4:
        return <Step4Preview content={content} onStartOver={handleStartOver} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="p-4 border-b">
        <div className="container mx-auto flex items-center gap-3">
          <MagicWandIcon className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">
            Website Generator AI
          </h1>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl space-y-8">
          <StepIndicator currentStep={step} />
          {renderStep()}
        </div>
      </main>
      <footer className="p-4 text-center text-sm text-muted-foreground">
        <p>Powered by Firebase and Google AI</p>
      </footer>
    </div>
  );
}
