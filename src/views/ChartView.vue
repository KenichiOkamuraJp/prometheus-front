<template>
  <div class="chart-container">
    <div class="header-container">
      <h2>結果表示</h2>
      <button class="back-button" @click="goBack">一覧に戻る</button>
    </div>
    <Line 
      v-if="chartData"
      :type="chartType"
      :data="chartData"
      :options="chartOptions"
    />
    <p v-else class="loading-message">データを読み込んでいます...</p>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import { Line } from 'vue-chartjs';
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
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  LinearScale,
  PointElement,
  CategoryScale
);

export default {
  name: 'S3ChartSample',
  components: { Line },
  props: {
    jobName: {
      type: String,
      required: true,
    }
  },
  setup(props) {
    const chartType = ref(null);
    const chartData = ref(null);
    const chartOptions = ref(null);

    const fetchLambdaData = async () => {
      try {
        const response = await fetch(`http://prometheus.polyarchy.net.s3-website-ap-northeast-1.amazonaws.com/${props.jobName}`, {
          method: 'GET',
        });
        // Nanを回避 : サーバサイドで対応したので一旦コメントアウト
        /*
        const text = await response.text();
        const sanitizedText = text.replace('NaN,', 'null,');
        const data = JSON.parse(sanitizedText, (key, value) => {
          if (value === "NaN") return null;
          return value;
        });
        */
        const data = await response.json();
        // データをチャート用にフォーマット
        chartType.value = data.type;
        chartData.value = data.data;
        chartOptions.value = data.options;
      } catch (error) {
        console.error('データ取得エラー:', error);
      }
    };

    const goBack = () => {
      window.history.back();
    };

    watch(() => props.jobName, (newVal) => {
      if (newVal) {
        fetchLambdaData();
      }
    }, { immediate: true });

    return {
      chartType,
      chartData,
      chartOptions,
      goBack
    };
  }
};
</script>

<style scoped>
.chart-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: #fefefe;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h2 {
  margin: 0;
  color: #333;
}

.back-button {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: #5a6268;
}

.loading-message {
  text-align: center;
  color: #666;
}
</style>