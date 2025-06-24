<template>
  <div class="search-bg">
    <div class="search-container">
      <div class="logo">制度检索</div>
      <div class="search-box">
        <el-input
          v-model="keyword"
          placeholder="请输入要搜索的内容"
          class="search-input"
          size="large"
          @keyup.enter="handleSearch"
          clearable
        >
          <template #prepend>
            <el-select v-model="searchType" size="large" style="width: 120px;">
              <el-option label="制度名称" value="name" />
              <el-option label="制度内容" value="content" />
            </el-select>
          </template>
        </el-input>
        <el-button type="primary" size="large" class="search-btn" @click="handleSearch">搜索</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const keyword = ref('')
const searchType = ref('name')

function handleSearch() {
  if (!keyword.value) {
    ElMessage.warning('请输入搜索内容')
    return
  }
  // 这里可以添加实际的搜索逻辑
  ElMessage.success(`搜索类型：${searchType.value}，关键词：${keyword.value}`)
}
</script>

<style scoped>
.search-bg {
  min-height: 100vh;
  width: 100vw;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 0;
  background: url('@/assets/images/login-background.jpg') center center/cover no-repeat;
}
.search-bg::before {
  content: '';
  position: absolute;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.6);
  backdrop-filter: blur(2px);
  z-index: 1;
}
.search-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 2;
}
.logo {
  font-size: 40px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 40px;
  letter-spacing: 2px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.search-box {
  display: flex;
  align-items: center;
  width: 500px;
  max-width: 90vw;
}
.search-input {
  flex: 1;
}
.search-btn {
  margin-left: 16px;
}
@media (max-width: 600px) {
  .search-box {
    width: 90vw;
  }
  .logo {
    font-size: 28px;
  }
}
</style> 