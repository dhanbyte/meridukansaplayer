import React from 'react';
import { PolicyPageLayout } from '@/components/PolicyPageLayout';

export default function ProductDescriptionPolicy() {
  return (
    <PolicyPageLayout
      title="Product Description Policy"
      content={
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            At Shopwave, we offer our products in a wide range of colors to suit your preferences. Due to the nature of our product sourcing, many of our items are available in multiple colors, and we process orders accordingly.
          </p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Color Selection</h2>
            <p>
              The specific color of your product will be selected based on availability at the time of dispatch. <strong>Please note that color preferences cannot be specified during the ordering process.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Visual Representation</h2>
            <p>
              While we showcase a limited selection of colors in our product images, rest assured that a variety of colors is available, and your order will be processed according to stock availability.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Contact Us</h2>
            <p>If you have any questions about our products, please contact us at <strong>shopwave.social@gmail.com</strong>.</p>
          </section>
        </div>
      }
    />
  );
}
