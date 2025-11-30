'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Key } from 'lucide-react';
import { encryptApiKey } from '@/lib/encryption';
import Link from 'next/link';
import { useApiKeySetup } from '@/lib/hooks/useApiKeySetup';

export default function SetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { saveApiKey, skipValidation, isConfigured } = useApiKeySetup();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === "undefined") return;
  
    const verify = async () => {
      const configured = await isConfigured();
      if (configured) router.push("/dashboard");
    };
  
    verify();
  }, [router, isConfigured]);

  useEffect(() => {
    // Redirect to home if not authenticated
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      // (Optional) front-end format check:
      if (!apiKey.startsWith("AI")) throw new Error("Invalid API key format");

      await saveApiKey(apiKey);

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSkipValidation = async () => {
    try {
      setLoading(true);
      await skipValidation(apiKey);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <Key className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-800">Enter Your Gemini API Key</h2>
          <p className="text-gray-600 mt-2">
            Your key is stored securely on your device only
          </p>
        </div>

        <div className="mb-4">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-00 mb-2">
            Gemini API Key
          </label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                handleSubmit();
              }
            }}
            placeholder="AIza..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            disabled={loading}
            autoComplete="off"
          />
          <p className="text-xs text-gray-500 mt-1">
            Starts with "AIza" followed by random characters
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">❌ {error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !apiKey.trim()}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed mb-2"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Validating...
            </span>
          ) : (
            'Validate & Continue'
          )}
        </button>

        <button
          onClick={handleSkipValidation}
          disabled={loading || !apiKey.trim()}
          className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Skip Validation & Continue
        </button>

        <div className="mt-4 text-center">
          <Link
            href="/guide"
            className="text-blue-600 text-sm hover:underline"
          >
            Don't have an API key? Learn how to get one →
          </Link>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">🔒 Privacy & Security</h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>✅ API key encrypted before storage</li>
            <li>✅ Stored only on your device</li>
            <li>✅ Never sent to our servers</li>
            <li>✅ You can delete it anytime</li>
          </ul>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Signed in as: <span className="font-medium">{session.user?.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
}