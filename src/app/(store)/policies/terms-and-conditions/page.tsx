import React from 'react';
import { PolicyPageLayout } from '@/components/PolicyPageLayout';

export default function TermsAndConditions() {
  return (
    <PolicyPageLayout
      title="Terms & Conditions"
      content={
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Introduction</h2>
            <p>Welcome to Shopwave (<strong>"Company"</strong>, <strong>"we"</strong>, <strong>"our"</strong>, <strong>"us"</strong>)!</p>
            <p>
              These Terms of Service (<strong>"Terms"</strong>, <strong>"Terms of Service"</strong>) govern your use of our website located at <a href="https://www.shopwave.social/dropshipping" className="text-blue-600 hover:underline">https://www.shopwave.social/dropshipping</a> (together or individually <strong>"Service"</strong>).
            </p>
            <p>
              Our Privacy Policy also governs your use of our Service and explains how we collect, safeguard and disclose information that results from your use of our web pages.
            </p>
            <p>
              Your agreement with us includes these Terms and our Privacy Policy (<strong>"Agreements"</strong>). You acknowledge that you have read and understood the Agreements, and agree to be bound by them.
            </p>
            <p>
              If you do not agree with (or cannot comply with) the Agreements, then you may not use the Service. These Terms apply to all visitors, users, and others who wish to access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Communications</h2>
            <p>
              By using our Service, you agree to subscribe to newsletters, marketing or promotional materials, and other information we may send.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Purchases</h2>
            <p>
              If you wish to purchase any product or service made available through the Service (<strong>"Purchase"</strong>), you may be asked to supply certain information relevant to your Purchase including but not limited to, your credit or debit card number, the expiration date of your card, your billing address, and your shipping information.
            </p>
            <p>
              You represent and warrant that: (i) you have the legal right to use any card(s) or other payment method(s) in connection with any Purchase; and that (ii) the information you supply to us is true, correct, and complete.
            </p>
            <p>
              We may employ the use of third party services for the purpose of facilitating payment and the completion of Purchases. By submitting your information, you grant us the right to provide the information to these third parties subject to our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Prohibited Uses</h2>
            <p>You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>In any way that violates any applicable national or international law or regulation.</li>
              <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way by exposing them to inappropriate content or otherwise.</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.</li>
              <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Intellectual Property</h2>
            <p>
              The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of Shopwave and its licensors. The Service is protected by copyright, trademark, and other laws of India and foreign countries.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of India, which governing law applies to agreement without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-brand-navy pl-3">Contact Us</h2>
            <p>Please send your feedback, comments, requests for technical support by email: <strong>shopwave.social@gmail.com</strong>.</p>
          </section>
        </div>
      }
    />
  );
}
