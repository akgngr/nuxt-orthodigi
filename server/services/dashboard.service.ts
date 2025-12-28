import { prisma } from "../utils/prisma"

export class DashboardService {
    static async getStats() {
        const [patientCount, appointmentCount] = await Promise.all([
            prisma.patient.count(),
            prisma.appointment.count({
                where: {
                    date: {
                        gte: new Date()
                    }
                }
            })
        ])

        const recentPatients = await prisma.patient.findMany({
            take: 5,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                appointments: {
                    take: 1,
                    orderBy: {
                        date: 'desc'
                    }
                }
            }
        })

        return {
            stats: [
                { label: 'Toplam Kullanıcı', value: patientCount.toLocaleString(), icon: 'i-lucide-users', color: 'primary' },
                { label: 'Aktif Randevular', value: appointmentCount.toString(), icon: 'i-lucide-calendar-check', color: 'success' },
                { label: 'Yeni Mesajlar', value: '0', icon: 'i-lucide-message-square', color: 'warning' },
                { label: 'Ciro (Aylık)', value: '₺0', icon: 'i-lucide-trending-up', color: 'info' }
            ],
            recentUsers: recentPatients.map((p: any) => ({
                id: p.id,
                name: p.name,
                email: p.email,
                role: 'Hasta',
                status: 'Aktif'
            }))
        }
    }
}
