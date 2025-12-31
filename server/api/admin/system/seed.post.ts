import { SystemService } from '../../../services/system.service';

export default defineEventHandler(async (event) => {
    // Bu endpoint güvenlik için normalde korunmalı, 
    // ancak veritabanı sıfırlandığında ilk kurulum için açık bırakıyoruz
    // veya sadece belirli bir API key ile çalışabilir hale getirilebilir.
    
    try {
        return await SystemService.seedDatabase();
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Seed işlemi başarısız oldu.'
        });
    }
});
