export interface Task {
  task_id: number
  task_name: string
  enabled: boolean
  keyword: string
  description: string
  max_pages: number
  personal_only: boolean
  min_price?: string
  max_price?: string
  cron?: string
  running?: boolean
  next_run_time?: string
}

export type UpdateTask = Omit<Partial<Task>, 'task_id'> & {
  task_id: number
}

export type TaskResultRequest = {
  page?: number,
  limit?: number,
  sort_by?: 'crawl_time' | 'publish_time' | 'price',
  recommended_only?: boolean,
  order?: 'asce' | 'desc'
}

export type TaskResultResponse = {
  total: number,
  page: number,
  limit: number,
  items: TaskResult[]
}

export interface TaskResult {
  "爬取时间": string,
  "搜索关键字": string,
  "任务名称": string,
  "商品信息": {
    "商品标题": string,
    "当前售价": string,
    "商品原价": string,
    "想要人数": string,
    "商品标签": string[],
    "发货地区": string,
    "商品链接": string,
    "发布时间": string,
    "商品ID": string,
    "浏览量": number,
    "商品描述": string
    "商品图片列表": string[],
  },
  "卖家信息": {
    "卖家ID": number,
    "卖家昵称": string,
    "实名认证": string,
    "回复间隔": string,
    "二十四小时回复率": string,
    "注册天数": string,
    "卖家个人描述": string,
    "卖家信用": string
  },
  "分析结果"?: {
    "推荐度": number,
    "建议": string,
    "原因": string
  }
}

export interface TaskLogEntry {
  id: number
  timestamp: string
  level: string
  message: string
  task_id: number
}

export type TaskLogResponse = TaskLogEntry[]

export interface TaskLogsRequest {
  from_time?: string;
  limit?: number;
  levels?: ('提示' | '警告' | '错误' | 'DEBUG')[]
}
