<template>
  <DefaultLayout>
    <div class="request-new">
      <div class="request-new__header">
        <h2 class="request-new__title">{{ t('requests.new') }}</h2>
      </div>

      <div class="request-new__content">
      <div class="request-new__main">

      <div class="request-new__steps">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="request-new__step"
          :class="{
            'request-new__step--active': currentStep === index,
            'request-new__step--completed': currentStep > index
          }"
        >
          <span class="request-new__step-number">{{ index + 1 }}</span>
          <span class="request-new__step-label">{{ step }}</span>
        </div>
      </div>

      <form class="request-new__form" @submit.prevent="handleSubmit">
        <!-- Step 1: Basic Info -->
        <div v-show="currentStep === 0" class="request-new__section">
          <h3 class="request-new__section-title">{{ t('requests.stepBasicInfo') }}</h3>

          <div class="request-new__field">
            <label class="request-new__label" for="title">
              {{ t('requests.requestTitle') }} *
            </label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              class="request-new__input"
              :placeholder="t('requests.requestTitle')"
              required
            />
          </div>

          <div class="request-new__field">
            <label class="request-new__label" for="description">
              {{ t('common.description') }} *
            </label>
            <textarea
              id="description"
              v-model="form.description"
              class="request-new__textarea"
              :placeholder="t('common.description')"
              rows="4"
              required
            />
          </div>

          <div class="request-new__field-row">
            <div class="request-new__field">
              <label class="request-new__label" for="category">
                {{ t('requests.category') }} *
              </label>
              <select
                id="category"
                v-model="form.category_id"
                class="request-new__select"
                required
              >
                <option value="">{{ t('requests.selectCategory') }}</option>
                <option
                  v-for="cat in categories"
                  :key="cat.id"
                  :value="cat.id"
                >
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div class="request-new__field">
              <label class="request-new__label" for="cost_center">
                {{ t('requests.costCenter') }} *
              </label>
              <select
                id="cost_center"
                v-model="form.cost_center_id"
                class="request-new__select"
                required
              >
                <option value="">{{ t('requests.selectCostCenter') }}</option>
                <option
                  v-for="cc in costCenters"
                  :key="cc.id"
                  :value="cc.id"
                >
                  {{ cc.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="request-new__field">
            <label class="request-new__label" for="urgency">
              {{ t('requests.urgencyLevel') }}
            </label>
            <select
              id="urgency"
              v-model="form.urgency"
              class="request-new__select"
            >
              <option value="low">{{ t('requests.urgencyLow') }}</option>
              <option value="medium">{{ t('requests.urgencyMedium') }}</option>
              <option value="high">{{ t('requests.urgencyHigh') }}</option>
              <option value="critical">{{ t('requests.urgencyCritical') }}</option>
            </select>
          </div>
        </div>

        <!-- Step 2: Line Items -->
        <div v-show="currentStep === 1" class="request-new__section">
          <h3 class="request-new__section-title">{{ t('requests.stepItems') }}</h3>

          <div class="request-new__items">
            <div
              v-for="(item, index) in form.items"
              :key="index"
              class="request-new__item"
            >
              <div class="request-new__item-header">
                <span class="request-new__item-number">{{ t('requests.item') }} {{ index + 1 }}</span>
                <button
                  v-if="form.items.length > 1"
                  type="button"
                  class="request-new__item-remove"
                  @click="removeItem(index)"
                >
                  {{ t('common.delete') }}
                </button>
              </div>

              <div class="request-new__item-fields">
                <div class="request-new__field request-new__field--flex">
                  <label class="request-new__label">
                    {{ t('common.description') }} *
                  </label>
                  <input
                    v-model="item.description"
                    type="text"
                    class="request-new__input"
                    :placeholder="t('requests.itemDescription')"
                    required
                  />
                </div>

                <div class="request-new__field request-new__field--small">
                  <label class="request-new__label">
                    {{ t('requests.quantity') }} *
                  </label>
                  <input
                    v-model.number="item.quantity"
                    type="number"
                    min="1"
                    step="1"
                    class="request-new__input"
                    required
                  />
                </div>

                <div class="request-new__field request-new__field--small">
                  <label class="request-new__label">
                    {{ t('requests.unitPrice') }} *
                  </label>
                  <input
                    v-model.number="item.unit_price"
                    type="number"
                    min="0"
                    step="0.01"
                    class="request-new__input"
                    required
                  />
                </div>

                <div class="request-new__field request-new__field--small">
                  <label class="request-new__label">
                    {{ t('requests.itemTotal') }}
                  </label>
                  <span class="request-new__item-total">
                    {{ formatCurrency(item.quantity * item.unit_price) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="request-new__add-item"
            @click="addItem"
          >
            {{ t('requests.addItem') }}
          </button>

          <div class="request-new__total-bar">
            <span class="request-new__total-label">{{ t('requests.totalAmount') }}</span>
            <span class="request-new__total-value">{{ formatCurrency(totalAmount) }}</span>
          </div>
        </div>

        <!-- Step 3: Review & Submit -->
        <div v-show="currentStep === 2" class="request-new__section">
          <h3 class="request-new__section-title">{{ t('requests.stepReview') }}</h3>

          <div class="request-new__review">
            <div class="request-new__review-group">
              <h4 class="request-new__review-heading">{{ t('requests.stepBasicInfo') }}</h4>
              <div class="request-new__review-row">
                <span class="request-new__review-label">{{ t('requests.requestTitle') }}</span>
                <span class="request-new__review-value">{{ form.title }}</span>
              </div>
              <div class="request-new__review-row">
                <span class="request-new__review-label">{{ t('common.description') }}</span>
                <span class="request-new__review-value">{{ form.description }}</span>
              </div>
              <div class="request-new__review-row">
                <span class="request-new__review-label">{{ t('requests.category') }}</span>
                <span class="request-new__review-value">{{ selectedCategoryName }}</span>
              </div>
              <div class="request-new__review-row">
                <span class="request-new__review-label">{{ t('requests.costCenter') }}</span>
                <span class="request-new__review-value">{{ selectedCostCenterName }}</span>
              </div>
              <div class="request-new__review-row">
                <span class="request-new__review-label">{{ t('requests.urgencyLevel') }}</span>
                <span class="request-new__review-value">{{ form.urgency }}</span>
              </div>
            </div>

            <div class="request-new__review-group">
              <h4 class="request-new__review-heading">{{ t('requests.stepItems') }}</h4>
              <div
                v-for="(item, index) in form.items"
                :key="index"
                class="request-new__review-item"
              >
                <span>{{ item.description }}</span>
                <span>{{ item.quantity }} x {{ formatCurrency(item.unit_price) }}</span>
                <span class="request-new__review-item-total">
                  {{ formatCurrency(item.quantity * item.unit_price) }}
                </span>
              </div>
              <div class="request-new__review-total">
                <span>{{ t('requests.totalAmount') }}</span>
                <span>{{ formatCurrency(totalAmount) }}</span>
              </div>
            </div>

            <div class="request-new__review-group">
              <h4 class="request-new__review-heading">{{ t('requests.attachments') }}</h4>
              <div class="request-new__upload-area">
                <input
                  ref="fileInput"
                  type="file"
                  class="request-new__upload-input"
                  multiple
                  @change="handleFileSelect"
                />
                <button
                  type="button"
                  class="request-new__upload-btn"
                  @click="$refs.fileInput.click()"
                >
                  {{ t('requests.selectFiles') }}
                </button>
                <p class="request-new__upload-hint">{{ t('requests.attachmentHint') }}</p>

                <div v-if="uploading" class="request-new__upload-progress">
                  <div
                    class="request-new__upload-progress-bar"
                    :style="{ width: progress + '%' }"
                  />
                </div>

                <ul v-if="attachedFiles.length" class="request-new__file-list">
                  <li
                    v-for="(file, index) in attachedFiles"
                    :key="index"
                    class="request-new__file-item"
                  >
                    <span class="request-new__file-name">{{ file.name }}</span>
                    <button
                      type="button"
                      class="request-new__file-remove"
                      @click="removeFile(index)"
                    >
                      {{ t('common.delete') }}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="request-new__actions">
          <button
            v-if="currentStep > 0"
            type="button"
            class="request-new__btn request-new__btn--secondary"
            @click="prevStep"
          >
            {{ t('common.back') }}
          </button>
          <div class="request-new__actions-right">
            <button
              v-if="currentStep < 2"
              type="button"
              class="request-new__btn request-new__btn--primary"
              @click="nextStep"
            >
              {{ t('common.next') }}
            </button>
            <template v-else>
              <button
                type="button"
                class="request-new__btn request-new__btn--secondary"
                :disabled="loading"
                @click="saveDraft"
              >
                {{ t('requests.saveDraft') }}
              </button>
              <button
                type="submit"
                class="request-new__btn request-new__btn--primary"
                :disabled="loading"
              >
                {{ loading ? t('common.loading') : t('requests.submit') }}
              </button>
            </template>
          </div>
        </div>
      </form>
      </div>

      <div v-if="currentStep <= 1" class="request-new__sidebar">
        <AIAssistantBox
          :messages="aiAssistantMessages"
          :is-assisting="isAssisting"
          @start="handleStartAssistance"
          @stop="handleStopAssistance"
        />
        <AIQualityMeter v-if="qualityScore > 0" :score="qualityScore" />
      </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AIAssistantBox from '@/components/ai/AIAssistantBox.vue'
import AIQualityMeter from '@/components/ai/AIQualityMeter.vue'
import { useRequest } from '@/composables/useRequest'
import { useFileUpload } from '@/composables/useFileUpload'
import { useAIAssistant } from '@/composables/useAIAssistant'
import { useToast } from '@/composables/useToast'
import { requestsService } from '@/services/requests'

const { t } = useI18n()
const router = useRouter()
const { loading, createRequest } = useRequest()
const { uploading, progress, upload } = useFileUpload()
const {
  qualityScore,
  assistantMessages: aiAssistantMessages,
  isAssisting,
  startAssistanceDraft,
  stopAssistance,
} = useAIAssistant()
const toast = useToast()

const currentStep = ref(0)
const fileInput = ref(null)
const attachedFiles = ref([])

const steps = computed(() => [
  t('requests.stepBasicInfo'),
  t('requests.stepItems'),
  t('requests.stepReview')
])

const categories = ref([])
const costCenters = ref([])

onMounted(async () => {
  try {
    const [cats, ccs] = await Promise.all([
      requestsService.listCategories(),
      requestsService.listCostCenters()
    ])
    categories.value = cats
    costCenters.value = ccs
  } catch {
    toast.error(t('common.error'))
  }
})

const form = reactive({
  title: '',
  description: '',
  category_id: '',
  cost_center_id: '',
  urgency: 'medium',
  items: [{ description: '', quantity: 1, unit_price: 0 }]
})

const totalAmount = computed(() => {
  return form.items.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.unit_price || 0)
  }, 0)
})

const selectedCategoryName = computed(() => {
  return categories.value.find(c => c.id === form.category_id)?.name || '-'
})

const selectedCostCenterName = computed(() => {
  return costCenters.value.find(c => c.id === form.cost_center_id)?.name || '-'
})

watch(
  () => ({ description: form.description, justification: form.justification, category_id: form.category_id }),
  (newVal) => {
    if ((newVal.description?.length > 10) || (newVal.justification?.length > 10)) {
      startAssistanceDraft({ ...form, totalAmount: totalAmount.value })
    }
  },
  { deep: true }
)

function handleStartAssistance() {
  startAssistanceDraft({ ...form, totalAmount: totalAmount.value })
}

function handleStopAssistance() {
  stopAssistance()
}

function formatCurrency(value) {
  if (value == null) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

function addItem() {
  form.items.push({ description: '', quantity: 1, unit_price: 0 })
}

function removeItem(index) {
  form.items.splice(index, 1)
}

function handleFileSelect(event) {
  const files = Array.from(event.target.files)
  attachedFiles.value.push(...files)
  event.target.value = ''
}

function removeFile(index) {
  attachedFiles.value.splice(index, 1)
}

function nextStep() {
  if (currentStep.value < 2) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

async function submitRequest(asDraft = false) {
  try {
    const payload = {
      ...form,
      total_amount: totalAmount.value,
      status: asDraft ? 'DRAFT' : undefined
    }

    const created = await createRequest(payload)

    // Upload attachments if any
    for (const file of attachedFiles.value) {
      await upload(file, created.id)
    }

    toast.success(
      asDraft
        ? t('requests.draftSaved')
        : t('requests.submitSuccess')
    )
    router.push({ name: 'request-detail', params: { id: created.id } })
  } catch (err) {
    toast.error(t('common.error'))
  }
}

function saveDraft() {
  submitRequest(true)
}

function handleSubmit() {
  submitRequest(false)
}
</script>

<style lang="scss" scoped>
.request-new {
  max-width: 1200px;
  margin: 0 auto;

  &__content {
    display: flex;
    gap: $spacing-lg;
  }

  &__main {
    flex: 1;
    min-width: 0;
    max-width: 900px;
  }

  &__sidebar {
    width: 320px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    position: sticky;
    top: $spacing-lg;
    align-self: flex-start;
  }

  &__header {
    margin-bottom: $spacing-xl;
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: 600;
    color: $gray-900;
  }

  &__steps {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-xl;
    padding: $spacing-lg;
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius-lg;
  }

  &__step {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    flex: 1;
    padding: $spacing-sm $spacing-md;
    border-radius: $radius-md;
    transition: all 0.2s;

    &--active {
      background: $primary-light;

      .request-new__step-number {
        background: $primary;
        color: $white;
      }

      .request-new__step-label {
        color: $primary-dark;
        font-weight: 600;
      }
    }

    &--completed {
      .request-new__step-number {
        background: $success;
        color: $white;
      }

      .request-new__step-label {
        color: $success;
      }
    }
  }

  &__step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: $radius-full;
    background: $gray-200;
    color: $gray-600;
    font-size: $font-size-sm;
    font-weight: 600;
    flex-shrink: 0;
  }

  &__step-label {
    font-size: $font-size-sm;
    color: $gray-500;
    white-space: nowrap;
  }

  &__form {
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
  }

  &__section {
    padding: $spacing-xl;
  }

  &__section-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $gray-800;
    margin-bottom: $spacing-lg;
    padding-bottom: $spacing-sm;
    border-bottom: 1px solid $gray-100;
  }

  &__field {
    margin-bottom: $spacing-lg;

    &--flex {
      flex: 1;
    }

    &--small {
      width: 140px;
      flex-shrink: 0;
    }
  }

  &__field-row {
    display: flex;
    gap: $spacing-lg;

    .request-new__field {
      flex: 1;
    }
  }

  &__label {
    display: block;
    margin-bottom: $spacing-xs;
    font-size: $font-size-sm;
    font-weight: 500;
    color: $gray-700;
  }

  &__input,
  &__select,
  &__textarea {
    width: 100%;
    padding: $spacing-sm $spacing-md;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    font-size: $font-size-base;
    color: $gray-800;
    background: $white;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: $primary;
      box-shadow: 0 0 0 3px $primary-light;
    }
  }

  &__textarea {
    resize: vertical;
    min-height: 100px;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
  }

  &__item {
    padding: $spacing-lg;
    border: 1px solid $gray-200;
    border-radius: $radius-md;
    background: $gray-50;
  }

  &__item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-md;
  }

  &__item-number {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $gray-700;
  }

  &__item-remove {
    padding: $spacing-xs $spacing-sm;
    background: transparent;
    color: $danger;
    border: 1px solid $danger;
    border-radius: $radius-sm;
    font-size: $font-size-xs;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: $danger;
      color: $white;
    }
  }

  &__item-fields {
    display: flex;
    gap: $spacing-md;
    align-items: flex-end;
  }

  &__item-total {
    display: block;
    padding: $spacing-sm $spacing-md;
    font-weight: 600;
    font-size: $font-size-base;
    color: $gray-800;
    font-variant-numeric: tabular-nums;
  }

  &__add-item {
    display: block;
    width: 100%;
    padding: $spacing-sm;
    background: transparent;
    color: $primary;
    border: 2px dashed $gray-300;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: $spacing-lg;

    &:hover {
      border-color: $primary;
      background: $primary-light;
    }
  }

  &__total-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md $spacing-lg;
    background: $gray-800;
    border-radius: $radius-md;
    color: $white;
  }

  &__total-label {
    font-size: $font-size-base;
    font-weight: 500;
  }

  &__total-value {
    font-size: $font-size-xl;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  &__review {
    display: flex;
    flex-direction: column;
    gap: $spacing-xl;
  }

  &__review-group {
    padding-bottom: $spacing-lg;
    border-bottom: 1px solid $gray-100;

    &:last-child {
      border-bottom: none;
    }
  }

  &__review-heading {
    font-size: $font-size-base;
    font-weight: 600;
    color: $gray-700;
    margin-bottom: $spacing-md;
  }

  &__review-row {
    display: flex;
    justify-content: space-between;
    padding: $spacing-sm 0;
    border-bottom: 1px solid $gray-50;

    &:last-child {
      border-bottom: none;
    }
  }

  &__review-label {
    font-size: $font-size-sm;
    color: $gray-500;
  }

  &__review-value {
    font-size: $font-size-sm;
    color: $gray-800;
    font-weight: 500;
    text-align: right;
    max-width: 60%;
  }

  &__review-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-sm 0;
    font-size: $font-size-sm;
    color: $gray-700;
    gap: $spacing-md;
  }

  &__review-item-total {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  &__review-total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md 0;
    margin-top: $spacing-sm;
    border-top: 2px solid $gray-200;
    font-weight: 700;
    font-size: $font-size-base;
    color: $gray-900;
  }

  &__upload-area {
    padding: $spacing-lg;
    border: 2px dashed $gray-300;
    border-radius: $radius-md;
    text-align: center;
  }

  &__upload-input {
    display: none;
  }

  &__upload-btn {
    padding: $spacing-sm $spacing-lg;
    background: $white;
    color: $primary;
    border: 1px solid $primary;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: $primary;
      color: $white;
    }
  }

  &__upload-hint {
    margin-top: $spacing-sm;
    font-size: $font-size-xs;
    color: $gray-500;
  }

  &__upload-progress {
    margin-top: $spacing-md;
    height: 4px;
    background: $gray-200;
    border-radius: $radius-full;
    overflow: hidden;
  }

  &__upload-progress-bar {
    height: 100%;
    background: $primary;
    border-radius: $radius-full;
    transition: width 0.3s;
  }

  &__file-list {
    list-style: none;
    padding: 0;
    margin-top: $spacing-md;
    text-align: left;
  }

  &__file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-sm $spacing-md;
    background: $gray-50;
    border-radius: $radius-sm;
    margin-bottom: $spacing-xs;
  }

  &__file-name {
    font-size: $font-size-sm;
    color: $gray-700;
  }

  &__file-remove {
    padding: $spacing-xs;
    background: transparent;
    color: $danger;
    border: none;
    font-size: $font-size-xs;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-lg $spacing-xl;
    border-top: 1px solid $gray-200;
    background: $gray-50;
    border-radius: 0 0 $radius-lg $radius-lg;
  }

  &__actions-right {
    display: flex;
    gap: $spacing-md;
    margin-left: auto;
  }

  &__btn {
    padding: $spacing-sm $spacing-xl;
    border: none;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &--primary {
      background: $primary;
      color: $white;

      &:hover:not(:disabled) {
        background: $primary-dark;
      }
    }

    &--secondary {
      background: $white;
      color: $gray-700;
      border: 1px solid $gray-300;

      &:hover:not(:disabled) {
        background: $gray-50;
      }
    }
  }
}
</style>
