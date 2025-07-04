<template>
  <div class="app-container">
    <el-row class="mb8" style="display: flex; align-items: center;">
      <el-col :span="16" style="display: flex; align-items: center;">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch"
          label-width="90px"
          style="display: flex; align-items: center; margin-bottom: 0; gap: 0 8px;">
          <el-form-item label="主键ID" prop="id" style="margin-bottom: 0; align-items: center;">
            <el-input
              v-model="queryParams.id"
              placeholder="请输入主键ID"
              clearable
              @keyup.enter="handleQuery"
              style="height: 32px;"
            />
          </el-form-item>
          <el-form-item label="项目名称" prop="projectName" style="margin-bottom: 0; align-items: center;">
            <el-input
              v-model="queryParams.projectName"
              placeholder="请输入审计项目名称"
              clearable
              @keyup.enter="handleQuery"
              style="height: 32px;"
            />
          </el-form-item>
          <el-form-item style="margin-bottom: 0; align-items: center;">
            <el-button type="primary" icon="Search" @click="handleQuery" style="height: 32px;">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery" style="height: 32px;">重置</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="8" style="display: flex; align-items: center; justify-content: flex-end;">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['audit:audit:add']"
          style="height: 32px;"
        >新增</el-button>
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['audit:audit:edit']"
          style="height: 32px;"
        >修改</el-button>
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['audit:audit:remove']"
          style="height: 32px;"
        >删除</el-button>
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['audit:audit:export']"
          style="height: 32px;"
        >导出</el-button>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" style="margin-left: 16px;"></right-toolbar>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="auditList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="项目名称" align="center" prop="projectName" />
      <el-table-column label="整改时限" align="center" prop="rectificationDeadline" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.rectificationDeadline, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="整改机构" align="center" prop="rectificationOrgName" />
      <el-table-column label="问题个数" align="center" prop="issueCount" />
      <el-table-column label="问题笔数" align="center" prop="issueNum" />
      <el-table-column label="问题金额" align="center">
        <template #default="scope">
          <span>{{ Number(scope.row.issueAmount).toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="整改问题个数" align="center" prop="rectifiedIssueCount" />
      <el-table-column label="整改问题笔数" align="center" prop="rectifiedIssueNum" />
      <el-table-column label="整改问题金额" align="center">
        <template #default="scope">
          <span>{{ Number(scope.row.rectifiedIssueAmount).toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['audit:audit:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['audit:audit:remove']">删除</el-button>
          <el-button link type="success" icon="Plus" @click="handleImportDialogOpen" v-hasPermi="['audit:audit:add']">添加</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改审计问题管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="auditRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="form.projectName" placeholder="请输入审计项目名称" />
        </el-form-item>
        <el-form-item label="整改时限" prop="rectificationDeadline">
          <el-date-picker clearable
            v-model="form.rectificationDeadline"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择整体整改时限">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="整改机构" prop="rectificationOrgName">
          <el-select v-model="form.rectificationOrgName" placeholder="请选择整改机构" @change="handleOrgChange">
            <el-option 
              v-for="dept in deptList" 
              :key="dept.deptId" 
              :label="dept.deptName" 
              :value="dept.deptName" 
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新增：导入问题明细弹窗 -->
    <el-dialog title="批量导入问题明细" v-model="importDialogOpen" width="400px" append-to-body>
      <div style="margin-bottom: 16px; color: #666; font-size: 14px;">
        您可以下载模板，填写问题明细后通过EXCEL文件批量导入。
      </div>
      <div style="margin-bottom: 8px; display: flex; gap: 8px;">
        <el-button type="primary" icon="Download" @click="downloadTemplate">下载模板</el-button>
        <FileUpload
          :action="'/audit/audit/import'"
          :fileType="['xls','xlsx']"
          :limit="1"
          :fileSize="10"
          :isShowTip="false"
          @update:modelValue="handleImportFileChange"
        >
          <template #trigger>
            <el-button type="primary" icon="Upload">选取文件</el-button>
          </template>
        </FileUpload>
      </div>
      <div style="margin-bottom: 16px; color: #909399; font-size: 13px;">
        请上传 <b style='color: #f56c6c'>大小不超过 10MB</b> 格式为 <b style='color: #f56c6c'>xls/xlsx</b> 的文件
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importDialogOpen = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Audit">
import { listAudit, getAudit, delAudit, addAudit, updateAudit, getDeptList } from "@/api/audit/audit"
import useUserStore from '@/store/modules/user'
import FileUpload from '@/components/FileUpload/index.vue'

const { proxy } = getCurrentInstance()
const userStore = useUserStore()

const auditList = ref([])
const auditIssueList = ref([])
const deptList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const checkedAuditIssue = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const importDialogOpen = ref(false)

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    id: null,
    projectName: null,
    rectificationOrgId: null,
  },
  rules: {
    projectName: [
      { required: true, message: "审计项目名称不能为空", trigger: "blur" }
    ],
    rectificationOrgId: [
      { required: true, message: "整改机构ID不能为空", trigger: "change" }
    ],
    rectificationOrgName: [
      { required: true, message: "整改机构名字不能为空", trigger: "blur" }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 获取部门列表 */
function getDeptListData() {
  getDeptList(100).then(response => {
    deptList.value = response.data
  })
}

/** 机构选择变化处理 */
function handleOrgChange(value) {
  const selectedDept = deptList.value.find(dept => dept.deptName === value)
  if (selectedDept) {
    form.value.rectificationOrgId = selectedDept.deptId
  }
}

/** 查询审计问题管理列表 */
function getList() {
  loading.value = true
  listAudit(queryParams.value).then(response => {
    auditList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    projectName: null,
    inputBy: null,
    inputDate: null,
    rectificationDeadline: null,
    createdBy: null,
    updatedBy: null,
    createdAt: null,
    updatedAt: null,
    isDeleted: null,
    rectificationOrgId: null,
    rectificationOrgName: null,
    issueCount: 0,
    issueNum: 0,
    issueAmount: 0.0,
    rectifiedIssueCount: 0,
    rectifiedIssueNum: 0,
    rectifiedIssueAmount: 0.0
  }
  auditIssueList.value = []
  proxy.resetForm("auditRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  form.value.inputBy = userStore.name
  open.value = true
  title.value = "添加审计项目"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getAudit(_id).then(response => {
    form.value = response.data
    auditIssueList.value = response.data.auditIssueList
    open.value = true
    title.value = "修改审计问题管理"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["auditRef"].validate(valid => {
    if (valid) {
      form.value.auditIssueList = auditIssueList.value
      if (form.value.id != null) {
        updateAudit(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addAudit(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除审计问题管理编号为"' + _ids + '"的数据项？').then(function() {
    return delAudit(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 审计问题子序号 */
function rowAuditIssueIndex({ row, rowIndex }) {
  row.index = rowIndex + 1
}

/** 审计问题子添加按钮操作 */
function handleAddAuditIssue() {
  let obj = {}
  obj.issueType = ""
  obj.issueDescription = ""
  obj.issueStatus = ""
  obj.dueDate = ""
  obj.rectificationMeasure = ""
  obj.rectificationResult = ""
  obj.supportMaterials = ""
  auditIssueList.value.push(obj)
}

/** 审计问题子删除按钮操作 */
function handleDeleteAuditIssue() {
  if (checkedAuditIssue.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的审计问题子数据")
  } else {
    const auditIssues = auditIssueList.value
    const checkedAuditIssues = checkedAuditIssue.value
    auditIssueList.value = auditIssues.filter(function(item) {
      return checkedAuditIssues.indexOf(item.index) == -1
    })
  }
}

/** 复选框选中数据 */
function handleAuditIssueSelectionChange(selection) {
  checkedAuditIssue.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('audit/audit/export', {
    ...queryParams.value
  }, `audit_${new Date().getTime()}.xlsx`)
}

function handleImportDialogOpen() {
  importDialogOpen.value = true
}

function downloadTemplate() {
  proxy.download('/audit/audit/template', {}, '问题明细导入模板.xlsx')
}

function handleImportFileChange(val) {
  // 上传成功后可在此处理返回内容
  proxy.$modal.msgSuccess('上传成功')
  importDialogOpen.value = false
}

// 组件挂载时获取部门列表
onMounted(() => {
  getDeptListData()
})

getList()
</script>
