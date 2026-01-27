import Footer from "@/components/Footer";

export default function PoliciesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}
