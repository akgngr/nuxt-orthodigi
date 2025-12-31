import fs from 'node:fs/promises';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { execSync } from 'node:child_process';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

interface Field {
  name: string;
  label: string;
  type: string;
  isNullable: boolean;
  isUnique: boolean;
  slugSource?: string;
  inTable: boolean;
}

function toSlug(text: string, separator: string = '_') {
  const trMap: Record<string, string> = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  };
  return text
    .toString()
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, (m) => trMap[m] ?? m)
    .replace(/\s+/g, separator)
    .replace(/[^\w_]+/g, '')
    .toLowerCase();
}

async function main() {
  console.log('\n🚀 OrthoDigi Otonom CRUD Jeneratörüne Hoş Geldiniz!\n');

  // 1. Model İsmini Al
  const modelNameInput = await rl.question('Model ismi nedir? (Örn: Product, Category): ');
  const modelName = modelNameInput.charAt(0).toUpperCase() + modelNameInput.slice(1);
  const modelNameLower = modelName.toLowerCase();

  // 2. Alanları Al
  const fields: Field[] = [];
  let addMore = true;

  while (addMore) {
    console.log(`\n--- ${modelName} için Yeni Alan Ekle ---`);
    const fieldLabel = await rl.question('Alan Etiketi (Örn: Doktor Resmi, Başlık) [Boş bırakırsanız biter]: ');
    
    if (!fieldLabel) {
      addMore = false;
      break;
    }

    const defaultName = toSlug(fieldLabel);
    const fieldNameInput = await rl.question(`Veritabanı alan adı [${defaultName}]: `);
    const fieldName = fieldNameInput || defaultName;

    const fieldType = await rl.question('Veri tipi (String, Int, Boolean, DateTime, Float, Json, LongText, Slug) [String]: ') || 'String';
    
    let slugSource = undefined;
    if (fieldType === 'Slug') {
      const availableFields = fields.filter(f => f.type === 'String' || f.type === 'LongText');
      if (availableFields.length > 0) {
        console.log('\nSlug hangi alandan türetilsin?');
        availableFields.forEach((f, i) => console.log(`${i + 1}. ${f.label} (${f.name})`));
        const selection = await rl.question('Seçiminiz (Sayı): ');
        const index = parseInt(selection) - 1;
        if (index >= 0 && index < availableFields.length) {
          slugSource = availableFields[index].name;
        }
      }
    }

    const isNullable = (await rl.question('Null olabilir mi? (e/h) [h]: ')).toLowerCase() === 'e';
    const isUnique = fieldType === 'Slug' ? true : (await rl.question('Benzersiz (Unique) mi? (e/h) [h]: ')).toLowerCase() === 'e';
    const inTable = (await rl.question('Listeleme tablosunda görünsün mü? (e/h) [e]: ')).toLowerCase() !== 'h';

    fields.push({
      name: fieldName,
      label: fieldLabel,
      type: fieldType,
      isNullable,
      isUnique,
      slugSource,
      inTable
    });
  }

  if (fields.length === 0) {
    console.log('Hiç alan eklenmedi, işlem iptal ediliyor.');
    process.exit(0);
  }

  console.log('\n🛠️  Dosyalar oluşturuluyor...');

  try {
    // 3. Prisma Şemasını Güncelle
    await updatePrismaSchema(modelName, fields);
    console.log('✅ Prisma şeması güncellendi.');

    // 4. Servis Oluştur
    await generateService(modelName, fields);
    console.log('✅ Servis dosyası oluşturuldu.');

    // 5. API Rotalarını Oluştur
    await generateApiRoutes(modelName, fields);
    console.log('✅ API rotaları oluşturuldu.');

    // 6. Nuxt Sayfasını Oluştur
    await generateNuxtPage(modelName, fields);
    console.log('✅ Nuxt sayfası oluşturuldu.');

    console.log('\n🔄 Prisma istemcisi güncelleniyor ve migrasyon hazırlanıyor...');
    // Not: Gerçek bir ortamda bunu kullanıcıya sormak daha güvenli olabilir
    // execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('\n💡 İpucu: "npx prisma migrate dev --name add_' + modelNameLower + '" komutunu çalıştırarak veritabanını güncelleyebilirsiniz.');

    console.log(`\n✨ Başarıyla tamamlandı! ${modelName} CRUD yapısı hazır.`);
    console.log(`📍 Sayfa: app/pages/admin/${modelNameLower}.vue`);
    console.log(`📍 API: server/api/admin/${modelNameLower}`);
    console.log(`📍 Servis: server/services/${modelNameLower}.service.ts`);

  } catch (error) {
    console.error('\n❌ Bir hata oluştu:', error);
  } finally {
    rl.close();
  }
}

async function updatePrismaSchema(modelName: string, fields: Field[]) {
  const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
  let schema = await fs.readFile(schemaPath, 'utf-8');

  // Model zaten var mı kontrol et
  if (schema.includes(`model ${modelName}`)) {
    console.warn(`⚠️  ${modelName} modeli zaten şemada mevcut. Üzerine yazılmayacak.`);
    return;
  }

  let modelDefinition = `\nmodel ${modelName} {\n`;
  modelDefinition += `  id        String   @id @default(cuid())\n`;

  for (const field of fields) {
    let prismaType = field.type;
    if (field.type === 'LongText' || field.type === 'Slug') {
      prismaType = 'String';
    }
    
    let line = `  ${field.name}  ${prismaType}${field.isNullable || field.type === 'LongText' || field.type === 'Slug' ? '?' : ''}`;
    if (field.isUnique) line += ' @unique';
    modelDefinition += line + '\n';
  }

  modelDefinition += `  createdAt DateTime @default(now())\n`;
  modelDefinition += `  updatedAt DateTime @updatedAt\n`;
  modelDefinition += `\n  @@map("${modelName.toLowerCase()}")\n`;
  modelDefinition += `}\n`;

  await fs.appendFile(schemaPath, modelDefinition);
}

async function generateService(modelName: string, fields: Field[]) {
  const serviceDir = path.join(process.cwd(), 'server/services');
  const servicePath = path.join(serviceDir, `${modelName.toLowerCase()}.service.ts`);
  
  const content = `import { prisma } from '../utils/prisma';
import type { Prisma } from '@prisma/client';

export class ${modelName}Service {
  static async getAll() {
    return await (prisma as any).${modelName.toLowerCase()}.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getById(id: string) {
    return await (prisma as any).${modelName.toLowerCase()}.findUnique({
      where: { id }
    });
  }

  static async create(data: any) {
    const { id, createdAt, updatedAt, ...rest } = data;
    return await (prisma as any).${modelName.toLowerCase()}.create({
      data: rest
    });
  }

  static async update(id: string, data: any) {
    const { id: _, createdAt, updatedAt, ...rest } = data;
    return await (prisma as any).${modelName.toLowerCase()}.update({
      where: { id },
      data: rest
    });
  }

  static async delete(id: string) {
    return await (prisma as any).${modelName.toLowerCase()}.delete({
      where: { id }
    });
  }
}
`;

  await fs.writeFile(servicePath, content);
}

async function generateApiRoutes(modelName: string, fields: Field[]) {
  const apiBaseDir = path.join(process.cwd(), `server/api/admin/${modelName.toLowerCase()}`);
  await fs.mkdir(apiBaseDir, { recursive: true });

  // index.get.ts (List)
  await fs.writeFile(path.join(apiBaseDir, 'index.get.ts'), `import { ${modelName}Service } from '../../../services/${modelName.toLowerCase()}.service';
import { protect } from '../../../utils/protect';

export default defineEventHandler(async (event) => {
  await protect(event);
  return await ${modelName}Service.getAll();
});
`);

  // index.post.ts (Create)
  await fs.writeFile(path.join(apiBaseDir, 'index.post.ts'), `import { ${modelName}Service } from '../../../services/${modelName.toLowerCase()}.service';
import { protect } from '../../../utils/protect';

export default defineEventHandler(async (event) => {
  await protect(event);
  const body = await readBody(event);
  return await ${modelName}Service.create(body);
});
`);

  // [id].get.ts (Detail)
  await fs.writeFile(path.join(apiBaseDir, '[id].get.ts'), `import { ${modelName}Service } from '../../../services/${modelName.toLowerCase()}.service';
import { protect } from '../../../utils/protect';

export default defineEventHandler(async (event) => {
  await protect(event);
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID missing' });
  return await ${modelName}Service.getById(id);
});
`);

  // [id].put.ts (Update)
  await fs.writeFile(path.join(apiBaseDir, '[id].put.ts'), `import { ${modelName}Service } from '../../../services/${modelName.toLowerCase()}.service';
import { protect } from '../../../utils/protect';

export default defineEventHandler(async (event) => {
  await protect(event);
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  if (!id) throw createError({ statusCode: 400, message: 'ID missing' });
  return await ${modelName}Service.update(id, body);
});
`);

  // [id].delete.ts (Delete)
  await fs.writeFile(path.join(apiBaseDir, '[id].delete.ts'), `import { ${modelName}Service } from '../../../services/${modelName.toLowerCase()}.service';
import { protect } from '../../../utils/protect';

export default defineEventHandler(async (event) => {
  await protect(event);
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID missing' });
  return await ${modelName}Service.delete(id);
});
`);
}

async function generateNuxtPage(modelName: string, fields: Field[]) {
  const modelNameLower = modelName.toLowerCase();
  const pagePath = path.join(process.cwd(), `app/pages/admin/${modelNameLower}.vue`);

  const zodSchema = fields.map(f => {
    let line = `  ${f.name}: z.`;
    if (f.type === 'String' || f.type === 'LongText' || f.type === 'Slug') line += 'string()';
    else if (f.type === 'Int') line += 'number().int()';
    else if (f.type === 'Float') line += 'number()';
    else if (f.type === 'Boolean') line += 'boolean()';
    else if (f.type === 'DateTime') line += 'string()'; 
    else line += 'any()';

    if (f.isNullable || f.type === 'LongText' || f.type === 'Slug') line += '.optional().or(z.literal(\'\'))';
    else if (f.type === 'String') line += '.min(1, \'Bu alan gereklidir\')';
    
    return line;
  }).join(',\n');

  const hasLongText = fields.some(f => f.type === 'LongText');
  const slugFields = fields.filter(f => f.type === 'Slug' && f.slugSource);

  const formFields = fields.map(f => {
    if (f.type === 'LongText') {
      return `      <UFormField label="${f.label}" name="${f.name}">
        <template #help>
          <div class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <UIcon name="i-lucide-sparkles" class="w-3.5 h-3.5 text-primary-500" />
            <span>Zengin metin editörü aktif. / tuşu ile komutlara erişebilirsiniz.</span>
          </div>
        </template>
        <div 
          :class="[
            'border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-inner transition-all duration-300',
            isFullscreen ? 'fixed inset-0 z-[9999] bg-gray-900/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8' : 'relative'
          ]"
        >
          <UEditor
            v-slot="{ editor }"
            v-model="state.${f.name}"
            placeholder="${f.label} içeriğini buraya yazın..."
            content-type="html"
            :class="[
              'w-full transition-all duration-300',
              isFullscreen ? 'max-w-4xl h-[90vh] shadow-2xl rounded-2xl bg-white dark:bg-gray-950 overflow-hidden border border-gray-100 dark:border-gray-800' : 'min-h-[400px]'
            ]"
            :ui="{ base: isFullscreen ? 'p-12 sm:px-20 overflow-y-auto h-full' : 'p-6 sm:px-8' }"
          >
            <UEditorDragHandle :editor="editor" />
            <UEditorSuggestionMenu :editor="editor" :items="suggestionItems" />
            <UEditorToolbar :editor="editor" :items="toolbarItems" layout="bubble" />
            <UEditorToolbar 
               :editor="editor" 
               class="px-4 pt-4"
               :items="[...toolbarItems, [{
                icon: 'i-lucide-sparkles',
                label: 'AI Tamamla',
                color: 'primary',
                variant: 'subtle',
                tooltip: { text: 'Yapay zeka ile metni devam ettir' },
                onClick: () => handleAiComplete(editor),
                loading: isAiLoading
              }, {
                icon: isFullscreen ? 'i-lucide-minimize' : 'i-lucide-maximize',
                label: isFullscreen ? 'Küçült' : 'Tam Ekran',
                color: 'neutral',
                variant: 'ghost',
                tooltip: { text: isFullscreen ? 'Tam ekrandan çık' : 'Tam ekrana geç' },
                onClick: toggleFullscreen
              }]]" 
            />
          </UEditor>
        </div>
      </UFormField>`;
    }

    let component = 'UInput';
    let extraProps = '';
    
    if (f.type === 'Boolean') {
      component = 'UCheckbox';
    } else if (f.type === 'Int' || f.type === 'Float') {
      extraProps = ' type="number"';
    } else if (f.type === 'DateTime') {
      extraProps = ' type="datetime-local"';
    } else if (f.type === 'Slug') {
      extraProps = ' placeholder="Otomatik oluşturulur..."';
    }

    return `      <UFormField label="${f.label}" name="${f.name}"${f.type === 'Slug' ? ' help="Bu alan ' + f.slugSource + ' alanından otomatik üretilir."' : ''}>
        <${component} v-model="state.${f.name}"${extraProps} class="w-full shadow-sm" size="md" />
      </UFormField>`;
  }).join('\n\n');

  const tableColumns = fields
    .filter(f => f.inTable)
    .map(f => `  { accessorKey: '${f.name}', header: '${f.label}' }`)
    .join(',\n');

  const stateInit = fields.map(f => {
    let val = "''";
    if (f.type === 'Boolean') val = 'false';
    if (f.type === 'Int' || f.type === 'Float') val = '0';
    if (f.type === 'Json') val = "[] as any";
    if (f.type === 'LongText' || f.type === 'Slug') val = "'' as any";
    return `  ${f.name}: ${val}`;
  }).join(',\n');

  const watchBlocks = slugFields.map(f => `
// Watch ${f.slugSource} to auto-generate ${f.name}
watch(() => state.${f.slugSource}, (newVal) => {
  if (!isEditMode.value && newVal) {
    state.${f.name} = slugify(newVal)
  }
})`).join('\n');

  const content = `<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent, TableColumn, EditorToolbarItem, EditorSuggestionMenuItem } from '#ui/types'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// --- Slugify Helper ---
function slugify(text: string) {
  const trMap: Record<string, string> = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  }
  return text
    .toString()
    .toLowerCase()
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, (m) => trMap[m] ?? m)
    .replace(/\\s+/g, '-')
    .replace(/[^\\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

${hasLongText ? `
// --- Editor Configuration ---
const toolbarItems: EditorToolbarItem[][] = [
  [{
    icon: 'i-lucide-heading',
    tooltip: { text: 'Başlıklar' },
    content: { align: 'start' },
    items: [
      { kind: 'heading', level: 1, icon: 'i-lucide-heading-1', label: 'Başlık 1' },
      { kind: 'heading', level: 2, icon: 'i-lucide-heading-2', label: 'Başlık 2' },
      { kind: 'heading', level: 3, icon: 'i-lucide-heading-3', label: 'Başlık 3' }
    ]
  }],
  [{
    kind: 'mark',
    mark: 'bold',
    icon: 'i-lucide-bold',
    tooltip: { text: 'Kalın' }
  }, {
    kind: 'mark',
    mark: 'italic',
    icon: 'i-lucide-italic',
    tooltip: { text: 'İtalik' }
  }, {
    kind: 'mark',
    mark: 'underline',
    icon: 'i-lucide-underline',
    tooltip: { text: 'Altı Çizili' }
  }],
  [{
    kind: 'bulletList',
    icon: 'i-lucide-list',
    tooltip: { text: 'Madde İşaretli Liste' }
  }, {
    kind: 'orderedList',
    icon: 'i-lucide-list-ordered',
    tooltip: { text: 'Numaralı Liste' }
  }],
  [{
    kind: 'blockquote',
    icon: 'i-lucide-quote',
    tooltip: { text: 'Alıntı' }
  }, {
    kind: 'codeBlock',
    icon: 'i-lucide-code',
    tooltip: { text: 'Kod Bloğu' }
  }]
]

const suggestionItems: EditorSuggestionMenuItem[][] = [
  [{
    type: 'label',
    label: 'Metin Stilleri'
  }, {
    kind: 'paragraph',
    label: 'Paragraf',
    icon: 'i-lucide-type'
  }, {
    kind: 'heading',
    level: 1,
    label: 'Başlık 1',
    icon: 'i-lucide-heading-1'
  }, {
    kind: 'heading',
    level: 2,
    label: 'Başlık 2',
    icon: 'i-lucide-heading-2'
  }],
  [{
    type: 'label',
    label: 'Listeler'
  }, {
    kind: 'bulletList',
    label: 'Madde İşaretli Liste',
    icon: 'i-lucide-list'
  }, {
    kind: 'orderedList',
    label: 'Numaralı Liste',
    icon: 'i-lucide-list-ordered'
  }],
  [{
    type: 'label',
    label: 'Bloklar'
  }, {
    kind: 'blockquote',
    label: 'Alıntı',
    icon: 'i-lucide-quote'
  }, {
    kind: 'codeBlock',
    label: 'Kod Bloğu',
    icon: 'i-lucide-code'
  }, {
    kind: 'horizontalRule',
    label: 'Ayırıcı Çizgi',
    icon: 'i-lucide-separator-horizontal'
  }]
]

// --- AI Completion Stub ---
const isAiLoading = ref(false)
async function handleAiComplete(editor: any) {
  try {
    isAiLoading.value = true
    const { state } = editor
    const { selection } = state
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    editor.chain().focus().insertContent('... (AI tarafından tamamlanan içerik)').run()
  } finally {
    isAiLoading.value = false
  }
}

// --- Fullscreen Mode Logic ---
const isFullscreen = ref(false)
let isToggling = false
function toggleFullscreen() {
  if (isToggling) return
  isToggling = true
  isFullscreen.value = !isFullscreen.value
  document.body.style.overflow = isFullscreen.value ? 'hidden' : ''
  setTimeout(() => { isToggling = false }, 100)
}
` : ''}

interface ${modelName} {
  id: string
${fields.map(f => `  ${f.name}: ${f.type === 'String' || f.type === 'LongText' || f.type === 'Slug' ? 'string' : f.type === 'Boolean' ? 'boolean' : f.type === 'Int' || f.type === 'Float' ? 'number' : 'any'}${f.isNullable || f.type === 'LongText' || f.type === 'Slug' ? ' | null' : ''}`).join('\n')}
  createdAt: string
  updatedAt: string
}

const { data: listData, refresh, status } = await useFetch<${modelName}[]>('/api/admin/${modelNameLower}')

const isDrawerOpen = ref(false)
const isEditMode = ref(false)
const isSubmitting = ref(false)
const isLoading = computed(() => status.value === 'pending')

const state = reactive({
  id: '',
${stateInit}
})

${watchBlocks}

const schema = z.object({
${zodSchema}
})

type Schema = z.infer<typeof schema>

function openCreateDrawer() {
  isEditMode.value = false
  Object.assign(state, {
    id: '',
${fields.map(f => {
    return `    ${f.name}: ${f.type === 'Boolean' ? 'false' : f.type === 'Int' || f.type === 'Float' ? '0' : f.type === 'Json' ? '[]' : "''"}`;
  }).join(',\n')}
  })
  isDrawerOpen.value = true
}

function openEditDrawer(item: ${modelName}) {
  isEditMode.value = true
  Object.assign(state, {
    id: item.id,
${fields.map(f => {
    return `    ${f.name}: item.${f.name} ?? ${f.type === 'Boolean' ? 'false' : f.type === 'Int' || f.type === 'Float' ? '0' : f.type === 'Json' ? '[]' : "''"}`;
  }).join(',\n')}
  })
  isDrawerOpen.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    isSubmitting.value = true
    const url = isEditMode.value ? \`/api/admin/${modelNameLower}/\${state.id}\` : '/api/admin/${modelNameLower}'
    const method = isEditMode.value ? 'PUT' : 'POST'

    await $fetch(url, {
      method,
      body: event.data
    })

    useToast().add({
      title: isEditMode.value ? 'Güncellendi' : 'Oluşturuldu',
      color: 'success'
    })

    isDrawerOpen.value = false
    refresh()
  } catch (error: any) {
    useToast().add({
      title: 'Hata',
      description: error.data?.message || 'Bir hata oluştu',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

async function deleteItem(id: string) {
  if (!confirm('Bu öğeyi silmek istediğinizden emin misiniz?')) return

  try {
    await $fetch(\`/api/admin/${modelNameLower}/\${id}\`, { method: 'DELETE' })
    useToast().add({ title: 'Silindi', color: 'success' })
    refresh()
  } catch (error: any) {
    useToast().add({ title: 'Hata', color: 'error', description: error.data?.message })
  }
}

const items = computed<${modelName}[]>(() => ((listData.value ?? []) as unknown as ${modelName}[]))

const columns: TableColumn<${modelName}>[] = [
${tableColumns},
  { id: 'actions', header: 'İşlemler' }
]
</script>

<template>
  <UDashboardPanel grow>
    <template #header>
      <AdminNavbar>
        <template #leading>
          <h1 class="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">${modelName} Yönetimi</h1>
        </template>
        <template #trailing>
          <UButton 
            icon="i-lucide-plus" 
            label="Yeni Ekle" 
            color="primary" 
            class="font-bold rounded-xl" 
            @click="openCreateDrawer" 
          />
        </template>
      </AdminNavbar>
    </template>

    <template #body>
      <UCard class="shadow-sm border-none bg-white dark:bg-gray-900" :ui="{ body: 'p-0', header: 'border-b-0 px-6 py-4' }">
        <UTable
          :data="items"
          :columns="columns"
          :loading="isLoading"
          class="w-full"
        >
          <template #actions-cell="{ row }">
            <div class="flex gap-2">
              <UButton
                icon="i-lucide-pencil"
                size="xs"
                color="neutral"
                variant="ghost"
                @click="openEditDrawer(row.original)"
              />
              <UButton
                icon="i-lucide-trash"
                size="xs"
                color="error"
                variant="ghost"
                @click="deleteItem(row.original.id)"
              />
            </div>
          </template>
        </UTable>
      </UCard>
    </template>
  </UDashboardPanel>

  <ClientOnly>
    <USlideover 
      v-model:open="isDrawerOpen" 
      :title="isEditMode ? '${modelName} Düzenle' : 'Yeni ${modelName}'"
      :ui="{ content: 'max-w-[33vw] min-w-[33vw] w-full' }"
    >
      <template #content>
        <div class="p-0 overflow-y-auto max-h-screen bg-white dark:bg-gray-950">
          <UForm :schema="schema" :state="state" @submit="onSubmit" class="flex flex-col min-h-full">
            <div class="p-6 space-y-6 flex-1">
${formFields}
            </div>

            <div class="sticky bottom-0 p-4 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 z-10">
              <UButton
                label="İptal"
                color="neutral"
                variant="ghost"
                class="rounded-lg px-6"
                @click="isDrawerOpen = false"
              />
              <UButton
                type="submit"
                label="Kaydet"
                color="primary"
                class="font-bold rounded-lg px-8 shadow-md"
                :loading="isSubmitting"
              />
            </div>
          </UForm>
        </div>
      </template>
    </USlideover>
  </ClientOnly>
</template>
`;

  await fs.writeFile(pagePath, content);
}

main();
