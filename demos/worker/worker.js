let timer
const dateTimeFormatOption = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
}

const start = () => {
    timer = setInterval(() => {
        console.log('worker run interval')
        self.postMessage(new Intl.DateTimeFormat("zh-CN",dateTimeFormatOption).format(new Date()))
    }, 3000)
}

const stop = () => {
    clearInterval(timer)
}

self.addEventListener('message', msg => {
    if (msg.data === 'start') {
        start()
    } else if (msg.data === 'stop') {
        stop()
    }
})
