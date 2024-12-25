// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import SingleSimulation from '../views/SingleSimulation.vue'
import MultipleSimulation from '../views/MultipleSimulation.vue'
import InquiryView from '../views/InquiryView.vue'
import S3ChartSample from '../views/ChartView.vue'

const routes = [
  {
    path: '/',
    redirect: '/single'
  },
  {
    path: '/single',
    name: 'single',
    component: SingleSimulation,
    meta: {
      title: '単一条件シミュレーション'
    }
  },
  {
    path: '/multiple',
    name: 'multiple',
    component: MultipleSimulation,
    meta: {
      title: '複数条件シミュレーション'
    }
  },
  {
    path: '/inquiry',
    name: 'inquiry',
    component: InquiryView,
    meta: {
      title: '計算結果参照'
    }
  },
  {
    path: '/s3chart/:jobName',
    name: 'S3ChartSample',
    component: S3ChartSample,
    props: true,
    meta: {
      title: '計算結果詳細'
    }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// ナビゲーションガード
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'シミュレーションシステム'
  next()
})

export default router