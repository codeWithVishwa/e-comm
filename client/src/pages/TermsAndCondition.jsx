import React from "react";
import { Button } from "../components/Button";

export const TermsAndCondition = () => {
  return (
    <div className="min-h-screen bg-gray-800 text-white px-6 py-12">
      <div className="max-w-3xl mx-auto mt-15">
        <Button/>
        <h1 className="text-3xl font-bold mb-6 border-b pt-5 border-gray-700 pb-2">
          Terms & Conditions
        </h1>

        <p className="mb-6 text-gray-300">
          Welcome to <strong>CrackIt</strong>. By using our website and placing
          an order, you agree to the following terms and conditions. Please read
          them carefully before using our services.
        </p>

        <h2 className="text-xl font-semibold mb-2">1. Eligibility</h2>
        <p className="mb-6 text-gray-300">
          You must be at least 18 years old to make purchases on our platform.
          By using CrackIt, you confirm that you meet this requirement.
        </p>

        <h2 className="text-xl font-semibold mb-2">2. Product Availability</h2>
        <p className="mb-6 text-gray-300">
          All products displayed on our site are subject to availability. We
          reserve the right to limit quantities or discontinue products at any
          time without prior notice.
        </p>

        <h2 className="text-xl font-semibold mb-2">3. Pricing & Payment</h2>
        <p className="mb-6 text-gray-300">
          Prices shown on the website are final and may change without notice.
          Payments are processed securely via Razorpay. Orders will be fulfilled
          only after successful payment confirmation.
        </p>

        <h2 className="text-xl font-semibold mb-2">4. Delivery & Shipping</h2>
        <p className="mb-6 text-gray-300">
          We use third-party courier services for deliveries. Delivery timelines
          may vary based on location and courier efficiency. CrackIt is not
          liable for any delay, loss, or damage caused by the courier once the
          product has left our facility.
        </p>

        <h2 className="text-xl font-semibold mb-2">5. Returns & Refunds</h2>
        <p className="mb-6 text-gray-300">
          Due to the nature of our products (firecrackers), we do
          <strong> not offer returns or refunds</strong>. All sales are final.
          Please ensure you review your order carefully before confirming.
        </p>

        <h2 className="text-xl font-semibold mb-2">6. Limitation of Liability</h2>
        <p className="mb-6 text-gray-300">
          CrackIt is not responsible for any damage, injury, or loss resulting
          from the use or misuse of our products. Use crackers responsibly and
          in accordance with local laws and safety guidelines.
        </p>

        <h2 className="text-xl font-semibold mb-2">7. Legal Compliance</h2>
        <p className="mb-6 text-gray-300">
          You are responsible for complying with all applicable laws and
          regulations regarding the purchase and use of firecrackers in your
          area.
        </p>

        <h2 className="text-xl font-semibold mb-2">8. Changes to Terms</h2>
        <p className="mb-6 text-gray-300">
          CrackIt reserves the right to update or modify these terms at any
          time. Continued use of the website implies acceptance of the modified
          terms.
        </p>

        <h2 className="text-xl font-semibold mb-2">9. Contact Us</h2>
        <p className="mb-6 text-gray-300">
          If you have any questions about these terms, you can contact us at{" "}
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

