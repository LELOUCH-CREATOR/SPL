'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
// In production, use 'html5-qrcode' or 'react-qr-reader'
// For this prototype, we'll simulate the scanner interface or assume a library is present.
// Since I can't install packages easily without prompt, I will stub the Camera view.

export default function KioskPage() {
    const [scannedData, setScannedData] = useState<string | null>(null)
    const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE')
    const supabase = createClient()

    const handleScan = async (data: string) => {
        if (status === 'PROCESSING') return
        setScannedData(data)
        setStatus('PROCESSING')

        // Call API
        try {
            // Mock attendance marking
            // const { error } = await markAttendance(data)

            // Checking if student exists for demo
            const { data: student } = await supabase.from('students').select('name').eq('id', data).single()

            if (student) {
                setStatus('SUCCESS')
                setTimeout(() => {
                    setStatus('IDLE')
                    setScannedData(null)
                }, 2000)
            } else {
                setStatus('ERROR')
                setTimeout(() => setStatus('IDLE'), 2000)
            }
        } catch (e) {
            setStatus('ERROR')
        }
    }

    // Mock Scanner Simulation
    useEffect(() => {
        const interval = setInterval(() => {
            // Simulating a scan for demo purposes if nothing is happening
            // In real app, this is where the Camera library logic goes
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold mb-8">Attendance Kiosk</h1>

            <div className="relative w-full max-w-md aspect-square bg-black rounded-3xl overflow-hidden border-4 border-slate-700 shadow-2xl">
                {/* Camera View Finder */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-slate-500">Camera Feed Active</p>
                </div>

                {/* Overlay */}
                <div className="absolute inset-x-12 inset-y-12 border-2 border-white/50 rounded-xl animate-pulse"></div>

                {/* Status Overlays */}
                {status === 'SUCCESS' && (
                    <div className="absolute inset-0 bg-green-500/90 flex items-center justify-center flex-col animate-in fade-in">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold">Welcome!</h2>
                        <p className="text-white/90">Attendance Marked</p>
                    </div>
                )}

                {status === 'ERROR' && (
                    <div className="absolute inset-0 bg-red-500/90 flex items-center justify-center flex-col animate-in fade-in">
                        <h2 className="text-2xl font-bold">Invalid QR</h2>
                        <p className="text-white/90">Please try again</p>
                    </div>
                )}
            </div>

            <div className="mt-8 text-slate-400 text-sm md:text-base text-center">
                Point your ID card QR code at the camera.
            </div>

            {/* Debug helper */}
            <input
                type="text"
                placeholder="Simulate Scan (Enter Student ID)"
                className="mt-8 px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-200 w-full max-w-md"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleScan(e.currentTarget.value)
                        e.currentTarget.value = ''
                    }
                }}
            />
        </div>
    )
}
