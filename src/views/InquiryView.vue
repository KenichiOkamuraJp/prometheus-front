<template>
  <div class="container">
    <div class="header-container">
      <h1>シミュレーション結果</h1>
      <button class="reload-button" @click="fetchJobs">リロード</button>
    </div>
    <table v-if="jobs.length > 0">
      <thead>
        <tr>
          <th>Job Name</th>
          <th>Status</th>
          <th>Created At</th>
          <th>Stopped At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="job in jobs" :key="job.job_name">
          <td>{{ job.job_name }}</td>
          <td :class="getStatusClass(job.status)">{{ job.status }}</td>
          <td>{{ formatDate(job.created_at) }}</td>
          <td>{{ formatDate(job.stopped_at) }}</td>
          <td>
            <button v-if="job.status === 'SUCCEEDED'" class="view-button" @click="fetchJobData(job.job_name)">View Details</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>過去シミュレーション確認中..</p>
    <S3ChartSample v-if="selectedJob" :jobName="selectedJob" />
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
        const response = await fetch('https://5yc26exar3.execute-api.ap-northeast-1.amazonaws.com/default/inquiry_batch');
        const data = await response.json();
        this.jobs = data.body.value;
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    },
    fetchJobData(jobName) {
      this.selectedJob = jobName;
      this.$router.push({
        name: 'S3ChartSample',
        params: { jobName: jobName }
      });
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
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
.container {
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

h1 {
  margin: 0;
  color: #333;
}

.reload-button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
}

.reload-button:hover {
  background-color: #218838;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

tr:hover {
  background-color: #f5f5f5;
}

.view-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
}

.view-button:hover {
  background-color: #0056b3;
}

.status-succeeded {
  color: green;
}

.status-failed {
  color: red;
}

.status-running {
  color: orange;
}
</style>