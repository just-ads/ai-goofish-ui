export function copyToClipboard(string: string) {
  return self.navigator.permissions.query({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    name: 'clipboard-write'
  }).then(res => {
    if (res.state === 'granted' || res.state === 'prompt') {
      return self.navigator.clipboard.writeText(string);
    } else {
      return Promise.reject(new Error('用户拒绝访问'));
    }
  })
}
