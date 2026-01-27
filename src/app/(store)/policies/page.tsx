import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  FileText, 
  ShieldCheck, 
  RefreshCw, 
  Truck, 
  CreditCard, 
  UserCheck, 
  HelpCircle,
  XCircle,
  Type
} from 'lucide-react';

const policies = [
  {
    title: "Order Cancellation",
    description: "Rules regarding canceling orders after confirmation.",
    href: "/policies/order-cancellation",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50"
  },
  {
    title: "Terms & Conditions",
    description: "The legal agreements for using our service.",
    href: "/policies/terms-and-conditions",
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    title: "Privacy Policy",
    description: "How we collect, safeguard and disclose your data.",
    href: "/policies/privacy-policy",
    icon: ShieldCheck,
    color: "text-green-600",
    bg: "bg-green-50"
  },
  {
    title: "Return & Refund",
    description: "Policy on returns, refunds and non-returnable items.",
    href: "/policies/return-and-refund",
    icon: RefreshCw,
    color: "text-purple-600",
    bg: "bg-purple-50"
  },
  {
    title: "Withdrawal Policy",
    description: "Terms for withdrawing funds from your wallet.",
    href: "/policies/withdrawal",
    icon: CreditCard,
    color: "text-orange-600",
    bg: "bg-orange-50"
  },
  {
    title: "Shipping Policy",
    description: "Shipping timelines, carriers and transit issues.",
    href: "/policies/shipping",
    icon: Truck,
    color: "text-indigo-600",
    bg: "bg-indigo-50"
  },
  {
    title: "Grievance Redressal",
    description: "How to raise concerns and our resolution process.",
    href: "/policies/grievance-redressal",
    icon: HelpCircle,
    color: "text-teal-600",
    bg: "bg-teal-50"
  },
  {
    title: "Product Description",
    description: "Information about product colors and availability.",
    href: "/policies/product-description",
    icon: Type,
    color: "text-gray-600",
    bg: "bg-gray-50"
  },
  {
    title: "KYC Policy",
    description: "Mandatory verification requirements for dropshippers.",
    href: "/policies/kyc",
    icon: UserCheck,
    color: "text-amber-600",
    bg: "bg-amber-50"
  },
  {
    title: "FAQs",
    description: "Frequently Asked Questions about our platform.",
    href: "/policies/faqs",
    icon: HelpCircle,
    color: "text-pink-600",
    bg: "bg-pink-50"
  }
];

export default function PoliciesPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-brand-navy mb-2">Platform Policies</h1>
        <p className="text-muted-foreground">Everything you need to know about our terms, shipping, and more.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies.map((policy) => (
          <Link href={policy.href} key={policy.href} className="group">
            <Card className="h-full transition-all duration-300 hover:shadow-md border-none ring-1 ring-gray-200 hover:ring-brand-navy/50">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className={`p-3 rounded-lg ${policy.bg} ${policy.color} transition-transform group-hover:scale-110`}>
                  <policy.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg group-hover:text-brand-navy transition-colors">{policy.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {policy.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-8 bg-brand-navy rounded-2xl text-white text-center">
        <h2 className="text-xl font-bold mb-2">Need more help?</h2>
        <p className="opacity-80 mb-6">Our support team is available 24/7 to answer any questions.</p>
        <Link href="/support">
          <button className="bg-white text-brand-navy px-6 py-2 rounded-full font-bold hover:bg-opacity-90 transition-all">
            Contact Support
          </button>
        </Link>
      </div>
    </div>
  );
}
