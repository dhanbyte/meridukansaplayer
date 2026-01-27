import React from 'react';
import { PolicyPageLayout } from '@/components/PolicyPageLayout';

export default function WithdrawalPolicy() {
  return (
    <PolicyPageLayout
      title="Withdrawal Policy"
      content={
        <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">1. Bank Details Requirement</h2>
            <p>To initiate a withdrawal from your wallet, you must ensure that your bank details are correctly entered in the profile section of your account. This is a mandatory step.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">2. Minimum Withdrawal Amount</h2>
            <p>The minimum withdrawal amount is <strong>1000 INR</strong>. Any balance below this amount is not eligible for withdrawal.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">3. Processing Time</h2>
            <p>Once the withdrawal request is made, the bank transfer will typically be processed within <strong>7 working days</strong>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">4. Single Active Withdrawal Rule</h2>
            <p>Only one withdrawal request can be processed at a time. Subsequent requests will begin processing only after the previous request is fully cleared.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">5. COD Remittance Cycle</h2>
            <p>For all COD orders, we receive the payment from our courier partners 10 days after the order is marked as delivered. It will be reflected in your wallet within 24 hours of our receipt.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Contact Us</h2>
            <p>For any queries regarding withdrawals, please contact: <strong>shopwave.social@gmail.com</strong></p>
          </section>
        </div>
      }
    />
  );
}
