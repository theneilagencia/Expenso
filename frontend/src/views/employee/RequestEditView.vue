<template>
  <DefaultLayout>
    <div class="request-edit">
      <div v-if="initialLoading" class="request-edit__loading">
        {{ t('common.loading') }}
      </div>

      <template v-else-if="currentRequest">
        <div class="request-edit__header">
          <router-link
            :to="{ name: 'request-detail', params: { id: props.id } }"
            class="request-edit__back-link"
          >
            {{ t('common.back') }}
          </router-link>
          <h2 class="request-edit__title">{{ t('requests.editRequest') }}</h2>
          <span
            class="request-edit__status"
            :class="`request-edit__status--${statusClass(currentRequest.status)}`"
          >
            {{ statusLabel(currentRequest.status) }}
          </span>
        </div>

        <div class="request-edit__content">
        <div class="request-edit__main">
        <form class="request-edit__form" @submit.prevent="handleSubmit">
          <!-- Basic Info -->
          <div class="request-edit__section">
            <h3 class="request-edit__section-title">{{ t('requests.stepBasicInfo') }}</h3>

            <div class="request-edit__field">
              <label class="request-edit__label" for="edit-title">
                {{ t('requests.requestTitle') }} *
              </label>
              <input
                id="edit-title"
                v-model="form.title"
                type="text"
                class="request-edit__input"
                :placeholder="t('requests.requestTitle')"
                required
              />
            </div>

            <div class="request-edit__field">
              <label class="request-edit__label" for="edit-description">
                {{ t('common.description') }} *
              </label>
              <textarea
                id="edit-description"
                v-model="form.description"
                class="request-edit__textarea"
                :placeholder="t('common.description')"
                rows="4"
                required
              />
            </div>

            <div class="request-edit__field-row">
              <div class="request-edit__field">
                <label class="request-edit__label" for="edit-category">
                  {{ t('requests.category') }} *
                </label>
                <select
                  id="edit-category"
                  v-model="form.category_id"
                  class="request-edit__select"
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

              <div class="request-edit__field">
                <label class="request-edit__label" for="edit-cost-center">
                  {{ t('requests.costCenter') }} *
                </label>
                <select
                  id="edit-cost-center"
                  v-model="form.cost_center_id"
                  class="request-edit__select"
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

            <div class="request-edit__field">
              <label class="request-edit__label" for="edit-urgency">
                {{ t('requests.urgencyLevel') }}
              </label>
              <select
                id="edit-urgency"
                v-model="form.urgency"
                class="request-edit__select"
              >
                <option value="low">{{ t('requests.urgencyLow') }}</option>
                <option value="medium">{{ t('requests.urgencyMedium') }}</option>
                <option value="high">{{ t('requests.urgencyHigh') }}</option>
                <option value="critical">{{ t('requests.urgencyCritical') }}</option>
              </select>
            </div>
          </div>

          <!-- Line Items -->
          <div class="request-edit__section">
            <h3 class="request-edit__section-title">{{ t('requests.stepItems') }}</h3>

            <div class="request-edit__items">
              <div
                v-for="(item, index) in form.items"
                :key="index"
                class="request-edit__item"
              >
                <div class="request-edit__item-header">
                  <span class="request-edit__item-number">{{ t('requests.item') }} {{ index + 1 }}</span>
                  <button
                    v-if="form.items.length > 1"
                    type="button"
                    class="request-edit__item-remove"
                    @click="removeItem(index)"
                  >
                    {{ t('common.delete') }}
                  </button>
                </div>

                <div class="request-edit__item-fields">
                  <div class="request-edit__field request-edit__field--flex">
                    <label class="request-edit__label">{{ t('common.description') }} *</label>
                    <input
                      v-model="item.description"
                      type="text"
                      class="request-edit__input"
                      :placeholder="t('requests.itemDescription')"
                      required
                    />
                  </div>

                  <div class="request-edit__field request-edit__field--small">
                    <label class="request-edit__label">{{ t('requests.quantity') }} *</label>
                    <input
                      v-model.number="item.quantity"
                      type="number"
                      min="1"
                      step="1"
                      class="request-edit__input"
                      required
                    />
                  </div>

                  <div class="request-edit__field request-edit__field--small">
                    <label class="request-edit__label">{{ t('requests.unitPrice') }} *</label>
                    <input
                      v-model.number="item.unit_price"
                      type="number"
                      min="0"
                      step="0.01"
                      class="request-edit__input"
                      required
                    />
                  </div>

                  <div class="request-edit__field request-edit__field--small">
                    <label class="request-edit__label">{{ t('requests.itemTotal') }}</label>
                    <span class="request-edit__item-total">
                      {{ formatCurrency(item.quantity * item.unit_price) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="request-edit__add-item"
              @click="addItem"
            >
              {{ t('requests.addItem') }}
            </button>

            <div class="request-edit__total-bar">
              <span class="request-edit__total-label">{{ t('requests.totalAmount') }}</span>
              <span class="request-edit__total-value">{{ formatCurrency(totalAmount) }}</span>
            </div>
          </div>

          <!-- Attachments -->
          <div class="request-edit__section">
            <h3 class="request-edit__section-title">{{ t('requests.attachments') }}</h3>

            <div v-if="currentRequest.attachments?.length" class="request-edit__existing-files">
              <div
                v-for="attachment in currentRequest.attachments"
                :key="attachment.id"
                class="request-edit__existing-file"
              >
                <span class="request-edit__file-name">{{ attachment.filename }}</span>
                <button
                  type="button"
                  class="request-edit__file-remove"
                  @click="removeExistingAttachment(attachment.id)"
                >
                  {{ t('common.delete') }}
                </button>
              </div>
            </div>

            <div class="request-edit__upload-area">
              <input
                ref="fileInput"
                type="file"
                class="request-edit__upload-hidden"
                multiple
                @change="handleFileSelect"
              />
              <button
                type="button"
                class="request-edit__upload-btn"
                @click="$refs.fileInput.click()"
              >
                {{ t('requests.selectFiles') }}
              </button>

              <div v-if="uploading" class="request-edit__upload-progress">
                <div
                  class="request-edit__upload-bar"
                  :style="{ width: progress + '%' }"
                />
              </div>

              <ul v-if="newFiles.length" class="request-edit__new-files">
                <li
                  v-for="(file, index) in newFiles"
                  :key="index"
                  class="request-edit__new-file"
                >
                  <span>{{ file.name }}</span>
                  <button
                    type="button"
                    class="request-edit__file-remove"
                    @click="removeNewFile(index)"
                  >
                    {{ t('common.delete') }}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <!-- Actions -->
          <div class="request-edit__actions">
            <router-link
              :to="{ name: 'request-detail', params: { id: props.id } }"
              class="request-edit__btn request-edit__btn--secondary"
            >
              {{ t('common.cancel') }}
            </router-link>
            <div class="request-edit__actions-right">
              <button
                type="button"
                class="request-edit__btn request-edit__btn--secondary"
                :disabled="loading"
                @click="saveDraft"
              >
                {{ t('requests.saveDraft') }}
              </button>
              <button
                type="submit"
                class="request-edit__btn request-edit__btn--primary"
                :disabled="loading"
              >
                {{ loading ? t('common.loading') : t('requests.submit') }}
              </button>
            </div>
          </div>
        </form>
        </div>

        <div class="request-edit__sidebar">
          <AIAssistantBox
            :messages="aiAssistantMessages"
            :is-assisting="isAssisting"
            @start="handleStartAssistance"
            @stop="handleStopAssistance"
          />
          <AIQualityMeter v-if="qualityScore > 0" :score="qualityScore" />
        </div>
        </div>
      </template>
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
import { REQUEST_STATUS } from '@/constants/status'
import { requestsService } from '@/services/requests'

const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  }
})

const { t } = useI18n()
const router = useRouter()
const {
  loading,
  currentRequest,
  fetchRequest,
  updateRequest,
  performAction
} = useRequest()
const { uploading, progress, upload, remove: removeAttachment } = useFileUpload()
const {
  qualityScore,
  assistantMessages: aiAssistantMessages,
  isAssisting,
  startAssistanceDraft,
  stopAssistance,
} = useAIAssistant()
const toast = useToast()

const initialLoading = ref(true)
const fileInput = ref(null)
const newFiles = ref([])

const categories = ref([])
const costCenters = ref([])

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

function statusLabel(status) {
  const map = {
    [REQUEST_STATUS.DRAFT]: t('requests.statusDraft'),
    [REQUEST_STATUS.IN_CORRECTION]: t('requests.statusInCorrection')
  }
  return map[status] || status
}

function statusClass(status) {
  const map = {
    [REQUEST_STATUS.DRAFT]: 'draft',
    [REQUEST_STATUS.IN_CORRECTION]: 'warning'
  }
  return map[status] || 'default'
}

function formatCurrency(value) {
  if (value == null) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

function populateForm(data) {
  form.title = data.title || ''
  form.description = data.description || ''
  form.category_id = data.category_id || data.category?.id || ''
  form.cost_center_id = data.cost_center_id || data.cost_center?.id || ''
  form.urgency = data.urgency || 'medium'
  form.items = data.items?.length
    ? data.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price
      }))
    : [{ description: '', quantity: 1, unit_price: 0 }]
}

function addItem() {
  form.items.push({ description: '', quantity: 1, unit_price: 0 })
}

function removeItem(index) {
  form.items.splice(index, 1)
}

function handleFileSelect(event) {
  const files = Array.from(event.target.files)
  newFiles.value.push(...files)
  event.target.value = ''
}

function removeNewFile(index) {
  newFiles.value.splice(index, 1)
}

async function removeExistingAttachment(attachmentId) {
  try {
    await removeAttachment(props.id, attachmentId)
    await fetchRequest(props.id)
    toast.success(t('common.success'))
  } catch {
    toast.error(t('common.error'))
  }
}

async function saveRequest(submitAfter = false) {
  try {
    const payload = {
      ...form,
      total_amount: totalAmount.value
    }

    await updateRequest(props.id, payload)

    // Upload new attachments
    for (const file of newFiles.value) {
      await upload(file, props.id)
    }

    if (submitAfter) {
      await performAction(props.id, 'submit')
      toast.success(t('requests.submitSuccess'))
    } else {
      toast.success(t('requests.draftSaved'))
    }

    router.push({ name: 'request-detail', params: { id: props.id } })
  } catch {
    toast.error(t('common.error'))
  }
}

function saveDraft() {
  saveRequest(false)
}

function handleSubmit() {
  saveRequest(true)
}

watch(
  () => ({ description: form.description, title: form.title, category_id: form.category_id }),
  (newVal) => {
    if ((newVal.description?.length > 10) || (newVal.title?.length > 10)) {
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

onMounted(async () => {
  try {
    const [data, cats, ccs] = await Promise.all([
      fetchRequest(props.id),
      requestsService.listCategories(),
      requestsService.listCostCenters()
    ])

    categories.value = cats
    costCenters.value = ccs

    // Redirect if request is not editable
    const editableStatuses = [REQUEST_STATUS.DRAFT, REQUEST_STATUS.IN_CORRECTION]
    if (!editableStatuses.includes(data.status)) {
      toast.warning(t('requests.cannotEdit'))
      router.replace({ name: 'request-detail', params: { id: props.id } })
      return
    }

    populateForm(data)
  } catch {
    toast.error(t('common.error'))
    router.replace({ name: 'requests' })
  } finally {
    initialLoading.value = false
  }
})
</script>

<style lang="scss" scoped>
.request-edit {
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

  &__loading {
    text-align: center;
    padding: $spacing-2xl;
    color: $gray-500;
    font-size: $font-size-base;
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    margin-bottom: $spacing-xl;
  }

  &__back-link {
    font-size: $font-size-sm;
    color: $primary;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: 600;
    color: $gray-900;
  }

  &__status {
    display: inline-block;
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: 500;
    width: fit-content;

    &--draft {
      background: $gray-100;
      color: $gray-700;
    }

    &--warning {
      background: #fff7ed;
      color: #9a3412;
    }

    &--default {
      background: $gray-100;
      color: $gray-600;
    }
  }

  &__form {
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
  }

  &__section {
    padding: $spacing-xl;
    border-bottom: 1px solid $gray-100;

    &:last-of-type {
      border-bottom: none;
    }
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

    .request-edit__field {
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

  &__existing-files {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    margin-bottom: $spacing-md;
  }

  &__existing-file {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-sm $spacing-md;
    background: $gray-50;
    border-radius: $radius-md;
  }

  &__file-name {
    font-size: $font-size-sm;
    color: $gray-700;
  }

  &__file-remove {
    padding: $spacing-xs $spacing-sm;
    background: transparent;
    color: $danger;
    border: none;
    font-size: $font-size-xs;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  &__upload-area {
    padding: $spacing-lg;
    border: 2px dashed $gray-300;
    border-radius: $radius-md;
    text-align: center;
  }

  &__upload-hidden {
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

  &__upload-progress {
    margin-top: $spacing-md;
    height: 4px;
    background: $gray-200;
    border-radius: $radius-full;
    overflow: hidden;
  }

  &__upload-bar {
    height: 100%;
    background: $primary;
    border-radius: $radius-full;
    transition: width 0.3s;
  }

  &__new-files {
    list-style: none;
    padding: 0;
    margin-top: $spacing-md;
    text-align: left;
  }

  &__new-file {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-sm $spacing-md;
    background: $gray-50;
    border-radius: $radius-sm;
    margin-bottom: $spacing-xs;
    font-size: $font-size-sm;
    color: $gray-700;
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
  }

  &__btn {
    padding: $spacing-sm $spacing-xl;
    border: none;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
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
