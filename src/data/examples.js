import { bi } from '../i18n/index.js'
const base = 'const svg = d3.select("#vis").append("svg").attr("viewBox", "0 0 600 340");\n'
export const examples = [
  {
    id: 'join',
    title: bi('01 · D3 数据绑定', '01 · D3 data binding'),
    description: bi(
      '修改数组长度，观察 join 如何让圆的数量与数据一致。每个圆的半径映射到数值。',
      'Change array length to observe how join matches circles to data. Radius is mapped to value.'
    ),
    code:
      base +
      'const data = [12, 24, 36, 18, 30];\nsvg.selectAll("circle").data(data).join("circle")\n  .attr("cx", (d, i) => 65 + i * 105)\n  .attr("cy", 160).attr("r", d => d)\n  .attr("fill", "#77bdb1");\nsvg.selectAll("text").data(data).join("text")\n  .attr("x", (d, i) => 65 + i * 105)\n  .attr("y", 230).attr("text-anchor", "middle")\n  .text(d => d);'
  },
  {
    id: 'bars',
    title: bi('02 · 绘制柱状图', '02 · Draw a bar chart'),
    description: bi(
      '类别使用 band 比例尺，数值使用 linear 比例尺。改变数据或 fill 颜色，再运行。',
      'Categories use a band scale and values use a linear scale. Change data or fill, then run.'
    ),
    code:
      base +
      'const data = [42, 68, 53, 91, 75];\nconst x = d3.scaleBand().domain(d3.range(data.length)).range([50, 570]).padding(0.3);\nconst y = d3.scaleLinear().domain([0, 100]).range([290, 30]);\nsvg.selectAll("rect").data(data).join("rect")\n  .attr("x", (d,i) => x(i)).attr("width", x.bandwidth())\n  .attr("y", d => y(d)).attr("height", d => y(0)-y(d))\n  .attr("fill", "#77bdb1").attr("rx", 5);\nsvg.append("g").attr("transform", "translate(50,0)").call(d3.axisLeft(y));'
  },
  {
    id: 'scale',
    title: bi('03 · 比例尺与坐标轴', '03 · Scales & axes'),
    description: bi(
      '修改 domain 的最大值，观察相同数据的位置与刻度如何同步变化。',
      'Change the domain maximum to observe positions and ticks updating together.'
    ),
    code:
      base +
      'const data = [10, 25, 45, 70, 90];\nconst x = d3.scaleLinear().domain([0, 100]).range([50, 560]);\nsvg.append("g").attr("transform", "translate(0,260)").call(d3.axisBottom(x));\nsvg.selectAll("circle").data(data).join("circle")\n  .attr("cx", d => x(d)).attr("cy", 150).attr("r", 12)\n  .attr("fill", "#dca5b4");\nsvg.selectAll("text.value").data(data).join("text")\n  .attr("class", "value").attr("x",d=>x(d)).attr("y",120)\n  .attr("text-anchor","middle").text(d=>d);'
  },
  {
    id: 'transition',
    title: bi('04 · 图表过渡动画', '04 · Chart transitions'),
    description: bi(
      '动画把同一对象的起点和终点连接起来。改变 duration 检查时间如何影响理解；减少动态设置下不播放。',
      'A transition connects start and end states of the same object. Change duration to explore timing; reduced-motion users see the final state.'
    ),
    code:
      base +
      'const data = [35, 65, 42, 84, 56];\nconst duration = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 850;\nsvg.selectAll("rect").data(data).join("rect")\n  .attr("x",(d,i)=>55+i*105).attr("width",60)\n  .attr("y",290).attr("height",0).attr("fill","#77bdb1")\n  .transition().duration(duration)\n  .attr("y",d=>290-d*2.8).attr("height",d=>d*2.8);'
  },
  {
    id: 'events',
    title: bi('05 · 鼠标与键盘事件', '05 · Pointer & keyboard events'),
    description: bi(
      '悬停、聚焦或点击圆，显示对应值。事件回调中的 d 是绑定到该元素的数据。',
      'Hover, focus or click a circle to show its value. The handler’s d is the datum bound to the element.'
    ),
    code:
      base +
      'const data = [16, 32, 24, 40, 28];\nconst label = svg.append("text").attr("x",300).attr("y",270).attr("text-anchor","middle");\nsvg.selectAll("circle").data(data).join("circle")\n  .attr("cx",(d,i)=>70+i*110).attr("cy",140).attr("r",d=>d)\n  .attr("fill","#77bdb1").attr("tabindex",0).attr("role","button")\n  .attr("aria-label",d=>String(d))\n  .on("pointerenter focus click",function(event,d){\n    d3.select(this).attr("fill","#dca5b4"); label.text("Value: "+d);\n  }).on("pointerleave blur",function(){d3.select(this).attr("fill","#77bdb1");});'
  }
]
