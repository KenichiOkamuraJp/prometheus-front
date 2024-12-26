<template>
  <div class="page-container">
    <div class="form-container">
      <header class="form-header">
        <div class="header-content">
          <div class="title-section">
            <h1>シミュレーション結果詳細</h1>
            <div class="header-subtitle">実行したシミュレーションの詳細な結果を確認できます。</div>
          </div>
          <div class="button-group">
            <button class="action-button" @click="downloadExcel">
              Excelをダウンロード
            </button>
            <button class="action-button" @click="goBack">
              一覧に戻る
            </button>
          </div>
        </div>
      </header>

      <div class="card">
        <div class="card-header">
          <div class="header-left">
            <h2>シミュレーション結果</h2>
          </div>
          <div class="header-right">
            <div v-if="summaryData" class="output-items">
              <!-- 感応度分析の場合 -->
              <template v-if="summaryData.function === 'sensitivity'">
                <div class="output-item">
                  <span class="output-label">出力項目1:</span>
                  <span class="output-value">{{ summaryData.selections?.output1 }}</span>
                </div>
                <div v-if="summaryData.selections?.output2 !== '第二項目なし'" class="output-item">
                  <span class="output-label">出力項目2:</span>
                  <span class="output-value">{{ summaryData.selections?.output2 }}</span>
                </div>
              </template>
              <!-- 複数シナリオの場合 -->
              <template v-else-if="summaryData.function === 'multiple'">
                <div class="output-item">
                  <span class="output-label">出力項目:</span>
                  <span class="output-value">{{ summaryData.selections?.output }}</span>
                </div>
              </template>
              <!-- 単一シナリオの場合 -->
              <template v-else>
                <div class="output-item">
                  <span class="output-label">出力項目1:</span>
                  <span class="output-value">{{ summaryData.selections?.output1 }}</span>
                </div>
                <div v-if="summaryData.selections?.output2 !== '第二項目なし'" class="output-item">
                  <span class="output-label">出力項目2:</span>
                  <span class="output-value">{{ summaryData.selections?.output2 }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>
        <div class="card-content">
          <line-chart
            v-if="chartData"
            :type="chartType"
            :data="chartData"
            :options="chartOptions"
            class="chart"
          />
          <div v-else class="loading-message">
            データを読み込んでいます...
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>シミュレーション設定内容</h2>
        </div>
        <div class="card-content">
          <div v-if="summaryData" class="summary-content">
            <!-- 感応度分析の場合 -->
            <div v-if="summaryData.function === 'sensitivity'" class="scenario-details">
              <div class="detail-section">
                <h3 class="section-title">基本情報</h3>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">人口パターン:</span>
                    <span class="detail-value">{{ summaryData.selections?.populationPattern }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">前提条件:</span>
                    <span class="detail-value">{{ summaryData.selections?.premisePattern }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">政策パターン:</span>
                    <span class="detail-value">{{ summaryData.selections?.policyPattern }}</span>
                  </div>
                </div>
              </div>
              <div class="detail-section">
                <h3 class="section-title">感応度分析設定</h3>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">分析対象パラメータ:</span>
                    <span class="detail-value">{{ summaryData.selections?.targetParameter }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">分析範囲:</span>
                    <span class="detail-value">{{ summaryData.selections?.range }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 複数シナリオの場合 -->
            <div v-else-if="summaryData.function === 'multiple'" class="scenario-details">
              <div class="detail-section">
                <h3 class="section-title">基本情報</h3>
                <div class="detail-item">
                  <span class="detail-label">出力項目:</span>
                  <span class="detail-value">{{ summaryData.selections?.output }}</span>
                </div>
              </div>
              
              <div class="detail-section">
                <h3 class="section-title">シナリオ設定</h3>
                <div class="scenarios-grid">
                  <div v-for="scenario in summaryData.selections?.scenarios" 
                       :key="scenario.scenarioNumber" 
                       class="scenario-card">
                    <div class="scenario-header">
                      シナリオ {{ scenario.scenarioNumber }}
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">人口パターン:</span>
                      <span class="detail-value">{{ scenario.populationPattern }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">前提条件:</span>
                      <span class="detail-value">{{ scenario.premisePattern }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">政策パターン:</span>
                      <span class="detail-value">{{ scenario.policyPattern }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 単一シナリオの場合 -->
            <div v-else class="scenario-details">
              <div class="detail-section">
                <h3 class="section-title">基本情報</h3>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">人口パターン:</span>
                    <span class="detail-value">{{ summaryData.selections?.populationPattern }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">前提条件:</span>
                    <span class="detail-value">{{ summaryData.selections?.premisePattern }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">政策パターン:</span>
                    <span class="detail-value">{{ summaryData.selections?.policyPattern }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default {
  name: 'ChartView',
  components: {
    'line-chart': Line
  },
  props: {
    jobName: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const chartType = ref(null)
    const chartData = ref(null)
    const chartOptions = ref(null)
    const summaryData = ref(null)

// データセットの設定を修正
const fetchData = async () => {
  try {
    let resultData

    // 結果データの取得
    const resultResponse = await fetch(
      `https://d18pux3zofd2wh.cloudfront.net/jobs/${props.jobName}/result.json`,
      { method: 'GET' }
    )

    if (resultResponse.ok) {
      resultData = await resultResponse.json()
    }

    // サマリーデータの取得
    const summaryResponse = await fetch(
      `https://d18pux3zofd2wh.cloudfront.net/jobs/${props.jobName}/summary.json`,
      { method: 'GET' }
    )
    const summaryDataResponse = await summaryResponse.json()

    // チャートデータの設定
    if (resultData?.data) {
      // データセットの設定を修正
      if (resultData.data.datasets?.length === 2) {
        resultData.data.datasets = resultData.data.datasets.map((dataset, index) => ({
          ...dataset,
          yAxisID: index === 0 ? 'y' : 'y2'
        }))
      }
      
      chartData.value = resultData.data
      
      const hasSecondOutput = summaryDataResponse.selections?.output2 && 
                             summaryDataResponse.selections.output2 !== '第二項目なし'

      // 感応度分析または単一シミュレーションの場合
      if (summaryDataResponse.function === 'sensitivity' || summaryDataResponse.function === 'single') {
        chartOptions.value = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: summaryDataResponse.function === 'sensitivity' 
                ? `感応度分析結果: ${summaryDataResponse.selections?.target_year || ''}年時点の${summaryDataResponse.selections?.targetParameter || ''}の影響`
                : 'シミュレーション結果'
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: summaryDataResponse.function === 'sensitivity' 
                  ? (summaryDataResponse.selections?.targetParameter || 'パラメータ値')
                  : '年度'
              }
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: summaryDataResponse.selections?.output1 || '出力値1'
              },
              beginAtZero: true
            },
            ...(hasSecondOutput && {
              y2: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: summaryDataResponse.selections?.output2
                },
                grid: {
                  drawOnChartArea: false
                },
                beginAtZero: true
              }
            })
          }
        }
      } else {
        // 複数シナリオの場合（変更なし）
        chartOptions.value = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'シナリオ比較結果'
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: '年度'
              }
            },
            y: {
              type: 'linear',
              display: true,
              beginAtZero: true,
              title: {
                display: true,
                text: summaryDataResponse.selections?.output || '出力値'
              }
            }
          }
        }
      }
    }

    summaryData.value = summaryDataResponse
  } catch (error) {
    console.error('データ取得エラー:', error)
  }
}
    const downloadExcel = async () => {
      try {
        const response = await fetch(
          `https://d18pux3zofd2wh.cloudfront.net/jobs/${props.jobName}/output.xlsx`,
          { method: 'GET' }
        )
        
        if (!response.ok) {
          throw new Error('ファイルのダウンロードに失敗しました')
        }
        
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'output.xlsx'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (error) {
        console.error('ダウンロードエラー:', error)
        alert('ファイルのダウンロードに失敗しました')
      }
    }

    const goBack = () => {
      window.history.back()
    }

    watch(() => props.jobName, (newVal) => {
      if (newVal) {
        fetchData()
      }
    }, { immediate: true })

    return {
      chartType,
      chartData,
      chartOptions,
      summaryData,
      downloadExcel,
      goBack
    }
  }
}
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.form-container {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-header {
  padding: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title-section {
  flex: 1;
}

.form-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #2d3748;
}

.header-subtitle {
  color: #718096;
  margin-top: 0.5rem;
}

.button-group {
  display: flex;
  gap: 1rem;
}

.action-button {
  background-color: #4299e1;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.action-button:hover {
  background-color: #3182ce;
}
  .card {
    margin: 1.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }

  .card-header {
    background-color: #f7fafc;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    border-radius: 8px 8px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-header h2 {
    margin: 0;
    font-size: 1.25rem;
    color: #2d3748;
  }

  .card-content {
    padding: 1.5rem;
  }

  .section-title {
    color: #2d3748;
    font-size: 1.1rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .detail-section {
    margin-bottom: 2rem;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
  }

  .detail-label {
    color: #718096;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }

  .detail-value {
    color: #2d3748;
    font-size: 1rem;
  }

  .scenarios-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
  }

  .scenario-card {
    background-color: #f7fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 1rem;
  }

  .scenario-header {
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .action-button {
    background-color: #4299e1;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background-color 0.2s;
  }

  .action-button:hover {
    background-color: #3182ce;
  }

  .button-group {
    display: flex;
    gap: 1rem;
  }

  .loading-message {
    text-align: center;
    color: #718096;
    padding: 2rem;
  }

  .chart {
    min-height: 400px;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .title-section {
    flex: 1;
  }

  .card-header {
    background-color: #f7fafc;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    border-radius: 8px 8px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-left {
    flex: 1;
  }

  .header-right {
    flex: 2;
    display: flex;
    justify-content: flex-end;
  }

  .output-items {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .output-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .output-label {
    color: #718096;
    font-size: 0.875rem;
    white-space: nowrap;
  }

  .output-value {
    color: #2d3748;
    font-size: 0.875rem;
    font-weight: 500;
  }

  /* レスポンシブ対応 */
  @media (max-width: 768px) {
    .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .header-right {
      width: 100%;
    }

    .output-items {
      width: 100%;
    }

    .output-item {
      width: 100%;
      justify-content: space-between;
    }
  }
</style>