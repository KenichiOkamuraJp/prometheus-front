import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

// データファイルのインポート
import { premisesData } from '@/assets/data/premises'
import { policiesData } from '@/assets/data/policies'

// データの初期化処理
const initializeData = (data) => {
  return {
    items: data.items.map(item => ({
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
  }
}

// Vuexストアの設定
const store = createStore({
  state: {
    premises: initializeData(premisesData),
    policies: initializeData(policiesData)
  },
  
  mutations: {
    // 前提の追加
    ADD_PREMISE(state, premise) {
      state.premises.items.push({
        ...premise,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    },
    
    // 前提の更新
    UPDATE_PREMISE(state, { id, updates }) {
      const index = state.premises.items.findIndex(item => item.id === id)
      if (index !== -1) {
        state.premises.items[index] = {
          ...state.premises.items[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
      }
    },
    
    // 前提の削除
    DELETE_PREMISE(state, id) {
      state.premises.items = state.premises.items.filter(item => item.id !== id)
    },
    
    // ポリシーの追加
    ADD_POLICY(state, policy) {
      state.policies.items.push({
        ...policy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    },
    
    // ポリシーの更新
    UPDATE_POLICY(state, { id, updates }) {
      const index = state.policies.items.findIndex(item => item.id === id)
      if (index !== -1) {
        state.policies.items[index] = {
          ...state.policies.items[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
      }
    },
    
    // ポリシーの削除
    DELETE_POLICY(state, id) {
      state.policies.items = state.policies.items.filter(item => item.id !== id)
    }
  },
  
  actions: {
    // 前提の追加
    addPremise({ commit }, premise) {
      commit('ADD_PREMISE', premise)
    },
    
    // 前提の更新
    updatePremise({ commit }, payload) {
      commit('UPDATE_PREMISE', payload)
    },
    
    // 前提の削除
    deletePremise({ commit }, id) {
      commit('DELETE_PREMISE', id)
    },
    
    // ポリシーの追加
    addPolicy({ commit }, policy) {
      commit('ADD_POLICY', policy)
    },
    
    // ポリシーの更新
    updatePolicy({ commit }, payload) {
      commit('UPDATE_POLICY', payload)
    },
    
    // ポリシーの削除
    deletePolicy({ commit }, id) {
      commit('DELETE_POLICY', id)
    }
  },
  
  getters: {
    // 全ての前提パターンを取得
    getAllPremisePatterns: state => state.premises.items,
    
    // カテゴリーで前提をフィルター
    getPremisePatternsByCategory: state => category => {
      return state.premises.items.filter(item => item.category === category)
    },
    
    // 全てのポリシーパターンを取得
    getAllPolicyPatterns: state => state.policies.items,
    
    // カテゴリーでポリシーをフィルター
    getPolicyPatternsByCategory: state => category => {
      return state.policies.items.filter(item => item.category === category)
    }
  },
  
  plugins: [
    createPersistedState({
      key: 'premise-policy-store',
      paths: ['premises', 'policies'],
      storage: window.localStorage,
      reducer: (state) => ({
        premises: state.premises,
        policies: state.policies
      })
    })
  ]
})

export default store