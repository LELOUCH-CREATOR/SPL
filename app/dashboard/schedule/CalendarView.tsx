'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, MapPin, Calendar as CalendarIcon } from 'lucide-react'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

interface Event {
    id: string
    title: string
    date: Date
    type: 'exam' | 'event' | 'holiday'
    color?: string
    details?: string
    location?: string
}

export default function CalendarView({ events }: { events: Event[] }) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

    // Calendar Logic
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const days = new Date(year, month + 1, 0).getDate()
        const firstDay = new Date(year, month, 1).getDay()
        return { days, firstDay }
    }

    const { days, firstDay } = getDaysInMonth(currentDate)

    // Generate Calendar Grid
    const calendarDays = []
    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null)
    }
    // Days of current month
    for (let i = 1; i <= days; i++) {
        calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i))
    }

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const isSameDate = (date1: Date, date2: Date) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear()
    }

    const getEventsForDate = (date: Date) => {
        return events.filter(e => isSameDate(e.date, date))
    }

    const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : []
    const today = new Date()

    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
            {/* Calendar Main Section */}
            <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 flex items-center justify-between border-b border-slate-50">
                    <h2 className="text-2xl font-bold text-slate-900 font-heading">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex space-x-2">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-600">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors">
                            Today
                        </button>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-600">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 p-6">
                    <div className="grid grid-cols-7 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2 lg:gap-4 auto-rows-fr">
                        {calendarDays.map((date, idx) => {
                            if (!date) return <div key={`empty-${idx}`} className="h-24 lg:h-32 bg-slate-50/30 rounded-2xl" />

                            const dayEvents = getEventsForDate(date)
                            const isToday = isSameDate(date, today)
                            const isSelected = selectedDate && isSameDate(date, selectedDate)

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedDate(date)}
                                    className={twMerge(
                                        "h-24 lg:h-32 rounded-2xl border p-2 flex flex-col items-start justify-start transition-all duration-200 relative group text-left",
                                        isSelected ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/10 z-10" : "border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md",
                                        isToday ? "bg-indigo-50/50" : ""
                                    )}
                                >
                                    <span className={twMerge(
                                        "text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full mb-1 transition-colors",
                                        isToday ? "bg-indigo-600 text-white shadow-md shadow-indigo-300" : "text-slate-700 group-hover:bg-slate-100",
                                        isSelected && !isToday ? "bg-indigo-100 text-indigo-700" : ""
                                    )}>
                                        {date.getDate()}
                                    </span>

                                    {/* Event Dots/Bars */}
                                    <div className="w-full space-y-1 overflow-hidden">
                                        {dayEvents.slice(0, 3).map((evt, i) => (
                                            <div key={i} className={twMerge(
                                                "text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium",
                                                evt.type === 'exam' ? "bg-amber-100 text-amber-800" :
                                                    evt.type === 'holiday' ? "bg-emerald-100 text-emerald-800" :
                                                        "bg-blue-100 text-blue-800"
                                            )}>
                                                {evt.title}
                                            </div>
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <span className="text-[10px] text-slate-400 pl-1">+{dayEvents.length - 3} more</span>
                                        )}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Side Panel: Selected Date Details */}
            <div className="w-full lg:w-96 flex flex-col gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-800">
                            {selectedDate?.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h3>
                        {/* <button className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors">
                            <Plus className="w-4 h-4" />
                        </button> */}
                    </div>

                    <div className="space-y-4">
                        {selectedEvents.length > 0 ? (
                            selectedEvents.map((evt, i) => (
                                <div key={i} className="group p-4 rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-lg transition-all duration-300">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={twMerge(
                                            "text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide",
                                            evt.type === 'exam' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                                        )}>
                                            {evt.type}
                                        </span>
                                        <span className="text-xs font-medium text-slate-400 flex items-center">
                                            <Clock className="w-3 h-3 mr-1" /> All Day
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-lg mb-1">{evt.title}</h4>
                                    {evt.details && <p className="text-sm text-slate-500 mb-2">{evt.details}</p>}
                                    {evt.location && (
                                        <div className="flex items-center text-xs text-slate-400 font-medium">
                                            <MapPin className="w-3 h-3 mr-1" /> {evt.location}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                                    <CalendarIcon className="w-6 h-6" />
                                </div>
                                <p className="text-slate-500 font-medium">No events for this day</p>
                                <p className="text-slate-400 text-sm mt-1">Enjoy your free time!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
