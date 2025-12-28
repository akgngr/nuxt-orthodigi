import { DashboardService } from '../../services/dashboard.service'

export default defineEventHandler(async (event) => {
    try {
        return await DashboardService.getStats()
    } catch (error) {
        console.error('Dashboard data fetch error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch dashboard data'
        })
    }
})
