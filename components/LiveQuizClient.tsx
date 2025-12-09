'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function LiveQuizClient({ sessionId, studentId }: { sessionId: string, studentId: string }) {
    const [gameState, setGameState] = useState<{ questionIndex: number, status: string }>({ questionIndex: -1, status: 'WAITING' })
    const [submitted, setSubmitted] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const channel = supabase.channel(`session:${sessionId}`)
            .on('broadcast', { event: 'game_state' }, (payload) => {
                setGameState(payload.payload)
                setSubmitted(false) // Reset for new question
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [sessionId])

    const submitAnswer = async (answer: string) => {
        setSubmitted(true)

        // 1. Broadcast for teacher realtime view
        await supabase.channel(`session:${sessionId}`).send({
            type: 'broadcast',
            event: 'answer_submission',
            payload: { studentId, answer, questionIndex: gameState.questionIndex }
        })

        // 2. Persist to DB (using the server action created earlier - requires importing via a wrapper or direct RPC if setup)
        // For now, we'll assume the broadcast is enough for the "Live" part, and persistence happens at session end or separate call.
    }

    if (gameState.questionIndex === -1) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="animate-pulse bg-indigo-100 rounded-full h-16 w-16 mb-4 flex items-center justify-center">
                    <span className="text-2xl">⏳</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800">Waiting for host to start...</h2>
                <p className="text-slate-500">Get ready!</p>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-md mx-auto">
            <div className="mb-4 flex justify-between text-sm font-medium text-slate-500">
                <span>Question {gameState.questionIndex + 1}</span>
                {submitted && <span className="text-green-600">Answer Submitted</span>}
            </div>

            <div className="space-y-3">
                {/* 
                   In a real app, 'questions' would be fetched based on `active_resource_id` in LiveSession 
                   or passed down. Here we mock options.
                 */}
                {['A', 'B', 'C', 'D'].map(opt => (
                    <button
                        key={opt}
                        disabled={submitted}
                        onClick={() => submitAnswer(opt)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${submitted
                                ? 'border-slate-100 text-slate-400 bg-slate-50'
                                : 'border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 active:scale-[0.98]'
                            }`}
                    >
                        <span className="font-bold mr-2">{opt}</span> Answer Option {opt}
                    </button>
                ))}
            </div>
        </div>
    )
}
