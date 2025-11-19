function div(a: number, b: number) { return ~~(a / b) }
function g2d(gy: number, gm: number, gd: number) {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4)
  d += div(153 * ((gm + 9) % 12) + 2, 5)
  d += gd - 34840408
  d -= div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4)
  return d
}
function d2g(j: number) {
  let j2 = 4 * j + 139361631
  j2 = j2 + div(div(4 * j + 183187720, 146097) * 3, 4) * 4 - 3908
  const i = div((j2 % 1461), 4) * 5 + 308
  const gd = div((i % 153), 5) + 1
  const gm = (div(i, 153) % 12) + 1
  const gy = div(j2, 1461) - 100100 + div(8 - gm, 6)
  return { gy, gm, gd }
}
function j2d(jy: number, jm: number, jd: number) {
  jy = jy - (jy >= 0 ? 474 : 473)
  const epbase = 474 + jy
  return jd + (jm <= 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186)
    + div((epbase * 682 - 110), 2816) + (epbase - 1) * 365 + (jy >= 0 ? 0 : -1) * 682 + (1948320 - 1)
}
function d2j(j: number) {
  j = j - (1948320 - 1)
  const depoch = j
  const cycle = div(depoch, 1029983)
  const cyear = depoch % 1029983
  let ycycle
  if (cyear === 1029982) ycycle = 2820
  else {
    const aux1 = div(cyear, 366)
    const aux2 = cyear % 366
    ycycle = div((2134 * aux1 + 2816 * aux2 + 2815), 1028522) + aux1 + 1
  }
  const jy = ycycle + 2820 * cycle + 474
  const yday = j - j2d(jy, 1, 1) + 1
  const jm = yday <= 186 ? Math.ceil(yday / 31) : Math.ceil((yday - 186) / 30) + 6
  const jd = yday - (jm <= 6 ? (jm - 1) * 31 : 186 + (jm - 7) * 30)
  return { jy: jy <= 0 ? jy - 1 : jy, jm, jd }
}
export function jalaliToGregorianStr(jDate: string): string | null {
  if (!jDate) return null
  const [jy, jm, jd] = jDate.split(/[\/\-]/).map(n => parseInt(n, 10))
  if (!jy || !jm || !jd) return null
  const g = d2g(j2d(jy, jm, jd))
  return `${String(g.gy).padStart(4,'0')}-${String(g.gm).padStart(2,'0')}-${String(g.gd).padStart(2,'0')}`
}
export function gregorianToJalaliStr(gDate: string): string | null {
  if (!gDate) return null
  const [gy, gm, gd] = gDate.split(/[\/\-]/).map(n => parseInt(n, 10))
  if (!gy || !gm || !gd) return null
  const j = d2j(g2d(gy, gm, gd))
  return `${String(j.jy).padStart(4,'0')}/${String(j.jm).padStart(2,'0')}/${String(j.jd).padStart(2,'0')}`
}
