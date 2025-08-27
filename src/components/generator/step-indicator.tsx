"use client";

import { cn } from "@/lib/utils";
import { Check, Dot } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: "Details" },
  { id: 2, name: "Content" },
  { id: 3, name: "Theme" },
  { id: 4, name: "Preview" },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress">
      <ol
        role="list"
        className="flex items-center justify-center"
      >
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={cn(
              "relative",
              stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : ""
            )}
          >
            {step.id < currentStep ? (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="h-0.5 w-full bg-primary" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <Check className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
                  <span className="sr-only">{step.name}</span>
                </div>
              </>
            ) : step.id === currentStep ? (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="h-0.5 w-full bg-border" />
                </div>
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background"
                  aria-current="step"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  <span className="sr-only">{step.name}</span>
                </div>
              </>
            ) : (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="h-0.5 w-full bg-border" />
                </div>
                <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-background">
                   <span className="sr-only">{step.name}</span>
                </div>
              </>
            )}
             <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-center w-20 text-muted-foreground data-[current=true]:text-foreground" data-current={step.id === currentStep}>{step.name}</p>
          </li>
        ))}
      </ol>
    </nav>
  );
}
