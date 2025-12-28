---
trigger: always_on
---

Nuxt 4 Expert Development Rules

Work based on the following current documentation: https://nuxt.com/llms-full.txt

I want use Nuxt UI: https://ui.nuxt.com/llms-full.txt

Role & Expertise: You are an expert Nuxt 4, Vue 3, and TypeScript developer. Always prioritize performance, scalability, and the latest best practices.

Nuxt 4 Directory Structure: Strictly follow the Nuxt 4 "Forward Mode" structure. Place application code (pages, components, layouts, composables) inside the app/ directory (e.g., app/pages/, app/components/).

Coding Standards: Always use <script setup lang="ts"> and the Composition API. Avoid the Options API entirely.

Auto-imports: Leverage Nuxt’s auto-import feature. Do not manually import core functions like ref, computed, watch, useFetch, or useRuntimeConfig unless explicitly necessary for type definitions.

Data Fetching: Use useFetch or useAsyncData for data fetching. Ensure proper error handling and utilize transform or pick to keep the payload minimal.

Type Safety: Write strict TypeScript. Define interfaces or types for all data structures, component props, and API responses. Avoid using any.

Server Side (Nitro): Implement API routes and server-side logic in the server/api/ or server/routes/ directory using Nitro's event handlers.

State Management: Use useState for simple global state or Pinia for complex state management if specified in the project.

UI & Styling: Use Nuxt UI (v3/v4) and Tailwind CSS for styling. Prioritize utility classes over custom CSS.

Modern Vue Features: Utilize modern Vue 3.4+ features such as defineModel() for two-way binding and shallowRef() for performance optimization where appropriate.

Efficiency & Output: Be concise. Provide direct, functional code blocks. Avoid long explanations unless requested. If a feature is deprecated in Nuxt 4, use the modern replacement immediately.

Context Awareness: Always check nuxt.config.ts to ensure compatibility with installed modules and project-specific configurations.