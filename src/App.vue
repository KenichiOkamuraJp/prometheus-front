<template>
  <div id="app">
    <nav>
      <router-link to="/single">単一条件シミュレーション</router-link> |
      <router-link to="/multiple">複数条件シミュレーション</router-link> |
      <router-link to="/sensitivity">感応度分析</router-link> |
      <router-link to="/inquiry">結果参照</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

nav {
  padding: 30px;
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  padding: 10px 20px;
  margin: 0 5px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

nav a:hover {
  background-color: #e9ecef;
}

nav a.router-link-active {
  color: #42b983;
  background-color: #e9ecef;
}
</style>