import router from "@/router";
import {getUserToken, clearUserToken} from "@/utils/user";
import {createFetch} from "@vueuse/core";
import {message} from "ant-design-vue";

export const useApi = createFetch({
  options: {
    async beforeFetch({options}) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${getUserToken()}`,
      }
      return {options}
    },
    afterFetch({data}) {
      return {data: data?.data}
    },
    onFetchError({response, error, data}) {
      if (response?.status === 401) {
        clearUserToken()
        router.push('/login')
      }
      const detail = data?.detail || error || '请求出错'
      message.error(detail)
      return {error: detail}
    },
  }
})
