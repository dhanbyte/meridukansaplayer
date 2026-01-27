import React from 'react';
import { PolicyPageLayout } from '@/components/PolicyPageLayout';

export default function ReturnAndRefundPolicy() {
  return (
    <PolicyPageLayout
      title="Return & Refund Policy"
      content={
        <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
          <p>
            At Shopwave, we are committed to providing high-quality products. We understand that issues may arise with products, and we strive to ensure a smooth and fair return and refund process.
          </p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">1. Returns and Refunds for End Customers</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold underline">Return Request Period</h3>
                <p><strong>48-Hour Notification:</strong> To ensure we can properly assess any issues with the product, you must notify us within 48 hours of receiving the product.</p>
              </div>
              
              <div>
                <h3 className="font-bold underline">Return Eligibility</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Damaged or Defective Products:</strong> Must provide an unboxing video showing the damage.</li>
                  <li><strong>Missing Items:</strong> Must provide an unboxing video showing the contents clear.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold underline">Refund Eligibility</h3>
                <p>Upon confirmation through the unboxing video, a full or partial refund will be processed. <strong>Note: No return or refund for defective electronics items.</strong></p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">2. Dropshipping Partners</h2>
            <p>
              If a product is defective or damaged, you must notify us within 48 hours of delivery. After confirmation, we will replace the product or issue a full refund.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">3. Non-Returnable Items</h2>
            <ul className="list-disc pl-5">
              <li>Products that have been used, opened, or damaged by the customer.</li>
              <li>Products marked as non-returnable in the description.</li>
              <li>Electronic Products.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">4. Shipping Costs</h2>
            <p>
              Shipping charges are non-refundable under all circumstances. Initial shipping fees and return costs are the responsibility of the customer/dropshipper.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Contact Us</h2>
            <p>If you have any questions, please contact us at <strong>shopwave.social@gmail.com</strong>.</p>
          </section>
        </div>
      }
    />
  );
}
