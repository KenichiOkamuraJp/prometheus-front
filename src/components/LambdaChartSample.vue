<template>
  <div>
    <h2>結果表示</h2>
    <Line 
      v-if="chartData" 
      :type="chartType"
      :data="chartData" 
      :options="chartOptions"
    />
  </div>
</template>
  
<script>
import { ref, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import { 
  Chart as ChartJS, 
  Title, 
  Tooltip, 
  Legend, 
  LineElement, 
  BarElement,
  LinearScale, 
  PointElement, 
  CategoryScale 
} from 'chart.js'
  
ChartJS.register(
  Title, 
  Tooltip, 
  Legend, 
  LineElement, 
  BarElement,
  LinearScale, 
  PointElement, 
  CategoryScale
)
  
export default {
  name: 'LambdaDataChart',
  components: { Line },
  setup() {
    const chartType = ref(null)
    const chartData = ref(null)
    const chartOptions = ref(null)
  
    const fetchLambdaData = async () => {
      try {
        // AWS SDK or fetch APIでLambdaからデータを取得
        const response = await fetch('https://gqgmhc7av2.execute-api.ap-northeast-1.amazonaws.com/test', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer YOUR_AUTH_TOKEN'
          }
        })
          
        const data = await response.json()
        console.log(data.body.type)
          
        // データをチャート用にフォーマット
        chartType.value = data.body.type
        chartData.value = data.body.data
        chartOptions.value = data.body.options

      } catch (error) {
        console.error('データ取得エラー:', error)
      }
    }
  
    onMounted(() => {
      fetchLambdaData()
    })
  
    return {
      chartType,
      chartData,
      chartOptions
    }
  }
}
</script>
  
<style scoped>
div {
  max-width: 800px;
  margin: 0 auto;
}
</style>