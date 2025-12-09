import { Badge, UserBadge } from '@prisma/client'
import { Trophy, Star, Medal, Award } from 'lucide-react'

// Extended type to include the relation
type StatusCodeBadge = UserBadge & { badge: Badge }

const iconMap: Record<string, any> = {
    trophy: Trophy,
    star: Star,
    medal: Medal,
    award: Award,
}

export function BadgeDisplay({ badges }: { badges: StatusCodeBadge[] }) {
    if (!badges || badges.length === 0) {
        return (
            <div className="text-gray-500 text-sm italic">
                No badges earned yet.
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {badges.map((userBadge) => {
                const IconComponent = iconMap[userBadge.badge.icon || 'trophy'] || Trophy

                return (
                    <div
                        key={userBadge.id}
                        className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 transition-transform hover:scale-105"
                    >
                        <div className="bg-yellow-100 p-3 rounded-full mb-3">
                            <IconComponent className="h-8 w-8 text-yellow-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900 text-center text-sm">
                            {userBadge.badge.name}
                        </h4>
                        <p className="text-xs text-gray-500 text-center mt-1">
                            {new Date(userBadge.awarded_at).toLocaleDateString()}
                        </p>
                    </div>
                )
            })}
        </div>
    )
}
