const xlsx = require('node-xlsx')
const { resolve } = require('path')
const { writeFileSync } = require('fs')
const glob = require('glob')
const files = glob.sync('data/**/*.xlsx')
const list = files.map(path => {
  return extraData(path)
}).reduce((p, c, index) => {
  return p.concat(c)
}, [])
const dataStr = list.map(row => row.join(',')).join('\r\n')
const buffer = Buffer.concat([Buffer.from('\xEF\xBB\xBF', 'binary'), Buffer.from(dataStr)])
writeFileSync(resolve(__dirname, 'total.csv'), buffer)

function extraData (path) {
  const excelData = xlsx.parse(path)
  let list = []
  for (let i = 0; i < excelData.length; i++) {
    let start = 6
    const table = excelData[i].data
    // 查找第一列
    // while (isNaN(parseInt(table[start][0]))) {
    //   start++
    // }
    const tabData = table.slice(start)
    const city = table[4][1]
    const suite = table[3][1]
    const subList = tabData.map(v => {
      // 替换，否则影响csv
      const row = v.map(col => col.toString().replace(/,/g, ';'))
      row[0] = city
      row[11] = suite
      return row
    })
    list = list.concat(subList.filter(v => v[1]))
  }
  return list
}
