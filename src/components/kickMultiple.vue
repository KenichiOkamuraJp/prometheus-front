<template>
  <div class="page-container">
    <div class="form-container">
      <header class="form-header">
        <div class="title-section">
          <h1>計算条件設定（複数シナリオ）</h1>
          <div class="header-subtitle">複数のシナリオを設定し、パフォーマンスを比較することができます。</div>
        </div>
      </header>

      <form @submit.prevent="submitJob">
        <!-- 基本設定 -->
        <div class="card">
          <div class="card-header">
            <h2>基本設定</h2>
          </div>
          <div class="card-content">
            <div class="input-row">
              <div class="input-field">
                <label>計算開始年</label>
                <input 
                  type="number" 
                  v-model.number="parameters.start_year" 
                  disabled
                >
                <span class="field-note">2020年固定</span>
              </div>
              <div class="input-field">
                <label>計算終了年</label>
                <input 
                  type="number" 
                  v-model.number="parameters.end_year" 
                  min="2030" 
                  max="2070"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- 出力項目設定 -->
        <div class="card">
          <div class="card-header">
            <h2>出力項目設定</h2>
          </div>
          <div class="card-content">
            <div class="input-field">
              <label>出力項目</label>
              <select v-model="parameters.output">
                <option value="nominal_gdp">名目GDP</option>
                <option value="real_gdp">実質GDP</option>
                <option value="実質GDP成長率">実質GDP成長率</option>
                <option value="一人当たり実質GDP">一人当たり実質GDP</option>
                <option value="bond_gdp_ratio">累積債務名目GDP比</option>
                <option value="pension_current_deposit_total">年金積立金</option>
                <option value="医療・介護費GDP比">医療・介護費GDP比</option>
              </select>
            </div>
          </div>
        </div>

        <!-- シナリオ設定 -->
        <div class="card">
          <div class="card-header">
            <h2>シミュレーションシナリオ設定</h2>
          </div>
          <div class="card-content">
            <div v-for="(pkg, index) in parameters.packages" :key="index" class="scenario-block">
              <div class="scenario-header">
                <h3>シナリオ {{index + 1}}</h3>
                <button 
                  v-if="parameters.packages.length > 1" 
                  type="button" 
                  @click="removePackage(index)" 
                  class="remove-button"
                >
                  削除
                </button>
              </div>

              <div class="input-row">
                <div class="input-field">
                  <label>人口推計パターン</label>
                  <select v-model="pkg.population">
                    <option :value="0">死亡中位・出生中位</option>
                    <option :value="1">死亡中位・出生高位</option>
                    <option :value="2">死亡中位・出生低位</option>
                    <option :value="3">死亡高位・出生中位</option>
                    <option :value="4">死亡高位・出生高位</option>
                    <option :value="5">死亡高位・出生低位</option>
                    <option :value="6">死亡低位・出生中位</option>
                    <option :value="7">死亡低位・出生高位</option>
                    <option :value="8">死亡低位・出生低位</option>
                  </select>
                </div>

                <div class="input-field">
                  <label>前提条件パターン</label>
                  <select v-model="pkg.premise">
                    <option value="">パターンを選択してください</option>
                    <option 
                      v-for="pattern in availablePremisePatterns" 
                      :key="pattern.id"
                      :value="pattern.id"
                    >
                      {{ pattern.content }}
                    </option>
                  </select>
                </div>

                <div class="input-field">
                  <label>政策パターン</label>
                  <select v-model="pkg.policy">
                    <option value="">パターンを選択してください</option>
                    <option 
                      v-for="pattern in availablePolicyPatterns" 
                      :key="pattern.id"
                      :value="pattern.id"
                    >
                      {{ pattern.name }}
                    </option>
                  </select>
                </div>
              </div>
              
              <div v-if="index < parameters.packages.length - 1" class="scenario-divider"></div>
            </div>

            <div class="add-scenario">
              <button type="button" @click="addPackage" class="add-button">
                シナリオを追加
              </button>
            </div>
          </div>
        </div>

        <div class="action-container">
          <button 
            type="submit" 
            :disabled="isSubmitting || !isValid" 
            class="submit-button"
            :class="{ 'loading': isSubmitting }"
          >
            <span>{{ isSubmitting ? '送信中...' : '演算開始' }}</span>
            <span v-if="isSubmitting" class="spinner"></span>
          </button>
        </div>
      </form>

      <div v-if="response" class="card response-section">
        <div class="card-header">
          <h2>レスポンス</h2>
        </div>
        <div class="card-content">
          <pre class="response-content">{{ response }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';

export default {
  name: 'MultipleBatchJobForm',
  
  data() {
    return {
      isSubmitting: false,
      response: null,
      parameters: {
        start_year: 2020,
        end_year: 2070,
        'job-name': '',
        output: 'real_gdp',
        packages: [{
          population: 0,
          premise: '',
          policy: ''
        }]
      }
    };
  },

  computed: {
    ...mapGetters([
      'getAllPremisePatterns',
      'getAllPolicyPatterns'
    ]),
    
    availablePremisePatterns() {
      return this.getAllPremisePatterns || [];
    },
    
    availablePolicyPatterns() {
      return this.getAllPolicyPatterns || [];
    },

    isValid() {
      return this.parameters.packages.length > 0 &&
             this.parameters.packages.every(pkg => 
               pkg.population !== undefined &&
               pkg.premise !== '' &&
               pkg.policy !== ''
             );
    }
  },

  methods: {
    addPackage() {
      this.parameters.packages.push({
        population: 0,
        premise: '',
        policy: ''
      });
    },

    removePackage(index) {
      if (this.parameters.packages.length > 1) {
        this.parameters.packages.splice(index, 1);
      }
    },

    async submitJob() {
      this.isSubmitting = true;
      try {
        const packagesSummary = this.parameters.packages.map((pkg, index) => ({
          scenarioNumber: index + 1,
          populationPattern: this.getPopulationLabel(pkg.population),
          premisePattern: this.availablePremisePatterns.find(p => p.id === pkg.premise)?.content || '',
          policyPattern: this.availablePolicyPatterns.find(p => p.id === pkg.policy)?.name || ''
        }));

        const parameterData = {
          ...this.parameters,
          packages: this.parameters.packages.map(pkg => {
            const premisePattern = this.availablePremisePatterns.find(p => p.id === pkg.premise);
            const policyPattern = this.availablePolicyPatterns.find(p => p.id === pkg.policy);
            return {
              population: pkg.population,
              premise: premisePattern?.body || {},
              policy: policyPattern?.body || {}
            };
          }),
          selectionSummary: {
            output: this.getOutputLabel(this.parameters.output),
            scenarios: packagesSummary
          }
        };

        const apiUrl = 'https://5yc26exar3.execute-api.ap-northeast-1.amazonaws.com/default/kick_batch';
        const response = await axios.post(apiUrl, {
          simulationParams: parameterData,
          function: 'multiple'
        });

        this.response = typeof response.data === 'string' 
          ? JSON.parse(response.data) 
          : response.data;

      } catch (error) {
        console.error('Job submission error:', error);
        this.response = {
          error: true,
          message: `Error: ${error.message}`,
          details: error.response?.data
        };
      } finally {
        this.isSubmitting = false;
      }
    },

    getPopulationLabel(value) {
      const populationOptions = {
        0: '死亡中位・出生中位',
        1: '死亡中位・出生高位',
        2: '死亡中位・出生低位',
        3: '死亡高位・出生中位',
        4: '死亡高位・出生高位',
        5: '死亡高位・出生低位',
        6: '死亡低位・出生中位',
        7: '死亡低位・出生高位',
        8: '死亡低位・出生低位'
      };
      return populationOptions[value] || '';
    },

    getOutputLabel(value) {
      const outputOptions = {
        'nominal_gdp': '名目GDP',
        'real_gdp': '実質GDP',
        '実質GDP成長率': '実質GDP成長率',
        '一人当たり実質GDP': '一人当たり実質GDP',
        'bond_gdp_ratio': '累積債務名目GDP比',
        'pension_current_deposit_total': '年金積立金',
        '医療・介護費GDP比': '医療・介護費GDP比'
      };
      return outputOptions[value] || value;
    }
  }
};
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.form-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.title-section h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.header-subtitle {
  color: #666;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.card {
  margin: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.card-header {
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.card-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.card-content {
  padding: 1.25rem;
}

.input-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.25rem;
  margin-bottom: 0.5rem;
}

.input-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a5568;
}

.input-field input,
.input-field select {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #2d3748;
  background: white;
}

.input-field input:disabled {
  background: #f8fafc;
  color: #a0aec0;
}

.field-note {
  font-size: 0.75rem;
  color: #718096;
}

.scenario-block {
  margin-bottom: 1.5rem;
}

.scenario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.scenario-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.scenario-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 1.5rem 0;
}

.remove-button {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  color: white;
  background: #fc8181;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.remove-button:hover {
  background: #f56565;
}

.add-scenario {
  text-align: center;
  margin-top: 1rem;
}

.add-button {
  padding: 0.5rem 1rem;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.add-button:hover {
  background: #38a169;
}

.action-container {
  padding: 1.5rem;
  text-align: center;
  border-top: 1px solid #e2e8f0;
  margin-top: 1rem;
}

.submit-button {
  padding: 0.75rem 2rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s, opacity 0.2s;
}

.submit-button:hover:not(:disabled) {
  background: #3182ce;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-button.loading {
  background: #3182ce;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.response-section {
  margin-top: 2rem;
}

.response-content {
  font-family: monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  background: #f7fafc;
  padding: 1rem;
  border-radius: 4px;
  color: #2d3748;
}

@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .input-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .scenario-header {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  .action-container {
    padding: 1rem;
  }

  .submit-button {
    width: 100%;
    justify-content: center;
  }
} 
</style>