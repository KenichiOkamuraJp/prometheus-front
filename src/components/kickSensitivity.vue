<template>
    <div class="page-container">
      <div class="form-container">
        <header class="form-header">
          <div class="title-section">
            <h1>計算条件設定（感応度分析）</h1>
            <div class="header-subtitle">特定のパラメータの変化が結果に与える影響を分析します。</div>
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
              <div class="input-row">
                <div class="input-field">
                  <label>第一項目（縦軸）</label>
                  <select v-model="parameters.output1">
                    <option value="nominal_gdp">名目GDP</option>
                    <option value="real_gdp">実質GDP</option>
                    <option value="実質GDP成長率">実質GDP成長率</option>
                    <option value="一人当たり実質GDP">一人当たり実質GDP</option>
                    <option value="bond_gdp_ratio">累積債務名目GDP比</option>
                    <option value="pension_current_deposit_total">年金積立金</option>
                    <option value="医療・介護費GDP比">医療・介護費GDP比</option>
                  </select>
                </div>
                <div class="input-field">
                  <label>第二項目（オプション）</label>
                  <select v-model="parameters.output2">
                    <option value="no_value">第二項目なし</option>
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
  
          <!-- シミュレーション設定 -->
          <div class="card">
            <div class="card-header">
              <h2>シミュレーション基本設定</h2>
            </div>
            <div class="card-content">
              <div class="input-field">
                <label>人口推計パターン</label>
                <select v-model="parameters.population">
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
                <select v-model="parameters.selectedPremisePattern">
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
                <select v-model="parameters.selectedPolicyPattern">
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
          </div>
  
          <!-- 感応度分析設定 -->
          <div class="card">
            <div class="card-header">
              <h2>感応度分析設定</h2>
            </div>
            <div class="card-content">
              <div class="input-field">
                <label>分析対象カテゴリ</label>
                <select v-model="parameters.target_param.category">
                  <option value="">カテゴリを選択してください</option>
                  <option value="macroeconomics.supply">マクロ経済（供給）</option>
                  <option value="macroeconomics.price">マクロ経済（物価）</option>
                  <option value="macroeconomics.national_income">マクロ経済（家計）</option>
                  <option value="socialsecurity.medicare">医療</option>
                  <option value="government.national.spending">財政</option>
                </select>
              </div>
  
              <div class="input-field">
                <label>分析対象パラメータ</label>
                <select 
                  v-model="parameters.target_param.parameter_code"
                  :disabled="!parameters.target_param.category"
                >
                  <option value="">パラメータを選択してください</option>
                  <option 
                    v-for="param in availableParameters" 
                    :key="param.code"
                    :value="param.code"
                  >
                    {{ param.name }}
                  </option>
                </select>
              </div>
  
              <div class="range-settings">
                <div class="input-field">
                  <label>最小値</label>
                  <input 
                    type="number" 
                    v-model.number="parameters.min_value" 
                    step="0.01"
                  >
                </div>
                <div class="input-field">
                  <label>最大値</label>
                  <input 
                    type="number" 
                    v-model.number="parameters.max_value" 
                    step="0.01"
                  >
                </div>
                <div class="input-field">
                  <label>刻み幅</label>
                  <input 
                    type="number" 
                    v-model.number="parameters.step_value" 
                    step="0.01"
                    min="0.01"
                  >
                </div>
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
    name: 'SensitivityAnalysisForm',
    
    data() {
      return {
        isSubmitting: false,
        response: null,
        parameters: {
          start_year: 2020,
          end_year: 2070,
          'job-name': '',
          output1: 'real_gdp',
          output2: 'no_value',
          population: 0,
          selectedPremisePattern: '',
          selectedPolicyPattern: '',
          target_param: {
            category: '',
            parameter_code: ''
          },
          min_value: 0,
          max_value: 1,
          step_value: 0.1
        },
        parameterOptions: {
          'macroeconomics.supply': [
            { code: 'tfp_start', name: 'TFP成長率：標準＝0.3' },
            { code: 'inside_investment_ratio', name: '国内投資性向：標準＝0.5' }
          ],
          'macroeconomics.price': [
            { code: 'inflation_target', name: 'インフレターゲット：標準＝0' },
          ],
          'macroeconomics.national_income': [
            { code: 'target_of_worker_distribution_rate', name: '労働分配率目標：標準＝0.75' },
          ],
          'socialsecurity.medicare': [
            { code: 'cost_growth_margin', name: '医療コスト上昇率：標準＝1.01' },
          ],
          'government.national.spending': [
            { code: 'sensitivity_of_growth', name: '予算伸び率（物価に対する感応度）：標準＝0.8' },
          ]
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
  
      availableParameters() {
        return this.parameters.target_param.category 
          ? this.parameterOptions[this.parameters.target_param.category] || []
          : [];
      },
  
      isValid() {
        return (
          this.parameters.target_param.category &&
          this.parameters.target_param.parameter_code &&
          this.parameters.min_value < this.parameters.max_value &&
          this.parameters.step_value > 0 &&
          this.parameters.selectedPremisePattern &&
          this.parameters.selectedPolicyPattern
        );
      }
    },
  
    methods: {
      async submitJob() {
        this.isSubmitting = true;
        try {

          const parameterData = {
            ...this.parameters,
            premise: this.getPatternBody(
              this.parameters.selectedPremisePattern, 
              this.availablePremisePatterns
            ),
            policy: this.getPatternBody(
              this.parameters.selectedPolicyPattern, 
              this.availablePolicyPatterns
            ),
            selectionSummary: {
              populationPattern: this.getPopulationLabel(this.parameters.population),
              premisePattern: this.availablePremisePatterns.find(
                p => p.id === this.parameters.selectedPremisePattern
              )?.content || '',
              policyPattern: this.availablePolicyPatterns.find(
                p => p.id === this.parameters.selectedPolicyPattern
              )?.name || '',
              targetParameter: this.getParameterLabel(),
              range: `${this.parameters.min_value} ～ ${this.parameters.max_value} (刻み幅: ${this.parameters.step_value})`,
              output1: this.getOutputLabel(this.parameters.output1),
              output2: this.parameters.output2 !== 'no_value' ? this.getOutputLabel(this.parameters.output2) : '第二項目なし'
            }
          };
  
          const apiUrl = 'https://5yc26exar3.execute-api.ap-northeast-1.amazonaws.com/default/kick_batch';
          const response = await axios.post(apiUrl, {
            simulationParams: parameterData,
            function: 'sensitivity'
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
  
      getPatternBody(id, patterns) {
        const pattern = patterns.find(p => p.id === id);
        return pattern?.body || {};
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
      },
  
      getParameterLabel() {
        const category = this.parameters.target_param.category;
        const code = this.parameters.target_param.parameter_code;
        const param = this.parameterOptions[category]?.find(p => p.code === code);
        return param ? param.name : '';
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
    margin-bottom: 1rem;
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

  .range-settings {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 4px;
  }

  .range-settings .input-field {
    margin-bottom: 0;
  }

  .range-settings input {
    text-align: right;
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

    .range-settings {
      grid-template-columns: 1fr;
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