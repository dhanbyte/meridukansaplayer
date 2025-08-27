import type { WebsiteContent } from "./types";

const generatePageTsx = (content: WebsiteContent): string => {
  const { selectedHeadline, finalContent, layout } = content;

  if (layout === "minimal") {
    return `import Image from "next/image";
import { FileCode } from "lucide-react";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Home() {
  const headline = "${selectedHeadline}";
  const bodyContent = \`${finalContent}\`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-20 px-4 container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{headline}</h1>
              <p className="whitespace-pre-wrap text-muted-foreground mb-8">{bodyContent}</p>
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-semibold">
                Learn More
              </button>
            </div>
            <Image
              src="https://picsum.photos/600/600"
              alt="Hero image"
              width={600}
              height={600}
              className="rounded-lg shadow-lg aspect-square object-cover"
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}`;
  }

  // Standard Layout
  return `import Image from "next/image";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Home() {
  const headline = "${selectedHeadline}";
  const aboutContent = \`${finalContent}\`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="text-center py-20 px-4 bg-background">
          <div className="container mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold max-w-3xl mx-auto mb-4">{headline}</h1>
            <p className="max-w-xl mx-auto mb-8 text-lg text-muted-foreground">
              Discover the difference with our innovative solutions. We're dedicated to providing the best for our customers.
            </p>
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-semibold">
              Get Started
            </button>
          </div>
        </section>

        {/* Features/About Section */}
        <section className="py-20 px-4 bg-secondary text-secondary-foreground">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">About Our Product</h2>
                <p className="whitespace-pre-wrap">{aboutContent}</p>
              </div>
              <Image
                src="https://picsum.photos/600/400"
                alt="Feature image"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}`;
};

const generateGlobalsCss = (content: WebsiteContent): string => {
  const { theme } = content;
  let themeCss: string;

  switch (theme) {
    case 'dark':
      themeCss = `
    --background: 222 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 210 40% 98%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 217.2 91.2% 59.8%;
      `;
      break;
    case 'vibrant':
      themeCss = `
    --background: 300 100% 99%;
    --foreground: 240 10% 3.9%;
    --card: 300 100% 99%;
    --card-foreground: 240 10% 3.9%;
    --popover: 300 100% 99%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 262.1 83.3% 57.8%;
    --primary-foreground: 210 40% 98%;
    --secondary: 262.1 83.3% 57.8% / 0.1;
    --secondary-foreground: 240 10% 3.9%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 262.1 83.3% 57.8%;
      `;
      break;
    default: // light
      themeCss = `
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
      `;
      break;
  }
  return `@tailwind base;
@tailwind components;
@tailwind utilities;
 
@layer base {
  :root {
    ${themeCss}
    --radius: 0.5rem;
  }
 
  .dark {
    /* Define dark mode if needed, for now uses root */
    ${themeCss}
  }
}
 
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`;
};

const generateHeaderComponent = (content: WebsiteContent): string => {
    return `import { FileCode, Home, Info, Sparkles } from "lucide-react";

export default function Header() {
    const niche = "${content.niche}";

    return (
        <header className="p-4 bg-background border-b">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <FileCode className="w-6 h-6 text-primary" />
                    <h2 className="font-bold text-lg">{niche}</h2>
                </div>
                <nav className="hidden md:flex gap-6 items-center text-sm">
                    <a href="#" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                        <Home size={16} /> Home
                    </a>
                    <a href="#" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                        <Info size={16} /> About
                    </a>
                    <a href="#" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                        <Sparkles size={16} /> Features
                    </a>
                </nav>
            </div>
        </header>
    );
}`;
}

const generateFooterComponent = (): string => {
    return `import { Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
    return (
        <footer className="py-10 px-4 bg-secondary text-secondary-foreground">
            <div className="container mx-auto text-center">
                <div className="flex justify-center gap-6 mb-4">
                    <a href="#" aria-label="Facebook" className="hover:text-primary transition-colors"><Facebook /></a>
                    <a href="#" aria-label="Twitter" className="hover:text-primary transition-colors"><Twitter /></a>
                    <a href="#" aria-label="Instagram" className="hover:text-primary transition-colors"><Instagram /></a>
                </div>
                <p>© ${new Date().getFullYear()} ${'Your Company'}. All rights reserved.</p>
            </div>
        </footer>
    );
}`;
}


export const generateCode = (content: WebsiteContent) => {
  return {
    "app/page.tsx": generatePageTsx(content),
    "app/globals.css": generateGlobalsCss(content),
    "app/components/Header.tsx": generateHeaderComponent(content),
    "app/components/Footer.tsx": generateFooterComponent(),
  };
};
