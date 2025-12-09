'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function LiveQuizHost({ sessionId, questions }: { sessionId: string, questions: any[] }) {
    const [currentIndex, setCurrentIndex] = useState(-1) // -1 = Lobby, 0...N = Questions
    const [answers, setAnswers] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        const channel = supabase.channel(`session:${sessionId}`)
            .on('broadcast', { event: 'answer_submission' }, (payload) => {
                setAnswers(prev => [...prev, payload.payload])
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [sessionId])

    const setQuestion = (index: number) => {
        setCurrentIndex(index)
        // Broadcast new state
        supabase.channel(`session:${sessionId}`).send({
            type: 'broadcast',
            event: 'game_state',
            payload: { questionIndex: index, status: 'ACTIVE' }
        })
    }

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold">Quiz Host</h2>
                <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {answers.length} Answers Received
                </div>
            </div>

            {currentIndex === -1 ? (
                <div className="text-center py-12">
                    <p className="text-slate-500 mb-4">Waiting for students to join...</p>
                    <button onClick={() => setQuestion(0)} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">Start Quiz</button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-semibold text-lg mb-2">My Question {currentIndex + 1}</h3>
                        <p className="text-slate-700">{questions[currentIndex]?.question}</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            disabled={currentIndex <= 0}
                            onClick={() => setQuestion(currentIndex - 1)}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 disabled:opacity-50"
                        >Prev</button>

                        <button
                            disabled={currentIndex >= questions.length - 1}
                            onClick={() => setQuestion(currentIndex + 1)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >Next Question</button>

                        <button
                            onClick={() => {/* End Session Logic */ }}
                            className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 ml-auto"
                        >End Quiz</button>
                    </div>

                    <div className="mt-8">
                        <h4 className="font-semibold text-slate-900 mb-4">Live Results</h4>
                        {/* Simple bar chart or list visualization would go here */}
                        <div className="grid grid-cols-2 gap-4">
                            {['A', 'B', 'C', 'D'].map(opt => (
                                <div key={opt} className="bg-white border border-slate-200 p-3 rounded flex justify-between">
                                    <span>{opt}</span>
                                    <span className="font-bold">{answers.filter((a: any) => a.answer === opt && a.questionIndex === currentIndex).length}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
