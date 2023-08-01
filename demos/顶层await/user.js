console.log('开始')
await new Promise(r=>setTimeout(r,3000)) // 在【模块】的【顶层】可以直接使用await
console.log('结束')
