import React from "react";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="bg-white min-h-screen px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center"
      >
        <h1 className="text-4xl font-bold mb-6 text-blue-700">
          About Our Clinical Web App
        </h1>
        <p className="text-gray-700 text-lg leading-relaxed mb-10">
          Our Clinical Web App is designed to make patient management faster,
          smarter, and more secure. Built with the latest technology stack, it
          streamlines the way healthcare providers interact with patient data,
          offering real-time access and efficient record-keeping.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
        {/* QR Code Feature */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gray-100 p-6 rounded-xl shadow-md"
        >
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">
            📱 QR Code Functionality
          </h2>
          <p className="text-gray-700">
            Each patient receives a unique QR code during registration. This QR
            code stores their identification securely.
            <br />
            <br />
            When scanned (using a mobile or webcam), the app quickly retrieves
            their medical record from the database, eliminating manual searches
            and reducing errors. This improves check-in speed, patient safety,
            and doctor access to up-to-date health history.
          </p>
        </motion.div>

        {/* Other Features */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gray-100 p-6 rounded-xl shadow-md"
        >
          <h2 className="text-2xl font-semibold mb-4 text-green-600">
            🚀 Key Features
          </h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-2">
            <li>Real-time patient data access</li>
            <li>Secure registration with QR code</li>
            <li>Fast patient lookup by scanning</li>
            <li>Doctor and admin dashboard</li>
            <li>AI assistance (coming soon!)</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
