            <!-- Form Editor -->
            <div
              v-else-if="selectedComponent.type === 'form'"
              class="space-y-4"
            >
              <PageBuilderFormComponent :component="selectedComponent" />
            </div>