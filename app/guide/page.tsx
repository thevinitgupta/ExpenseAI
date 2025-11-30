'use client';

import { Home, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="mb-4 text-blue-600 flex items-center hover:underline"
        >
          <Home className="w-4 h-4 mr-1" /> Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
            How to Generate Your Gemini API Key
          </h1>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-600 pl-4">
              <h2 className="font-semibold text-lg mb-2">
                Step 1: Visit Google AI Studio
              </h2>
              <p className="text-gray-700 mb-3">
                Go to{' '}
                <a
                  href="https://aistudio.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  https://aistudio.google.com
                </a>{' '}
                and sign in with your Google account.
              </p>
              <div className="bg-gray-100 rounded p-4 text-center text-gray-500 border-2 border-dashed">
                [Placeholder: Screenshot of Google AI Studio homepage]
                <br />
                <span className="text-sm">
                  Add screenshot: google-ai-studio-home.png
                </span>
              </div>
            </div>

            <div className="border-l-4 border-green-600 pl-4">
              <h2 className="font-semibold text-lg mb-2">
                Step 2: Navigate to API Keys
              </h2>
              <p className="text-gray-700 mb-3">
                Click on "Get API Key" button in the left sidebar or top menu.
              </p>
              <div className="bg-gray-100 rounded p-4 text-center text-gray-500 border-2 border-dashed">
                [Placeholder: Screenshot showing API Keys menu location]
                <br />
                <span className="text-sm">
                  Add screenshot: api-keys-menu.png
                </span>
              </div>
            </div>

            <div className="border-l-4 border-purple-600 pl-4">
              <h2 className="font-semibold text-lg mb-2">
                Step 3: Create New API Key
              </h2>
              <p className="text-gray-700 mb-3">
                Click "Create API Key" button. You may need to create or select a
                Google Cloud project.
              </p>
              <div className="bg-gray-100 rounded p-4 text-center text-gray-500 border-2 border-dashed">
                [Placeholder: Screenshot of Create API Key button]
                <br />
                <span className="text-sm">
                  Add screenshot: create-api-key.png
                </span>
              </div>
            </div>

            <div className="border-l-4 border-orange-600 pl-4">
              <h2 className="font-semibold text-lg mb-2">
                Step 4: Copy Your API Key
              </h2>
              <p className="text-gray-700 mb-3">
                Once generated, copy your API key. Keep it secure and never share
                it publicly!
              </p>
              <div className="bg-gray-100 rounded p-4 text-center text-gray-500 border-2 border-dashed">
                [Placeholder: Screenshot of API key display with copy button]
                <br />
                <span className="text-sm">Add screenshot: copy-api-key.png</span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Your API key is stored only on your
                device and never sent to our servers. Keep it safe!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}