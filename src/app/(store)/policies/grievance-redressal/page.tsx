import React from 'react';
import { PolicyPageLayout } from '@/components/PolicyPageLayout';

export default function GrievanceRedressalPolicy() {
  return (
    <PolicyPageLayout
      title="Grievance Redressal Policy"
      content={
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            At Shopwave, customer satisfaction is our top priority, and we strive to provide a seamless shopping experience. However, if you are unsatisfied with our services or have any grievances regarding our products, payments, or services, we are here to assist you.
          </p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">How to Raise a Grievance?</h2>
            <p>If you encounter any issues or have any concerns, please follow the steps below to ensure your grievance is addressed promptly:</p>
            <div className="bg-gray-50 p-4 rounded-lg mt-3">
              <h3 className="font-bold mb-2">Customer Support:</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li><strong>Raise a Ticket:</strong> Please raise a ticket through our website or mobile app. Our team will respond to your query promptly.</li>
                <li><strong>Provide the Following Details:</strong>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Your full name and contact information (email, phone number).</li>
                    <li>Order number or transaction ID (if applicable).</li>
                    <li>A brief description of your grievance or issue.</li>
                    <li>Any relevant screenshots or supporting documents (if applicable).</li>
                  </ul>
                </li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Timeline</h2>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="font-bold text-brand-navy">Acknowledgement:</span> Within 48 hours.
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold text-brand-navy">Resolution:</span> Within 7 working days.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Grievance Officer Contact Details</h2>
            <div className="bg-brand-navy/5 p-4 rounded-lg border border-brand-navy/20">
              <p><strong>Name:</strong> Grievance Officer</p>
              <p><strong>Email:</strong> shopwave.social@gmail.com</p>
            </div>
          </section>
        </div>
      }
    />
  );
}
