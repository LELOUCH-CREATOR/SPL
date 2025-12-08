'use client'

import { useState } from 'react'
import { createEvent } from '@/app/actions/events'
import { Plus, X, Loader2, Calendar } from 'lucide-react'
import { useActionState } from 'react'
import React from 'react'

const initialState = {
    error: null,
}

// Separate component for internal form logic if needed, but simple inline matches our pattern
function CreateEventForm({ onSuccess }: { onSuccess: () => void }) {
    // We can't use useActionState inside the modal if the modal logic is complex?
    // Actually simplicity is better. Let's use standard form action with a wrapper for closing.
    // However, server actions with useActionState are hooks.

    // Let's stick to simple "action={createEvent}" for now, but to close modal we need a client wrapper.
    // To keep it simple: Standard simple onSubmit or wrapped action.

    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            await createEvent(formData)
            onSuccess() // Close modal
        } catch (e) {
            alert('Failed to create event')
        } finally {
            setLoading(false)
        }
    }

    const today = new Date().toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm

    return (
        <form action={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
                <input
                    name="title"
                    required
                    placeholder="e.g. Science Fair"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                    name="description"
                    rows={3}
                    placeholder="Details about the event..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
                <input
                    name="date"
                    type="datetime-local"
                    required
                    defaultValue={today}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Event'}
            </button>
        </form>
    )
}

export default function CreateEventModal() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 hover:shadow-xl"
            >
                <Plus className="w-5 h-5 mr-2" /> Add Event
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="mb-6">
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Create New Event</h2>
                            <p className="text-sm text-slate-500">Schedule a new school-wide event.</p>
                        </div>

                        <CreateEventForm onSuccess={() => setIsOpen(false)} />
                    </div>
                </div>
            )}
        </>
    )
}
