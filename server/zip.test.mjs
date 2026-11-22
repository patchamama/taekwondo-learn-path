import assert from 'node:assert/strict'
import { test } from 'node:test'
import { deflateRawSync } from 'node:zlib'
import { listZip, readZipEntry } from './zip.mjs'

function crc32(buf) {
  let c
  let crc = 0xffffffff
  for (const byte of buf) {
    c = (crc ^ byte) & 0xff
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    crc = (crc >>> 8) ^ c
  }
  return (crc ^ 0xffffffff) >>> 0
}

function makeZip(files) {
  const locals = []
  const centrals = []
  let offset = 0
  for (const [name, data, method] of files) {
    const body = method === 8 ? deflateRawSync(data) : data
    const nameBuf = Buffer.from(name)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(method, 8)
    local.writeUInt32LE(crc32(data), 14)
    local.writeUInt32LE(body.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(nameBuf.length, 26)
    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(method, 10)
    central.writeUInt32LE(crc32(data), 16)
    central.writeUInt32LE(body.length, 20)
    central.writeUInt32LE(data.length, 24)
    central.writeUInt16LE(nameBuf.length, 28)
    central.writeUInt32LE(offset, 42)
    locals.push(local, nameBuf, body)
    centrals.push(central, nameBuf)
    offset += 30 + nameBuf.length + body.length
  }
  const cd = Buffer.concat(centrals)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(files.length, 8)
  end.writeUInt16LE(files.length, 10)
  end.writeUInt32LE(cd.length, 12)
  end.writeUInt32LE(offset, 16)
  return Buffer.concat([...locals, cd, end])
}

test('lists and reads stored and deflated entries', () => {
  const big = Buffer.from('hello world '.repeat(200))
  const zip = makeZip([
    ['OEBPS/image1.jpg', Buffer.from([1, 2, 3, 4]), 0],
    ['OEBPS/text.xhtml', big, 8],
  ])
  const entries = listZip(zip)
  assert.deepEqual(entries.map((e) => e.name), ['OEBPS/image1.jpg', 'OEBPS/text.xhtml'])
  assert.deepEqual([...readZipEntry(zip, entries[0])], [1, 2, 3, 4])
  assert.equal(readZipEntry(zip, entries[1]).toString(), big.toString())
})

test('rejects a file that is not a zip', () => {
  assert.throws(() => listZip(Buffer.from('not a zip')))
})
