import React from 'react';
import { PolicyPageLayout } from '@/components/PolicyPageLayout';

export default function ShippingPolicy() {
  return (
    <PolicyPageLayout
      title="Shipping Policy"
      content={
        <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
          <div className="bg-blue-50 p-3 rounded text-blue-800 font-semibold mb-4 text-center">
            THIS SHIPPING POLICY IS ONLY FOR INDIA ORDERS.
          </div>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Processing Time</h2>
            <p>100% of orders are shipped from our warehouse within <strong>1-2 business days</strong>. Orders placed over the weekend are dispatched on Mondays.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Shipping Timelines</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Standard Shipping (Gujarat):</strong> Delivery within 6-7 business days after dispatch.</li>
              <li><strong>Standard Shipping (All Other States):</strong> Delivery within 7-10 business days after dispatch (up to 15 days for some pincodes).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Failed Delivery</h2>
            <p>
              If the package cannot be delivered due to customer non-cooperation (wrong address, absent receiver, refusal), it will be returned to sender at customer's expense. Shipping costs will be deducted from the refund.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Shipping Delays</h2>
            <p>
              While we strive for swift deliveries, factors like weather and customs can lead to delays. It may take up to 45 days for courier services to resolve certain transit issues.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Contact Us</h2>
            <p>For any questions regarding shipping, please contact us at <strong>shopwave.social@gmail.com</strong>.</p>
          </section>
        </div>
      }
    />
  );
}
