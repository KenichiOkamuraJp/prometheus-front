<template>
    <div class="page-container">
      <div class="form-container">
        <header class="form-header">
          <h1>計算条件設定（複数シナリオによるシミュレーション）</h1>
          <div class="header-subtitle">複数のシナリオを設定し、パフォーマンスを比較することができます。</div>
        </header>
  
        <form @submit.prevent="submitJob" class="modern-form">
          <!-- Basic Settings Card -->
          <div class="card">
            <div class="card-header">
              <h2>基本設定</h2>
            </div>
            <div class="card-content config-card-content">
              <div class="config-row">
                <div class="config-item">
                  <label for="startYear" class="config-label">計算開始年（2020年固定）</label>
                  <input 
                    type="number" 
                    id="startYear" 
                    v-model.number="parameters.start_year" 
                    class="config-input"
                    min="2020" 
                    max="2020"
                    disabled
                  >
                </div>
                <div class="config-item">
                  <label for="endYear" class="config-label">計算終了年</label>
                  <input 
                    type="number" 
                    id="endYear" 
                    v-model.number="parameters.end_year" 
                    class="config-input"
                    min="2030" 
                    max="2070"
                  >
                </div>
              </div>
            </div>
          </div>
  
          <!-- Output Parameter Card -->
          <div class="card">
            <div class="card-header">
              <h2>出力項目設定</h2>
            </div>
            <div class="card-content config-card-content">
              <div class="config-row">
                <div class="config-item">
                  <label class="config-label">出力項目</label>
                  <select v-model="parameters.output" class="config-input">
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
          </div>
  
          <!-- Pattern Packages Card -->
          <div class="card">
            <div class="card-header">
              <h2>シミュレーションシナリオ設定</h2>
            </div>
            <div class="card-content config-card-content">
              <div v-for="(pkg, index) in parameters.packages" :key="index" class="settings-section">
                <div class="section-header">
                  <h3 class="section-title">シナリオ {{index + 1}}</h3>
                  <button 
                    v-if="parameters.packages.length > 1" 
                    type="button" 
                    @click="removePackage(index)" 
                    class="remove-button"
                  >
                    削除
                  </button>
                </div>
  
                <div class="config-row">
                  <div class="config-item">
                    <label class="config-label">人口推計パターン</label>
                    <select v-model="pkg.population" class="config-input">
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
  
                  <div class="config-item">
                    <label class="config-label">前提条件パターン</label>
                    <select v-model="pkg.premise" class="config-input">
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
  
                  <div class="config-item">
                    <label class="config-label">政策パターン</label>
                    <select v-model="pkg.policy" class="config-input">
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
  
                <div v-if="index < parameters.packages.length - 1" class="settings-divider"></div>
              </div>
  
              <div class="add-package-container">
                <button type="button" @click="addPackage" class="add-button">
                  シナリオを追加
                </button>
              </div>
            </div>
          </div>
  
          <!-- Submit Button -->
          <div class="submit-container">
            <button 
              type="submit" 
              :disabled="isSubmitting || !isValid" 
              class="submit-button"
              :class="{ 'loading': isSubmitting }"
            >
              <span class="button-text">{{ isSubmitting ? '送信中...' : '演算開始' }}</span>
              <span v-if="isSubmitting" class="spinner"></span>
            </button>
          </div>
        </form>
  
        <!-- Response Section -->
        <div v-if="response" class="response-card">
          <div class="card-header">
            <h2>Response</h2>
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
    name: 'BatchJobForm',
    
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
          // パラメータの準備
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
            })
          };
  
          // 統合されたLambda関数を呼び出し
          const apiUrl = 'https://5yc26exar3.execute-api.ap-northeast-1.amazonaws.com/default/kick_batch';
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `multiple_simulation_${timestamp}.json`;
          
          const requestBody = {
            filename: filename,
            contentType: 'application/json',
            simulationParams: parameterData,
            function: 'multiple'  // multiple simulation用の関数名を指定
          };
  
          const response = await axios.post(apiUrl, requestBody, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
  
          // レスポンスデータの処理
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
      }
    }
  };
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
  
  .form-header h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #2d3748;
  }
  
  .header-subtitle {
    color: #718096;
    margin-top: 0.5rem;
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
  }
  
  .card-header h2 {
    margin: 0;
    font-size: 1.25rem;
    color: #2d3748;
  }
  
  .card-content {
    padding: 1.5rem;
  }
  
  .config-row {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .config-item {
    flex: 1;
  }
  
  .config-label {
    display: block;
    margin-bottom: 0.5rem;
    color: #4a5568;
    font-size: 0.875rem;
  }
  
  .config-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 0.875rem;
  }
  
  .settings-section {
    margin-bottom: 1.5rem;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .section-title {
    font-size: 1rem;
    color: #2d3748;
    margin: 0;
  }
  
  .settings-divider {
    margin: 1.5rem 0;
    border-top: 1px solid #e2e8f0;
  }
  
  .submit-container {
    padding: 1.5rem;
    text-align: center;
  }
  
  .submit-button {
    background-color: #4299e1;
    color: white;
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .submit-button:hover {
    background-color: #3182ce;
  }
  
  .submit-button:disabled {
    background-color: #cbd5e0;
    cursor: not-allowed;
  }
  
  .add-button {
    background-color: #48bb78;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .add-button:hover {
    background-color: #38a169;
  }
  
  .remove-button {
    background-color: #f56565;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .remove-button:hover {
    background-color: #e53e3e;
  }
  
  .add-package-container {
    text-align: center;
    margin-top: 1rem;
  }
  
  .spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid #ffffff;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .response-card {
    margin: 1.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }
  
  .response-content {
    margin: 0;
    white-space: pre-wrap;
    font-family: monospace;
    font-size: 0.875rem;
  }
  
  @media (max-width: 768px) {
    .config-row {
      flex-direction: column;
      gap: 1rem;
    }
    
    .page-container {
      padding: 1rem;
    }
  }
  </style>