<template>
  <div class="search-bg">
    <div class="search-container" :style="searched ? 'justify-content: flex-start; padding-top: 60px;' : ''">
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
      <div v-if="results.length > 0" class="result-list">
        <div class="result-header">共找到 <span class="result-count">{{ results.length }}</span> 条相关制度</div>
        <el-card v-for="item in results" :key="item.id" class="result-card">
          <div class="regulation-title" v-html="item.regulationName"></div>
          <div class="regulation-link">
            <a :href="item.regulationUrl" target="_blank">查看原文</a>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { searchRegulations } from '@/api/regulation/regulations'

const keyword = ref('')
const searchType = ref('name')
const results = ref([])
const searched = ref(false)

function handleSearch() {
  if (!keyword.value) {
    ElMessage.warning('请输入搜索内容')
    return
  }
  searchRegulations(searchType.value, keyword.value).then(res => {
    if (res.code === 200) {
      results.value = res.data || []
      searched.value = true
      if (results.value.length === 0) {
        ElMessage.info('未找到相关内容')
      } else {
        ElMessage.success('搜索成功')
      }
    } else {
      ElMessage.error(res.msg || '搜索失败')
    }
  }).catch(() => {
    ElMessage.error('搜索失败')
  })
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
  transition: padding-top 0.3s;
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
  margin-bottom: 32px;
}
.search-input {
  flex: 1;
}
.search-btn {
  margin-left: 16px;
}
.result-list {
  width: 500px;
  max-width: 90vw;
  margin-top: 24px;
}
.result-header {
  font-size: 16px;
  color: #333;
  margin-bottom: 18px;
  font-weight: 500;
}
.result-count {
  color: #409eff;
  font-weight: bold;
}
.result-card {
  margin-bottom: 18px;
  border-radius: 12px;
  box-shadow: 0 4px 16px 0 rgba(64,158,255,0.10);
  transition: box-shadow 0.2s;
  border: none;
}
.result-card:hover {
  box-shadow: 0 8px 24px 0 rgba(64,158,255,0.18);
}
.regulation-title {
  font-size: 18px;
  font-weight: bold;
  color: #222;
  line-height: 1.6;
  margin-bottom: 8px;
}
.regulation-title em {
  background: #fffbe6;
  color: #f56c6c;
  font-style: normal;
  font-weight: bold;
  padding: 0 2px;
  border-radius: 2px;
}
.regulation-link {
  margin-top: 4px;
}
.regulation-link a {
  color: #409eff;
  text-decoration: underline;
  font-size: 15px;
  transition: color 0.2s;
}
.regulation-link a:hover {
  color: #66b1ff;
}
@media (max-width: 600px) {
  .search-box {
    width: 90vw;
  }
  .logo {
    font-size: 28px;
  }
  .result-list {
    width: 90vw;
  }
}
</style> 