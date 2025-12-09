'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

interface Point {
    x: number
    y: number
}

interface DrawEvent {
    prev: Point
    curr: Point
    color: string
    width: number
}

export default function Whiteboard({ sessionId }: { sessionId: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [color, setColor] = useState('#000000')
    const [prevPoint, setPrevPoint] = useState<Point | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const channel = supabase.channel(`session:${sessionId}`)
            .on('broadcast', { event: 'draw' }, (payload) => {
                const { prev, curr, color, width } = payload.payload as DrawEvent
                drawLine(prev, curr, color, width)
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [sessionId])

    const drawLine = (start: Point, end: Point, strokeColor: string, lineWidth: number) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.beginPath()
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = lineWidth
        ctx.lineCap = 'round'
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)
        ctx.stroke()
        ctx.closePath()
    }

    const getPoint = (e: React.MouseEvent | React.TouchEvent): Point | null => {
        const canvas = canvasRef.current
        if (!canvas) return null
        const rect = canvas.getBoundingClientRect()

        let clientX, clientY
        if ('touches' in e) {
            clientX = e.touches[0].clientX
            clientY = e.touches[0].clientY
        } else {
            clientX = (e as React.MouseEvent).clientX
            clientY = (e as React.MouseEvent).clientY
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        }
    }

    const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
        const point = getPoint(e)
        if (point) {
            setIsDrawing(true)
            setPrevPoint(point)
        }
    }

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !prevPoint) return
        const currPoint = getPoint(e)
        if (!currPoint) return

        // Local draw
        drawLine(prevPoint, currPoint, color, 2)

        // Broadcast
        supabase.channel(`session:${sessionId}`).send({
            type: 'broadcast',
            event: 'draw',
            payload: { prev: prevPoint, curr: currPoint, color, width: 2 }
        })

        setPrevPoint(currPoint)
    }

    const handleEnd = () => {
        setIsDrawing(false)
        setPrevPoint(null)
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-2">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                <button onClick={() => {
                    const canvas = canvasRef.current
                    if (canvas) {
                        const ctx = canvas.getContext('2d')
                        ctx?.clearRect(0, 0, canvas.width, canvas.height)
                        // TODO: Broadcast clear event
                    }
                }} className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm">Clear</button>
            </div>
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="border border-slate-200 rounded bg-white shadow-sm touch-none"
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
            />
        </div>
    )
}
