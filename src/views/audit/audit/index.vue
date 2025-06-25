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
      <el-table-column label="项目ID" align="center" prop="id" />
      <el-table-column label="项目名称" align="center" prop="projectName" />
      <el-table-column label="录入人" align="center" prop="inputBy" />
      <el-table-column label="录入时间" align="center" prop="inputDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.inputDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="整改时限" align="center" prop="rectificationDeadline" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.rectificationDeadline, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createdAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" align="center" prop="updatedAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updatedAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="整改机构" align="center" prop="rectificationOrgName" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['audit:audit:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['audit:audit:remove']">删除</el-button>
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
          <el-select v-model="form.rectificationOrgName" placeholder="请选择整改机构">
            <el-option label="A公司" value="A公司" />
            <el-option label="B公司" value="B公司" />
            <el-option label="C公司" value="C公司" />
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
  </div>
</template>

<script setup name="Audit">
import { listAudit, getAudit, delAudit, addAudit, updateAudit } from "@/api/audit/audit"

const { proxy } = getCurrentInstance()

const auditList = ref([])
const auditIssueList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const checkedAuditIssue = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

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
    rectificationOrgName: null
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

getList()
</script>
