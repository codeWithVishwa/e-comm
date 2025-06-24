import React from 'react';
import { Button } from '../components/Button';

export const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-12">
      <div className="max-w-3xl mx-auto mt-15">
        <Button/>
        <h1 className="text-3xl font-bold mb-6 pt-5 border-b border-gray-700 pb-2">
          Refund & Return Policy
        </h1>

        <p className="mb-6 text-gray-300">
          At <strong>CrackIt</strong>, we take pride in delivering safe and
          quality crackers to your doorstep. Due to the nature of our products,
          we have a strict <strong>no refund and no return</strong> policy.
        </p>

        <h2 className="text-xl font-semibold mb-2">1. No Returns</h2>
        <p className="mb-6 text-gray-300">
          We do <strong>not accept returns</strong> on any product once it is
          delivered. Please review your order carefully before confirming your
          purchase.
        </p>

        <h2 className="text-xl font-semibold mb-2">2. No Refunds</h2>
        <p className="mb-6 text-gray-300">
          All sales are <strong>final</strong>. We do <strong>not issue
          refunds</strong> for any reason, including but not limited to:
        </p>
        <ul className="list-disc pl-6 text-gray-300 mb-6">
          <li>Change of mind after order placement</li>
          <li>Delay in delivery by third-party couriers</li>
          <li>Dislike of product packaging or design</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">3. Damaged or Missing Items</h2>
        <p className="mb-6 text-gray-300">
          If your package arrives severely damaged or items are missing,
          contact us within <strong>24 hours</strong> of delivery. While we
          cannot promise replacements, we will evaluate such cases at our
          discretion, based on courier verification.
        </p>

        <h2 className="text-xl font-semibold mb-2">4. Contact Us</h2>
        <p className="mb-6 text-gray-300">
          If you have any questions, please email us at{' '}
          <a
            href="mailto:crackitshop1@gmail.com"
            className="text-blue-400 underline"
          >
            crackitshop1@gmail.com
          </a>
          .
        </p>

        <p className="text-sm text-gray-500 mt-12">
          © {new Date().getFullYear()} CrackIt. All rights reserved.
        </p>
      </div>
    </div>
  );
};
