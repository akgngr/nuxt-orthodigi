import { prisma } from '../../utils/prisma';
import { protect } from '../../utils/protect';

export default defineEventHandler(async (event) => {
  await protect(event);
  
  const instance = (prisma as any);
  const keys = Object.keys(instance);
  const protoKeys = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));
  
  // Try to list model names by looking for common prisma methods
  const models = [];
  for (const key in instance) {
    if (instance[key] && typeof instance[key] === 'object' && instance[key].findMany) {
      models.push(key);
    }
  }

  return {
    keys,
    protoKeys,
    models,
    blogExists: !!instance.blog,
    blogType: typeof instance.blog,
    productExists: !!instance.product,
    urunlerExists: !!instance.urunler
  };
});
