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
}

export type UpdateTask = Omit<Partial<Task>, 'task_id'> & {
  task_id: number
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
  }
}
