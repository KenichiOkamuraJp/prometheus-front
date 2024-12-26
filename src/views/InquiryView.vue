<template>
  <div class="page-container">
    <div class="form-container">
      <header class="form-header">
        <div class="header-content">
          <div class="title-section">
            <h1>シミュレーション実行履歴</h1>
            <div class="header-subtitle">過去のシミュレーション結果を確認できます。</div>
          </div>
          <button class="action-button" @click="fetchJobs">
            <span class="button-text">更新</span>
          </button>
        </div>
      </header>

      <div class="card">
        <div class="card-header">
          <h2>実行履歴一覧</h2>
        </div>
        <div class="card-content">
          <div v-if="jobs.length > 0" class="table-container">
            <table>
              <thead>
                <tr>
                  <th>種別</th>
                  <th>実行内容</th>
                  <th>状態</th>
                  <th>実行日時</th>
                  <th>完了日時</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="job in jobs" :key="job.job_name">
                  <td class="type-cell">{{ job.simulation_type || '不明' }}</td>
                  <td class="details-cell">
                    <!-- 単一シナリオ -->
                    <div v-if="job.simulation_type === '単一シナリオ'" class="scenario-content">
                      <div class="scenario-params">
                        {{ job.settings?.populationPattern }}/{{ job.settings?.premisePattern }}/{{ job.settings?.policyPattern }}
                      </div>
                      <div class="output-info">
                        出力: {{ job.settings?.output1 }}{{ job.settings?.output2 !== '第二項目なし' ? `, ${job.settings?.output2}` : '' }}
                      </div>
                    </div>
                    
                    <!-- 複数シナリオ -->
                    <div v-else-if="job.simulation_type === '複数シナリオ比較'" class="scenario-content">
                      <div class="output-info">{{ job.settings?.output }}</div>
                      <div class="scenarios-grid">
                        <span v-for="scenario in job.settings?.scenarios" :key="scenario.scenarioNumber" class="scenario-chip">
                          S{{ scenario.scenarioNumber }}: {{ scenario.populationPattern }}/{{ scenario.premisePattern }}/{{ scenario.policyPattern }}
                        </span>
                      </div>
                    </div>

                    <!-- 感応度分析 -->
                    <div v-else-if="job.simulation_type === '感応度分析'" class="scenario-content">
                      <div class="scenario-params">
                        {{ job.settings?.populationPattern }}/{{ job.settings?.premisePattern }}/{{ job.settings?.policyPattern }}
                      </div>
                      <div class="sensitivity-info">
                        <div class="target-param">
                          分析対象: {{ job.settings?.targetParameter }}
                        </div>
                        <div class="range-info">
                          分析範囲: {{ job.settings?.range }}
                        </div>
                      </div>
                      <div class="output-info">
                        出力: {{ job.settings?.output1 }}{{ job.settings?.output2 && job.settings?.output2 !== '第二項目なし' ? `, ${job.settings.output2}` : '' }}
                      </div>
                    </div>
                  </td>
                  <td :class="['status-cell', getStatusClass(job.status)]">{{ job.status }}</td>
                  <td>{{ formatDate(job.created_at) }}</td>
                  <td>{{ formatDate(job.stopped_at) }}</td>
                  <td class="action-cell">
                    <div v-if="job.status === 'SUCCEEDED'" class="button-group">
                      <button class="view-button" @click="fetchJobData(job.job_name)">結果表示</button>
                      <button class="download-button" @click="downloadExcel(job.job_name)">Excel</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="loading-message">読み込んでいます..</div>
        </div>
      </div>
      
      <S3ChartSample v-if="selectedJob" :jobName="selectedJob" />
    </div>
  </div>
</template>

<script>
import S3ChartSample from './ChartView.vue';

export default {
  components: { S3ChartSample },
  
  data() {
    return {
      jobs: [],
      selectedJob: null,
    };
  },

  mounted() {
    this.fetchJobs();
  },

  methods: {
    async fetchJobs() {
      try {
        this.jobs = [];
        const response = await fetch('https://5yc26exar3.execute-api.ap-northeast-1.amazonaws.com/default/inquiry_batch');
        const data = await response.json();
      
        this.jobs = data.body.value.map(job => {
          const job_info = {
            'job_name': job.job_name,
            'status': job.status,
            'created_at': job.created_at,
            'stopped_at': job.stopped_at,
            'simulation_type': job.simulation_type || '不明',
            'settings': job.settings || {}
          };

          return job_info;
        });

      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    },
    // 他のメソッドは変更なし

    fetchJobData(jobName) {
      this.selectedJob = jobName;
      this.$router.push({
        name: 'S3ChartSample',
        params: { jobName: jobName }
      });
    },

    async downloadExcel(jobName) {
      try {
        const response = await fetch(
          `http://prometheus.polyarchy.net.s3-website-ap-northeast-1.amazonaws.com/jobs/${jobName}/output.xlsx`,
          { method: 'GET' }
        );
        if (!response.ok) throw new Error('ダウンロード失敗');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'output.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('ダウンロードエラー:', error);
        alert('ファイルのダウンロードに失敗しました');
      }
    },

    formatDate(dateString) {
      const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      };
      return new Date(dateString).toLocaleString(undefined, options);
    },

    getStatusClass(status) {
      return {
        'status-succeeded': status === 'SUCCEEDED',
        'status-failed': status === 'FAILED',
        'status-running': status === 'RUNNING',
      };
    }
  }
};
</script>

<style scoped>
  .page-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 1rem;
  }

  .form-header {
    margin-bottom: 1.5rem;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title-section h1 {
    font-size: 1.5rem;
    font-weight: bold;
    color: #2c3e50;
  }

  .header-subtitle {
    font-size: 0.875rem;
    color: #666;
    margin-top: 0.25rem;
  }

  .action-button {
    padding: 0.5rem 1rem;
    background-color: #4299e1;
    color: white;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .action-button:hover {
    background-color: #3182ce;
  }

  .card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .card-header {
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .card-header h2 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #2d3748;
  }

  .card-content {
    padding: 1rem;
  }

  .table-container {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  th {
    padding: 0.75rem 1rem;
    text-align: left;
    background-color: #f8fafc;
    color: #4a5568;
    font-weight: 500;
  }

  td {
    padding: 0.75rem 1rem;
    border-top: 1px solid #e2e8f0;
  }

  .type-cell {
    white-space: nowrap;
    color: #4a5568;
  }

  .details-cell {
    max-width: 400px;
  }

  .scenario-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .scenario-params {
    font-size: 0.875rem;
    color: #2d3748;
    font-weight: 500;
  }

  .sensitivity-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin: 0.25rem 0;
    padding: 0.5rem;
    background-color: #f8fafc;
    border-radius: 4px;
  }

  .target-param {
    font-size: 0.875rem;
    color: #4a5568;
    font-weight: 500;
  }

  .range-info {
    font-size: 0.75rem;
    color: #718096;
  }

  .output-info {
    font-size: 0.75rem;
    color: #666;
  }

  .scenarios-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-top: 0.25rem;
  }

  .scenario-chip {
    font-size: 0.75rem;
    background-color: #f1f5f9;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    color: #475569;
  }

  .status-cell {
    white-space: nowrap;
    font-weight: 500;
  }

  .status-succeeded {
    color: #059669;
  }

  .status-failed {
    color: #dc2626;
  }

  .status-running {
    color: #3b82f6;
  }

  .button-group {
    display: flex;
    gap: 0.5rem;
  }

  .view-button, 
  .download-button {
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .view-button {
    background-color: #e0f2fe;
    color: #0369a1;
  }

  .view-button:hover {
    background-color: #bae6fd;
  }

  .download-button {
    background-color: #f1f5f9;
    color: #475569;
  }

  .download-button:hover {
    background-color: #e2e8f0;
  }

  .loading-message {
    text-align: center;
    color: #666;
    padding: 2rem 0;
  }

  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
    
    .action-button {
      width: 100%;
    }
    
    .scenario-params {
      font-size: 0.75rem;
    }
    
    .button-group {
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .view-button, 
    .download-button {
      width: 100%;
    }

    th, 
    td {
      padding: 0.5rem;
    }

    .details-cell {
      max-width: 200px;
    }

    .sensitivity-info {
      padding: 0.375rem;
    }
  }
</style>