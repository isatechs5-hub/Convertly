import React, { useEffect } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { AppView } from '../types';

interface Props {
    setView: (view: AppView) => void;
}

export const PaymentSuccess: React.FC<Props> = ({ setView }) => {
    useEffect(() => {
        // Confetti or additional effects could go here
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl p-10 text-center border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm animate-bounce">
                    <CheckCircle2 className="h-12 w-12" />
                </div>

                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Payment Successful!</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 text-lg">
                    Your plan has been successfully upgraded. All professional features are now unlocked.
                </p>

                <button
                    onClick={() => setView(AppView.HOME)}
                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    Start Creating <ArrowRight className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};
