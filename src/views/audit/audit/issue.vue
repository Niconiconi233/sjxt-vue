<template>
  <div class="audit-issue-detail">
    <h2>{{projectName}}</h2>
    <el-table :data="issueList" style="width: 100%; margin-top: 20px;" v-loading="loading">
      <el-table-column prop="issueType" label="问题定性" align="center" />
      <el-table-column prop="issueDescription" label="问题及描述" align="center">
        <template #default="scope">
          <el-tooltip class="item" effect="dark" :content="scope.row.issueDescription" placement="top">
            <span class="ellipsis-cell">{{ scope.row.issueDescription }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="issueStatus" label="整改状态" align="center" />
      <el-table-column prop="rectificationMeasure" label="整改措施" align="center">
        <template #default="scope">
          <el-tooltip class="item" effect="dark" :content="scope.row.rectificationMeasure" placement="top">
            <span class="ellipsis-cell">{{ scope.row.rectificationMeasure }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="rectificationResult" label="整改结果" align="center" />
      <el-table-column prop="issueCount" label="问题个数" align="center" />
      <el-table-column prop="issueNum" label="问题笔数" align="center" />
      <el-table-column prop="issueAmount" label="问题金额" align="center">
        <template #default="scope">
          <span>{{ Number(scope.row.issueAmount).toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="rectifiedIssueCount" label="整改问题个数" align="center" />
      <el-table-column prop="rectifiedIssueNum" label="整改问题笔数" align="center" />
      <el-table-column prop="rectifiedIssueAmount" label="整改问题金额" align="center">
        <template #default="scope">
          <span>{{ Number(scope.row.rectifiedIssueAmount).toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="整改资料" align="center">
        <template #default="scope">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <template v-if="scope.row.supportMaterials && scope.row.supportMaterials.length">
              <el-link
                v-for="(file, idx) in scope.row.supportMaterials"
                :key="idx"
                type="primary"
                @click="handleViewMaterial(file)"
                style="margin-right: 4px;"
              >
                {{ file.name }}
              </el-link>
            </template>
            <el-upload
                ref="upload"
                action=""
                :auto-upload="false"
                :multiple="true"
                :file-list="fileList"
                :on-change="handleChange"
                :http-request="customUpload"
              >
                <template #trigger>
                  <el-button type="success" size="small">选择文件</el-button>
                </template>
                <el-button type="primary" size="small" style="margin-left: 8px;" @click.stop="submitUpload(scope.$index)">提交上传</el-button>
              </el-upload>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row, scope.$index)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="fetchIssueList"
    />

    <!-- 编辑对话框 -->
    <el-dialog title="编辑问题明细" v-model="editDialogVisible" width="600px">
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="问题定性">
          <el-input v-model="editForm.issueType" :disabled="!canEdit" />
        </el-form-item>
        <el-form-item label="问题及描述">
          <el-input v-model="editForm.issueDescription" type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" :disabled="!canEdit" />
        </el-form-item>
        <el-form-item label="整改状态">
          <el-select v-model="editForm.issueStatus" placeholder="请选择整改状态">
            <el-option v-for="item in audit_status" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="整改措施">
          <el-input v-model="editForm.rectificationMeasure" type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" />
        </el-form-item>
        <el-form-item label="整改结果">
          <el-input v-model="editForm.rectificationResult" />
        </el-form-item>
        <el-form-item label="问题个数">
          <el-input-number v-model="editForm.issueCount" :min="0" :disabled="!canEdit" />
        </el-form-item>
        <el-form-item label="问题笔数">
          <el-input-number v-model="editForm.issueNum" :min="0" :disabled="!canEdit" />
        </el-form-item>
        <el-form-item label="问题金额">
          <el-input-number v-model="editForm.issueAmount" :min="0" :step="0.01" :disabled="!canEdit" />
        </el-form-item>
        <el-form-item label="整改问题个数">
          <el-input-number v-model="editForm.rectifiedIssueCount" :min="0" />
        </el-form-item>
        <el-form-item label="整改问题笔数">
          <el-input-number v-model="editForm.rectifiedIssueNum" :min="0" />
        </el-form-item>
        <el-form-item label="整改问题金额">
          <el-input-number v-model="editForm.rectifiedIssueAmount" :min="0" :step="0.01" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import useUserStore from '@/store/modules/user'
import { uploadAuditMaterials, getIssueList, updateIssue } from '@/api/audit/audit'
const route = useRoute()
const id = route.params.id
const projectName = route.query.projectName
const userStore = useUserStore()
const canEdit = userStore.permissions.includes('audit:audit:edit') || userStore.permissions.includes('*:*:*')
const { proxy } = getCurrentInstance()
const { audit_status } = proxy.useDict('audit_status')

const uploadHeaders = {
  // 如需 token 可解开注释
  // Authorization: 'Bearer ' + userStore.token
}

// 从API获取数据
const issueList = ref([])
const loading = ref(false)
const total = ref(0)

// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  mainId: id
})

// 获取问题列表数据
async function fetchIssueList() {
  loading.value = true
  try {
    const response = await getIssueList(queryParams.value.mainId)
    if (response.code === 200) {
      issueList.value = response.rows || []
      total.value = response.total || 0
    } else {
      proxy.$modal.msgError(response.msg || '获取问题列表失败')
    }
  } catch (error) {
    console.error('获取问题列表失败:', error)
    proxy.$modal.msgError('获取问题列表失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  if (id) {
    fetchIssueList()
  }
})

const editDialogVisible = ref(false)
const editForm = reactive({})
let editIndex = -1

function handleEdit(row, index) {
  Object.assign(editForm, row)
  editIndex = index
  editDialogVisible.value = true
}

async function saveEdit() {
  if (editIndex !== -1) {
    try {
      const response = await updateIssue(editForm)
      if (response.code === 200) {
        proxy.$modal.msgSuccess('保存成功')
        issueList.value[editIndex] = { ...editForm, supportMaterials: issueList.value[editIndex].supportMaterials }
        editDialogVisible.value = false
      } else {
        proxy.$modal.msgError(response.msg || '保存失败')
      }
    } catch (error) {
      console.error('保存失败:', error)
      proxy.$modal.msgError('保存失败')
    }
  }
}

function handleViewMaterial(file) {
  window.open(file.url, '_blank')
}

const fileList = ref([])
const tempFiles = ref([])

function handleChange(file, fileListArr) {
  tempFiles.value = fileListArr.map(item => item.raw)
}

async function submitUpload(rowIndex) {
  const formData = new FormData()
  tempFiles.value.forEach(file => {
    formData.append('files', file)
  })
  try {
    const response = await uploadAuditMaterials(formData)
    // 假设后端返回 [{fileName, url}, ...] 或 {data: [{fileName, url}, ...]}
    let fileList = []
    if (Array.isArray(response)) {
      fileList = response.map(item => ({ name: item.fileName, url: item.url }))
    } else if (response.data && Array.isArray(response.data)) {
      fileList = response.data.map(item => ({ name: item.fileName, url: item.url }))
    } else {
      fileList = tempFiles.value.map(file => ({ name: file.name, url: '' }))
    }
    // 假设 rowIndex 可用，否则请传入正确的行索引
    issueList.value[rowIndex].supportMaterials.push(...fileList)
    // 清空临时文件
    tempFiles.value = []
    fileList.value = []
    if (typeof window !== 'undefined' && window.ElMessage) {
      window.ElMessage.success('上传成功')
    }
  } catch (err) {
    if (typeof window !== 'undefined' && window.ElMessage) {
      window.ElMessage.error('文件上传失败')
    }
    console.error('上传失败:', err)
  }
}

function customUpload() {
  // 空实现，覆盖默认上传
}
</script>

<style scoped>
.audit-issue-detail {
  padding: 24px;
}
.ellipsis-cell {
  display: inline-block;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}
</style> 