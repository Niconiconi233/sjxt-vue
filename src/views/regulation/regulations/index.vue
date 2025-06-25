<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="制度名称" prop="regulationName">
        <el-input
          v-model="queryParams.regulationName"
          placeholder="请输入制度名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="制度编号" prop="regulationNo">
        <el-input
          v-model="queryParams.regulationNo"
          placeholder="请输入制度编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="制度状态" prop="regulationStatus">
        <el-select v-model="queryParams.regulationStatus" placeholder="请选择制度状态" clearable>
          <el-option
            v-for="dict in user_yes_no"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['regulation:regulations:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['regulation:regulations:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['regulation:regulations:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['regulation:regulations:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="regulationsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="id" />
      <el-table-column label="制度名称" align="center" prop="regulationName" />
      <el-table-column label="制度编号" align="center" prop="regulationNo" />
      <el-table-column label="访问地址" align="center" prop="regulationUrl">
        <template #default="scope">
          <el-link 
            type="primary" 
            :href="scope.row.regulationUrl" 
            target="_blank"
            :underline="false"
            class="url-link"
          >
            {{ scope.row.regulationName }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="制度状态" align="center" prop="regulationStatus">
        <template #default="scope">
          <el-tag
            :type="scope.row.regulationStatus === 1 ? 'success' : 'danger'"
            effect="light"
          >
            {{ scope.row.regulationStatus === 1 ? '在用' : '废止' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="解析状态" align="center" prop="parseStatus">
        <template #default="scope">
          <el-tag
            :type="scope.row.parseStatus === 1 ? 'success' : scope.row.parseStatus === 0 ? 'warning' : 'info'"
            effect="light"
          >
            {{ scope.row.parseStatus === 1 ? '已解析' : scope.row.parseStatus === 0 ? '解析中' : '未解析' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Document" @click="handleParse(scope.row)" v-hasPermi="['regulation:regulations:parse']">解析</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['regulation:regulations:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['regulation:regulations:remove']">删除</el-button>
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

    <!-- 添加或修改制度管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="regulationsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="制度名称" prop="regulationName">
          <el-input v-model="form.regulationName" placeholder="请输入制度名称" />
        </el-form-item>
        <el-form-item label="制度编号" prop="regulationNo">
          <el-input v-model="form.regulationNo" placeholder="请输入制度编号" />
        </el-form-item>
        <el-form-item label="上传制度" prop="regulationUrl">
          <file-upload v-model="form.regulationUrl" uploadType="minio"/>
        </el-form-item>
        <el-form-item label="制度状态" prop="regulationStatus">
          <el-radio-group v-model="form.regulationStatus">
            <el-radio
              v-for="dict in user_yes_no"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="修改时间" prop="modifyTime">
          <el-date-picker clearable
            v-model="form.modifyTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择修改时间">
          </el-date-picker>
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

<script setup name="Regulations">
import { listRegulations, getRegulations, delRegulations, addRegulations, updateRegulations, parseRegulations } from "@/api/regulation/regulations"
import { h } from 'vue'
import { ElNotification } from 'element-plus'

const { proxy } = getCurrentInstance()
const { user_yes_no } = proxy.useDict('user_yes_no')

const regulationsList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    regulationName: null,
    regulationNo: null,
    regulationStatus: null,
    parseStatus: null,
  },
  rules: {
    regulationName: [
      { required: true, message: "制度名称不能为空", trigger: "blur" }
    ],
    regulationNo: [
      { required: true, message: "制度编号不能为空", trigger: "blur" }
    ],
    regulationUrl: [
      { required: true, message: "访问地址不能为空", trigger: "blur" }
    ],
    regulationStatus: [
      { required: true, message: "制度状态不能为空", trigger: "change" }
    ],
    createTime: [
      { required: true, message: "创建时间不能为空", trigger: "blur" }
    ],
    modifyTime: [
      { required: true, message: "修改时间不能为空", trigger: "blur" }
    ],
    createBy: [
      { required: true, message: "创建者不能为空", trigger: "blur" }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询制度管理列表 */
function getList() {
  loading.value = true
  listRegulations(queryParams.value).then(response => {
    regulationsList.value = response.rows
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
    regulationName: null,
    regulationNo: null,
    regulationUrl: null,
    regulationStatus: 1,
    parseStatus: null,
    createTime: null,
    modifyTime: null,
    createBy: null
  }
  proxy.resetForm("regulationsRef")
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
  title.value = "添加制度管理"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getRegulations(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改制度管理"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["regulationsRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateRegulations(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addRegulations(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除制度管理编号为"' + _ids + '"的数据项？').then(function() {
    return delRegulations(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('regulation/regulations/export', {
    ...queryParams.value
  }, `regulations_${new Date().getTime()}.xlsx`)
}

/** 解析按钮操作 */
function handleParse(row) {
  // 检查解析状态，如果已经解析完成则提示用户
  if (row.parseStatus === 1) {
    ElNotification({
      title: '提示',
      message: h('i', { style: 'color: orange' }, '该文件已解析，无需重复解析'),
      type: 'warning'
    })
    return
  }
  
  const id = row.id
  parseRegulations({ id: id }).then(response => {
    ElNotification({
      title: '成功',
      message: h('i', { style: 'color: teal' }, '解析任务已提交'),
      type: 'success'
    })
    getList()
  }).catch(error => {
    ElNotification({
      title: '错误',
      message: h('i', { style: 'color: red' }, '解析任务提交失败'),
      type: 'error'
    })
  })
}

getList()
</script>

<style scoped>
.url-link {
  max-width: 200px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #1890ff !important;
}

.url-link:hover {
  color: #40a9ff !important;
}
</style>
