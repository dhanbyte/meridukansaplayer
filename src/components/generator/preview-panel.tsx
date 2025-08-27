"use client";

import type { WebsiteContent } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  FileCode,
  Facebook,
  Twitter,
  Instagram,
  Home,
  Info,
  Sparkles,
} from "lucide-react";

type ThemeColors = {
  bg: string;
  fg: string;
  primary: string;
  primaryFg: string;
  card: string;
  cardFg: string;
};

const themes: Record<string, ThemeColors> = {
  light: {
    bg: "bg-white",
    fg: "text-slate-900",
    primary: "bg-sky-500",
    primaryFg: "text-white",
    card: "bg-slate-100",
    cardFg: "text-slate-800",
  },
  dark: {
    bg: "bg-slate-900",
    fg: "text-slate-50",
    primary: "bg-sky-400",
    primaryFg: "text-slate-900",
    card: "bg-slate-800",
    cardFg: "text-slate-100",
  },
  vibrant: {
    bg: "bg-purple-50",
    fg: "text-gray-900",
    primary: "bg-purple-500",
    primaryFg: "text-white",
    card: "bg-white",
    cardFg: "text-gray-800",
  },
};

const Header = ({
  theme,
  niche,
}: {
  theme: ThemeColors;
  niche: string;
}) => (
  <header className={cn("p-4", theme.bg, theme.fg)}>
    <div className="container mx-auto flex justify-between items-center">
      <div className="flex items-center gap-2">
        <FileCode className="w-6 h-6" />
        <h2 className="font-bold text-lg">{niche}</h2>
      </div>
      <nav className="hidden md:flex gap-6 items-center">
        <a href="#" className="flex items-center gap-1 hover:opacity-75">
          <Home size={16} /> Home
        </a>
        <a href="#" className="flex items-center gap-1 hover:opacity-75">
          <Info size={16} /> About
        </a>
        <a href="#" className="flex items-center gap-1 hover:opacity-75">
          <Sparkles size={16} /> Features
        </a>
      </nav>
    </div>
  </header>
);

const Hero = ({
  theme,
  headline,
}: {
  theme: ThemeColors;
  headline: string;
}) => (
  <section className={cn("text-center py-20 px-4", theme.bg, theme.fg)}>
    <div className="container mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold max-w-3xl mx-auto mb-4">
        {headline}
      </h1>
      <p className="max-w-xl mx-auto mb-8 text-lg opacity-80">
        Discover the difference with our innovative solutions. We're dedicated
        to providing the best for our customers.
      </p>
      <button
        className={cn(
          "px-8 py-3 rounded-md font-semibold",
          theme.primary,
          theme.primaryFg
        )}
      >
        Get Started
      </button>
    </div>
  </section>
);

const Features = ({
  theme,
  content,
}: {
  theme: ThemeColors;
  content: string;
}) => (
  <section className={cn("py-20 px-4", theme.card, theme.cardFg)}>
    <div className="container mx-auto">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">About Our Product</h2>
          <p className="whitespace-pre-wrap opacity-90">{content}</p>
        </div>
        <Image
          src="https://picsum.photos/600/400"
          alt="Feature image"
          data-ai-hint="product abstract"
          width={600}
          height={400}
          className="rounded-lg shadow-lg"
        />
      </div>
    </div>
  </section>
);

const MinimalContent = ({
  theme,
  headline,
  content,
}: {
  theme: ThemeColors;
  headline: string;
  content: string;
}) => (
  <section className={cn("py-20 px-4", theme.bg, theme.fg)}>
    <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
      <div className="text-left">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{headline}</h1>
        <p className="whitespace-pre-wrap opacity-90 mb-8">{content}</p>
        <button
          className={cn(
            "px-8 py-3 rounded-md font-semibold",
            theme.primary,
            theme.primaryFg
          )}
        >
          Learn More
        </button>
      </div>
      <Image
        src="https://picsum.photos/600/600"
        data-ai-hint="technology modern"
        alt="Hero image"
        width={600}
        height={600}
        className="rounded-lg shadow-lg aspect-square object-cover"
      />
    </div>
  </section>
);

const Footer = ({ theme }: { theme: ThemeColors }) => (
  <footer className={cn("py-10 px-4", theme.bg, theme.fg, "border-t")}>
    <div className="container mx-auto text-center">
      <div className="flex justify-center gap-6 mb-4">
        <a href="#" aria-label="Facebook">
          <Facebook />
        </a>
        <a href="#" aria-label="Twitter">
          <Twitter />
        </a>
        <a href="#" aria-label="Instagram">
          <Instagram />
        </a>
      </div>
      <p className="opacity-70">
        © {new Date().getFullYear()} Your Company. All rights reserved.
      </p>
    </div>
  </footer>
);

export default function PreviewPanel({ content }: { content: WebsiteContent }) {
  const theme = themes[content.theme] || themes.light;

  return (
    <div className="w-full h-[600px] border rounded-lg bg-muted shadow-inner overflow-hidden flex flex-col">
      <div className="flex-shrink-0 bg-slate-200 dark:bg-slate-700 p-2 flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <div className="ml-2 bg-white dark:bg-slate-800 rounded px-4 py-1 text-sm text-slate-600 dark:text-slate-300 w-full max-w-sm truncate">
          {content.niche.toLowerCase().replace(/\s+/g, "-")}.com
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className={theme.bg}>
          <Header theme={theme} niche={content.niche} />
          {content.layout === "standard" ? (
            <>
              <Hero theme={theme} headline={content.selectedHeadline} />
              <Features theme={theme} content={content.finalContent} />
            </>
          ) : (
            <MinimalContent
              theme={theme}
              headline={content.selectedHeadline}
              content={content.finalContent}
            />
          )}
          <Footer theme={theme} />
        </div>
      </div>
    </div>
  );
}
