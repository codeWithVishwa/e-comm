import React from "react";
import { Button } from "../components/Button";

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white px-6  py-12">
      <div className="max-w-3xl mx-auto mt-15">
        <Button/>
        <h1 className="text-3xl font-bold pt-5 mb-6 border-b border-gray-700 pb-2">
          Privacy Policy
        </h1>

        <p className="mb-4 text-gray-300">
          <strong>Effective Date:</strong> June 23, 2025
        </p>

        <p className="mb-6 text-gray-300">
          Welcome to <strong>CrackIt</strong>! This Privacy Policy explains how
          we collect, use, and protect your information when you visit our
          website and purchase crackers from us.
        </p>

        <h2 className="text-xl font-semibold mb-2">1. What We Collect</h2>
        <ul className="list-disc pl-6 text-gray-300 mb-6">
          <li>Your name, email address, and delivery address</li>
          <li>Order details such as the products you buy</li>
          <li>Technical info like your browser, device type, and IP address</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">2. How We Use It</h2>
        <p className="mb-6 text-gray-300">
          We only use your information to:
        </p>
        <ul className="list-disc pl-6 text-gray-300 mb-6">
          <li>Process and deliver your orders</li>
          <li>Send you order updates</li>
          <li>Improve your shopping experience</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">3. Payment Security</h2>
        <p className="mb-6 text-gray-300">
          All payments are processed securely through Razorpay. We do not store
          any payment information on our servers.
        </p>

        <h2 className="text-xl font-semibold mb-2">
          4. We Don’t Sell Your Data
        </h2>
        <p className="mb-6 text-gray-300">
          CrackIt is just a cracker shop. We <strong>do not</strong> sell, rent,
          or trade your personal data. Your trust means everything to us.
        </p>

        <h2 className="text-xl font-semibold mb-2">5. Contact</h2>
        <p className="mb-6 text-gray-300">
          If you have any questions or want to update/delete your information,
          feel free to contact us at{" "}
          <a
            href="mailto:crackitshop1@gmail.com"
            className="text-blue-400 underline"
          >
            crackitshop1@gmail.com
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold mb-2">
          6. Changes to This Policy
        </h2>
        <p className="mb-6 text-gray-300">
          We may occasionally update this policy. Any changes will be reflected
          on this page.
        </p>

        <p className="text-sm text-gray-500 mt-12">
          © {new Date().getFullYear()} CrackIt. All rights reserved.
        </p>
      </div>
    </div>
  );
};

