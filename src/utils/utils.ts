export function copyToClipboard(string: string) {
  return self.navigator.permissions.query({

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

export function safeStringify(input: any, replacer?: any, space?: string | number) {
  try {
    return JSON.stringify(input, replacer, space);

  } catch (e) {
    return input;
  }
}


export function getDeviceType(): 'IOS' | 'Android' | 'PC' {
  const ua = navigator.userAgent;

  // 检测 iOS (iPhone, iPad, iPod)
  if (/(iPhone|iPad|iPod|iOS)/i.test(ua)) {
    return 'IOS';
  }

  // 检测 Android
  if (/(Android|Adr)/i.test(ua)) {
    return 'Android';
  }

  // 默认为 PC
  return 'PC';
}
