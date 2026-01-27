import React from 'react';
import { PolicyPageLayout } from '@/components/PolicyPageLayout';

export default function KYCPolicy() {
  return (
    <PolicyPageLayout
      title="KYC Policy"
      content={
        <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Introduction</h2>
            <p>
              Shopwave is committed to ensuring a secure and transparent platform for all Dropshippers. To comply with legal and financial regulations, every Dropshipper must complete the Know Your Customer (KYC) verification process.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Mandatory KYC Information</h2>
            <p>Each Dropshipper is required to provide the following information accurately:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Bank Account Number</li>
              <li>Account Holder Name (As per the bank records)</li>
              <li>GST (Goods and Services Tax) Certificate & Number (if applicable)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">GST & PAN Verification</h2>
            <p>
              All clients are solely responsible for ensuring that the GST and PAN details on client's profile are accurate and valid. It is the client’s duty to verify the correctness of these details for correct GST filing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Verification & Compliance</h2>
            <p>
              Shopwave reserves the right to verify the provided details through authorized third-party services. Any discrepancies may lead to rejection or temporary suspension of services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Contact Us</h2>
            <p>For any queries regarding KYC verification, please contact our support via email at <strong>shopwave.social@gmail.com</strong>.</p>
          </section>
        </div>
      }
    />
  );
}
