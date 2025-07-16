<template>
  <div class="audit-issue-detail">
    <h2>审计项目ID: {{ id }}</h2>
    <el-table :data="issueList" style="width: 100%; margin-top: 20px;">
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
              :show-file-list="false"
              :before-upload="file => handleUploadMaterial(file, scope.$index)"
            >
              <el-button type="success" size="mini">上传</el-button>
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

    <!-- 编辑对话框 -->
    <el-dialog title="编辑问题明细" v-model="editDialogVisible" width="600px">
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="问题定性">
          <el-input v-model="editForm.issueType" />
        </el-form-item>
        <el-form-item label="问题及描述">
          <el-input v-model="editForm.issueDescription" type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" />
        </el-form-item>
        <el-form-item label="整改状态">
          <el-input v-model="editForm.issueStatus" />
        </el-form-item>
        <el-form-item label="整改措施">
          <el-input v-model="editForm.rectificationMeasure" type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" />
        </el-form-item>
        <el-form-item label="整改结果">
          <el-input v-model="editForm.rectificationResult" />
        </el-form-item>
        <el-form-item label="问题个数">
          <el-input-number v-model="editForm.issueCount" :min="0" />
        </el-form-item>
        <el-form-item label="问题笔数">
          <el-input-number v-model="editForm.issueNum" :min="0" />
        </el-form-item>
        <el-form-item label="问题金额">
          <el-input-number v-model="editForm.issueAmount" :min="0" :step="0.01" />
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
import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const id = route.params.id

// 模拟数据，supportMaterials为数组
const issueList = ref([
  {
    issueType: '财务问题',
    issueDescription: '账目不清，缺少凭证',
    issueStatus: '未整改',
    rectificationMeasure: '补充凭证',
    rectificationResult: '待整改',
    issueCount: 2,
    issueNum: 2,
    issueAmount: 10000.00,
    rectifiedIssueCount: 0,
    rectifiedIssueNum: 0,
    rectifiedIssueAmount: 0.00,
    supportMaterials: []
  },
  {
    issueType: '合规问题',
    issueDescription: '合同未备案，内容较长内容较长内容较长内容较长内容较长内容较长内容较长内容较长内容较长内容较长内容较长内容较长内容较长',
    issueStatus: '已整改',
    rectificationMeasure: '补办备案，内容较长内容较长内容较长内容较长内容较长内容较长内容较长内容较长内容较长内容较长',
    rectificationResult: '已完成',
    issueCount: 1,
    issueNum: 1,
    issueAmount: 5000.00,
    rectifiedIssueCount: 1,
    rectifiedIssueNum: 1,
    rectifiedIssueAmount: 5000.00,
    supportMaterials: [
      { name: '备案文件.pdf', url: 'http://example.com/备案文件.pdf' },
      { name: '补充材料.docx', url: 'http://example.com/补充材料.docx' }
    ]
  }
])

const editDialogVisible = ref(false)
const editForm = reactive({})
let editIndex = -1

function handleEdit(row, index) {
  Object.assign(editForm, row)
  editIndex = index
  editDialogVisible.value = true
}

function saveEdit() {
  if (editIndex !== -1) {
    issueList.value[editIndex] = { ...editForm, supportMaterials: issueList.value[editIndex].supportMaterials }
    editDialogVisible.value = false
  }
}

function handleViewMaterial(file) {
  window.open(file.url, '_blank')
}

function handleUploadMaterial(file, rowIndex) {
  const url = URL.createObjectURL(file)
  issueList.value[rowIndex].supportMaterials.push({ name: file.name, url })
  return false
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