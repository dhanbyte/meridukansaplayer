import React from 'react';
import { PolicyPageLayout } from '@/components/PolicyPageLayout';

export default function FAQs() {
  return (
    <PolicyPageLayout
      title="Frequently Asked Questions"
      content={
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">General</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-brand-navy">What is Shopwave?</h3>
                <p>Shopwave is a B2B dropshipping platform that helps you start your own online business with zero investment.</p>
              </div>
              <div>
                <h3 className="font-bold text-brand-navy">Is there a joining fee?</h3>
                <p>No, joining Shopwave as a reseller is completely free.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Orders & Shipping</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-brand-navy">How long does delivery take?</h3>
                <p>Delivery typically takes 5-7 working days depending on the location.</p>
              </div>
              <div>
                <h3 className="font-bold text-brand-navy">Do you offer COD?</h3>
                <p>Yes, Cash on Delivery (COD) is available for most pincodes.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Payments</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-brand-navy">When will I get my payment?</h3>
                <p>Payments are processed weekly directly to your bank account after the return period of the order is over.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Contact Us</h2>
            <p>If you have more questions, please contact us at <strong>shopwave.social@gmail.com</strong>.</p>
          </section>
        </div>
      }
    />
  );
}
