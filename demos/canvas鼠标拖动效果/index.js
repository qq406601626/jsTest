const canvas = document.getElementById('canvas')
const ctx =canvas.getContext('2d')
const startList = []
const random = (min, max)=>{
    return Math.floor((max - min) * Math.random() + min);
}
class Star {
    constructor(x,y) {
        this.x = x
        this.y = y
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = (Math.random() - 0.5) * 3;
        this.color = 'rgb(' + random(0, 256) + ',' + random(0, 256) + ',' + random(0, 256) + ')';
        this.a = 1;
        this.draw();
    }
    draw(){
        ctx.beginPath();
        ctx.fillStyle = this.color;
        // 图像覆盖  显示方式 lighter 会将覆盖部分的颜色重叠显示出来
        ctx.globalCompositeOperation = 'lighter'
        ctx.globalAlpha = this.a;
        ctx.arc(this.x, this.y, 30, 0, Math.PI * 2, false);
        ctx.fill();
        this.update();
    }
    update(){
        this.x += this.vx;
        this.y += this.vy;
        // 透明度越来越小
        this.a *= 0.98;
    }
}

// 1、鼠标移动特效的核心在于鼠标移动时往鼠标里塞入对象(鼠标移动事件只负责生成对象然后添加到队列中)
// 2、递归主程序负责重绘，不停遍历队列，然后对修改队列中的对象，然后根据修改后的数据进行重新绘制。如果对象新的属性值不符合重绘条件，那么就把该对象从队列中删除。
canvas.addEventListener('mousemove',(e)=>{
    startList.push(new Star(e.offsetX, e.offsetY));
})

const render = ()=>{
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    startList.forEach((ele,i)=>{
        ele.draw();
        if (ele.a < 0.05) {
            startList.splice(i, 1);
        }
    })
    requestAnimationFrame(render);
}
render()
