"use client"
import React from 'react'
import { Mic } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

const LandingPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
  
    useEffect(() => {
      // If already logged in, redirect to setup or dashboard
      if (session) {
        const hasApiKey = typeof window !== 'undefined' 
          ? localStorage.getItem('gemini_api_key') 
          : null;
        
        if (hasApiKey) {
          router.push('/dashboard');
        } else {
          router.push('/setup');
        }
      }
    }, [session, router]);
  
    const handleGoogleSignIn = () => {
      signIn('google', { callbackUrl: '/setup' });
    };
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto pt-12">
          {/* Logo/Icon */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
              <Mic className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Voice-Gemini Expense Tracker
            </h1>
            <p className="text-gray-600">Speak your expenses, we'll track them</p>
          </div>
  
          {/* Features */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">What it does</h2>
            <p className="text-gray-700 mb-4">
              Simply speak your expenses naturally, and our AI-powered system will
              automatically parse and categorize them. No manual data entry required!
            </p>
  
            <h2 className="text-xl font-semibold mb-3 text-gray-800">How it works</h2>
            <ol className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="font-bold mr-2 text-blue-600">1.</span>
                <span>Tap the mic button and speak your expense</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2 text-blue-600">2.</span>
                <span>Gemini AI extracts date, amount, and category</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2 text-blue-600">3.</span>
                <span>View beautiful charts and download your data</span>
              </li>
            </ol>
          </div>
  
          {/* Benefits */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Why use this?</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">🎤</span>
                <span><strong>Voice Input:</strong> No typing required</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🤖</span>
                <span><strong>AI-Powered:</strong> Automatically categorizes expenses</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🔒</span>
                <span><strong>Privacy First:</strong> Data stays on your device</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📊</span>
                <span><strong>Visual Analytics:</strong> Beautiful charts and insights</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📥</span>
                <span><strong>Export Ready:</strong> Download as CSV or JSON</span>
              </li>
            </ul>
          </div>
  
          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={status === 'loading'}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Loading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Login with Google
                </>
              )}
            </button>
  
            <Link
              href="/guide"
              className="block w-full bg-white text-blue-600 py-4 rounded-lg font-semibold shadow-md border-2 border-blue-600 hover:bg-blue-50 transition text-center"
            >
              How to Generate Gemini API Key
            </Link>
          </div>
  
          {/* Footer Info */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>Free to use • No credit card required • Your data stays private</p>
          </div>
        </div>
      </div>
    );
}

export default LandingPage