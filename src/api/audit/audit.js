import request from '@/utils/request'

// 查询审计问题管理列表
export function listAudit(query) {
  return request({
    url: '/audit/audit/list',
    method: 'get',
    params: query
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
