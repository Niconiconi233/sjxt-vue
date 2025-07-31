import request from '@/utils/request'

// 查询审计问题管理列表
export function listAudit(query) {
  return request({
    url: '/audit/audit/list',
    method: 'get',
    params: query
  })
}

// 根据审计ID获取问题列表
export function getIssueList(mainId) {
  return request({
    url: '/audit/audit/issuelist',
    method: 'get',
    params: { mainId }
  })
}

// 更新问题数据
export function updateIssue(data) {
  return request({
    url: '/audit/audit/issue',
    method: 'put',
    data: data
  })
}

// 查询审计问题管理详细
export function getAudit(id) {
  return request({
    url: '/audit/audit/' + id,
    method: 'get'
  })
}

// 新增审计问题管理
export function addAudit(data) {
  return request({
    url: '/audit/audit',
    method: 'post',
    data: data
  })
}

// 修改审计问题管理
export function updateAudit(data) {
  return request({
    url: '/audit/audit',
    method: 'put',
    data: data
  })
}

// 删除审计问题管理
export function delAudit(id) {
  return request({
    url: '/audit/audit/' + id,
    method: 'delete'
  })
}

export function getDeptList(deptId) {
  return request({
    url: '/system/dept/list/sub_dept/' + deptId,
    method: 'get',
  })  
}

// 上传整改资料（支持多文件）
export function uploadAuditMaterials(formData) {
  return request({
    url: '/common/uploadMinios',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
