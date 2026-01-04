import { prisma } from '../utils/prisma'
import { ALL_PERMISSIONS } from '../utils/permissions'

export class SystemService {
  /**
     * Veritabanı sıfırlandığında veya yeni izinler eklendiğinde
     * tüm izinleri ve temel rolleri senkronize eder.
     */
  static async seedDatabase() {
    console.log('🚀 Sistem seed işlemi başlatılıyor...')

    // 1. İzinleri Senkronize Et (Upsert)
    const permissionPromises = ALL_PERMISSIONS.map(permName => {
      const [resource, action] = permName.split(':')
      if (!resource || !action) return Promise.resolve()
      
      return prisma.permission.upsert({
        where: {
          action_resource: {
            action,
            resource
          }
        },
        update: {},
        create: {
          action,
          resource,
          description: `${permName} yetkisi`
        }
      })
    })
    await Promise.all(permissionPromises)
    console.log(`✅ ${ALL_PERMISSIONS.length} adet izin senkronize edildi.`)

    // 2. Admin Rolünü Oluştur veya Güncelle
    const adminRole = await prisma.role.upsert({
      where: { name: 'admin' },
      update: {
        description: 'Tüm yetkilere sahip yönetici rolü'
      },
      create: {
        name: 'admin',
        description: 'Tüm yetkilere sahip yönetici rolü'
      }
    })

    // 3. Tüm İzinleri Admin Rolüne Ata
    const allDbPermissions = await prisma.permission.findMany()

    // Mevcut izinleri temizle (isteğe bağlı, ama tam senkronizasyon için güvenli)
    await prisma.role.update({
      where: { id: adminRole.id },
      data: {
        permissions: {
          set: allDbPermissions.map(p => ({ id: p.id }))
        }
      }
    })
    console.log('✅ Admin rolü ve yetkileri güncellendi.')

    // 4. İlk kullanıcıyı Admin yap (Eğer varsa)
    const firstUser = await prisma.user.findFirst()
    if (firstUser) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: firstUser.id,
            roleId: adminRole.id
          }
        },
        update: {},
        create: {
          userId: firstUser.id,
          roleId: adminRole.id
        }
      })
      console.log(`✅ ${firstUser.email} kullanıcısına Admin rolü atandı.`)
    }

    return {
      success: true,
      message: 'Sistem başarıyla senkronize edildi.',
      stats: {
        permissions: ALL_PERMISSIONS.length,
        role: 'Admin',
        userAssigned: !!firstUser
      }
    }
  }
}
