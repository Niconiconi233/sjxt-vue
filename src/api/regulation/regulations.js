import request from '@/utils/request'

// 查询制度管理列表
export function listRegulations(query) {
  return request({
    url: '/regulation/regulations/list',
    method: 'get',
    params: query
  })
}

// 查询制度管理详细
export function getRegulations(id) {
  return request({
    url: '/regulation/regulations/' + id,
    method: 'get'
  })
}

// 新增制度管理
export function addRegulations(data) {
  return request({
    url: '/regulation/regulations',
    method: 'post',
    data: data
  })
}

// 修改制度管理
export function updateRegulations(data) {
  return request({
    url: '/regulation/regulations',
    method: 'put',
    data: data
  })
}

// 删除制度管理
export function delRegulations(id) {
  return request({
    url: '/regulation/regulations/' + id,
    method: 'delete'
  })
}

// 删除制度管理
export function parseRegulations(data) {
  return request({
    url: '/regulation/regulations/parse',
    method: 'post',
    data: data
  })
}
