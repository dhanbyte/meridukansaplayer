import React from 'react';
import { PolicyPageLayout } from '@/components/PolicyPageLayout';

export default function OrderCancellationPolicy() {
  return (
    <PolicyPageLayout
      title="Order Cancellation Policy"
      content={
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">
              No Cancellations After Order Confirmation
            </h2>
            <p>
              Once an order is confirmed, it cannot be canceled. We process all orders immediately to ensure prompt delivery, and therefore, cancellations are not permitted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">
              No Modifications Allowed
            </h2>
            <p>
              Once the order is confirmed, no changes or modifications (such as product additions, changes in address, or updates to the order) are allowed. Please ensure all details are accurate before confirming your order.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">
              Exceptions
            </h2>
            <p>
              In rare circumstances, such as if the item is out of stock, a pricing error occurs or the Pincode provided for delivery is not serviceable, we reserve the right to cancel the order. In such cases, the full amount will be refunded to you.
            </p>
          </section>
        </div>
      }
    />
  );
}
