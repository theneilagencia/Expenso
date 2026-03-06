import { ref } from 'vue'
import { reportsService } from '@/services/reports'

export function useChartData() {
  const loading = ref(false)
  const error = ref(null)
  const categoryData = ref([])
  const monthlyData = ref([])
  const departmentData = ref([])
  const statusBreakdown = ref({})

  async function fetchChartData(params = {}) {
    loading.value = true
    error.value = null
    try {
      const [dashData, catData, deptData, monthData] = await Promise.all([
        reportsService.getDashboard(params),
        reportsService.getExpensesByCategory(params),
        reportsService.getExpensesByDepartment(params),
        reportsService.getExpensesByMonth(params),
      ])
      statusBreakdown.value = dashData?.status_breakdown || {}
      categoryData.value = catData?.items || catData || []
      departmentData.value = deptData?.items || deptData || []
      monthlyData.value = monthData?.items || monthData || []
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    categoryData,
    monthlyData,
    departmentData,
    statusBreakdown,
    fetchChartData,
  }
}
