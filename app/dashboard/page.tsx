'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, LogOut, TrendingUp, List } from 'lucide-react';

import { parseExpenseWithGemini } from '@/lib/gemini';
import { type Expense } from "@/lib/storage";
import { useExpenses } from '@/lib/hooks/useExpense';

import ExpenseChart from '@/components/ExpenseChart';
import ExpenseList from '@/components/ExpenseList';
import ExportButton from '@/components/ExportButton';
import { MonthSelector } from '@/components/MonthSelector';
import { useApiKeySetup } from '@/lib/hooks/useApiKeySetup';
import { logError } from '@/lib/logger';


// Check if browser supports speech recognition
const isSpeechRecognitionSupported = () => {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
};

export default function DashboardPage() {
  const { isConfigured, removeLocalConfig } = useApiKeySetup();
  const { data: session, status } = useSession();
  const router = useRouter();

  if (!isConfigured) {
    router.push('/setup');
  }
  
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

 
  const { expenses, loading, addExpense, deleteExpense } = useExpenses(year, month);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showSubmit, setShowSubmit] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [view, setView] = useState<'dashboard' | 'list'>('dashboard');
  const [error, setError] = useState<string>('');
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef('');


  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (!isSpeechRecognitionSupported()) {
      setSpeechSupported(false);
      setError('Speech recognition not supported.');
      return;
    }

    if (recognitionRef.current) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError('');
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const part = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalTranscript += part + ' ';
          else interimTranscript += part;
        }

        const newTranscript = (finalTranscript || interimTranscript).trim();
        if (newTranscript) {
          setTranscript(newTranscript);
          transcriptRef.current = newTranscript;
        }

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        silenceTimerRef.current = setTimeout(() => stopListening(), 3000);
      };

      recognition.onerror = (event: any) => {
        logError('Speech recognition error:', {errorEvent : event});

        if (event.error === 'not-allowed')
          setError('Microphone access denied.');
        else if (event.error === 'no-speech')
          setError('No speech detected.');
        else setError(event.error || 'Speech error');

        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        if (transcriptRef.current.trim()) setShowSubmit(true);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      setSpeechSupported(false);
      setError('Failed to initialize speech recognition.');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return;

    setTranscript('');
    transcriptRef.current = '';
    setError('');
    setShowSubmit(false);

    try {
      recognitionRef.current.start();
    } catch (err) {
      if (String(err).includes('already started')) setIsListening(true);
      else setError('Could not start recording.');
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {}
    setIsListening(false);
  };

  const handleSubmit = async () => {
    if (!transcript.trim()) {
      setError('Missing transcript or API key.');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const parsed = await parseExpenseWithGemini(transcript);

      const newExpense: Expense = {
        id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        dateSpent: parsed.dateSpent,
        amountSpent: parsed.amountSpent,
        spentOn: parsed.spentOn,
        spentThrough: parsed.spentThrough,
        selfOrOthersIncluded: parsed.selfOrOthersIncluded,
        paidTo : parsed.paidTo? parsed.paidTo : '',
        description: transcriptRef.current,
        createdAt: new Date().toISOString(),
      };

      await addExpense(newExpense); // HOOK handles DB + local
      setTranscript('');
      transcriptRef.current = '';
      setShowSubmit(false);

      alert('Expense added!');
    } catch (err: any) {
      setError(err.message || 'Failed to process expense.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Delete this expense?')) deleteExpense(id);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10 text-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between">
          <div>
            <h1 className="text-xl font-bold">Voice Expense Tracker</h1>
            <div className="flex flex-row gap-1 items-center text-sm">
              <img className="w-6 h-6 rounded-full" src={session?.user?.image || ""} alt="Rounded avatar" />
              <span>{session.user?.name}</span></div>
          </div>
          <button
            onClick={() => {
              removeLocalConfig();
              signOut({ callbackUrl: '/' })
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <LogOut />
          </button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="max-w-4xl mx-auto px-4 py-4 text-gray-900">
        <MonthSelector
          year={year}
          month={month}
          onChange={(y, m) => {
            setYear(y);
            setMonth(m);
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Voice Input */}

        {/* Voice Input Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Add New Expense</h2>

          {!speechSupported ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎤❌</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Speech Recognition Not Supported
              </h3>
              <p className="text-gray-600 mb-4">
                Your browser doesn't support speech recognition. Please use:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Google Chrome (Desktop or Android)</li>
                <li>✅ Microsoft Edge</li>
                <li>✅ Safari (macOS or iOS)</li>
              </ul>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              {/* Microphone Button */}
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={processing}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-10 h-10 text-white" />
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}
              </button>

              {/* Status Text */}
              <div className="text-center">
                {isListening && (
                  <p className="text-sm font-medium text-red-600 animate-pulse">
                    🎤 Listening... (Auto-stops after 3s silence)
                  </p>
                )}
                {!isListening && !transcript && (
                  <p className="text-sm text-gray-600">
                    Tap the microphone to speak your expense
                  </p>
                )}
                {processing && (
                  <p className="text-sm font-medium text-blue-600">
                    🤖 Processing with Gemini AI...
                  </p>
                )}
              </div>

              {/* Transcript Display */}
              {transcript && (
                <div className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                  <p className="text-sm text-gray-500 mb-1">Transcript:</p>
                  <p className="text-gray-800 font-medium">{transcript}</p>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="w-full p-4 bg-red-50 rounded-lg border-2 border-red-200">
                  <p className="text-sm text-red-600">❌ {error}</p>
                </div>
              )}

              {/* Submit Button */}
              {showSubmit && !processing && (
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-md transform active:scale-95"
                >
                  ✓ Submit Expense
                </button>
              )}
            </div>
          )}

          {/* Tips */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>💡 Tip:</strong> Say something like "I spent 500 rupees on groceries today using UPI" 
              or "Paid 1500 for cab ride yesterday with card"
            </p>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setView('dashboard')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all shadow-sm ${
              view === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-5 h-5 inline mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setView('list')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all shadow-sm ${
              view === 'list'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <List className="w-5 h-5 inline mr-2" />
            List View
          </button>
        </div>

        {/* Dashboard View */}
        {view === 'dashboard' && (
          <div className="space-y-6">
            {expenses.length > 0 ? (
              <>
                <ExpenseChart expenses={expenses} />
                <ExportButton expenses={expenses} />
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Mic className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No expenses yet
                </h3>
                <p className="text-gray-500">
                  Tap the microphone above to add your first expense!
                </p>
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
        )}
      </div>
    </div>
  );
}