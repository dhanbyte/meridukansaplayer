import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-brand-navy">Shopwave</h3>
            <p className="text-gray-500 text-sm">
              Your trusted dropshipping partner. Start your business with zero investment and grow with us.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-brand-navy transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-brand-navy transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-brand-navy transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Policies</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/policies/terms-and-conditions" className="text-base text-gray-500 hover:text-brand-navy">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy-policy" className="text-base text-gray-500 hover:text-brand-navy">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/return-and-refund" className="text-base text-gray-500 hover:text-brand-navy">
                  Return & Refund
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="text-base text-gray-500 hover:text-brand-navy">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/order-cancellation" className="text-base text-gray-500 hover:text-brand-navy">
                  Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Help & Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/policies/faqs" className="text-base text-gray-500 hover:text-brand-navy">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/policies/grievance-redressal" className="text-base text-gray-500 hover:text-brand-navy">
                  Grievance Redressal
                </Link>
              </li>
              <li>
                <Link href="/policies/withdrawal" className="text-base text-gray-500 hover:text-brand-navy">
                  Withdrawal Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/kyc" className="text-base text-gray-500 hover:text-brand-navy">
                  KYC Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/product-description" className="text-base text-gray-500 hover:text-brand-navy">
                  Product Description
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-500">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">shopwave.social@gmail.com</span>
              </li>
              <li className="flex items-start gap-2 text-gray-500">
                <MapPin className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">India</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Shopwave. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
