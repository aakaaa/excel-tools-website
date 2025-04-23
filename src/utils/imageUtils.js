export function resizeImage(file, options) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      
      if (width > options.maxWidth || height > options.maxHeight) {
        const ratio = Math.min(
          options.maxWidth / width, 
          options.maxHeight / height
        )
        width *= ratio
        height *= ratio
      }
      
      canvas.width = width
      canvas.height = height
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob((blob) => {
        resolve(new File([blob], file.name, {
          type: file.type,
          lastModified: Date.now()
        }))
      }, file.type, options.quality || 0.9)
    }
    img.src = URL.createObjectURL(file)
  })
}

export function convertToIco(file, sizes = [16, 32, 64]) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = async () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      const icoHeader = new Uint8Array(6)
      icoHeader[0] = 0; icoHeader[1] = 0
      icoHeader[2] = 1; icoHeader[3] = 0
      icoHeader[4] = sizes.length; icoHeader[5] = 0
      
      const iconData = []
      let offset = 6 + (16 * sizes.length)
      
      for (const size of sizes) {
        canvas.width = size
        canvas.height = size
        ctx.clearRect(0, 0, size, size)
        ctx.drawImage(img, 0, 0, size, size)
        
        const pngData = await new Promise(res => 
          canvas.toBlob(res, 'image/png'))
        const arrayBuffer = await pngData.arrayBuffer()
        
        const dirEntry = new Uint8Array(16)
        dirEntry[0] = size === 256 ? 0 : size
        dirEntry[1] = size === 256 ? 0 : size
        dirEntry[2] = 0
        dirEntry[3] = 0
        dirEntry[4] = 1
        dirEntry[5] = 32
        dirEntry[6] = arrayBuffer.byteLength & 0xFF
        dirEntry[7] = (arrayBuffer.byteLength >> 8) & 0xFF
        dirEntry[8] = (arrayBuffer.byteLength >> 16) & 0xFF
        dirEntry[9] = (arrayBuffer.byteLength >> 24) & 0xFF
        dirEntry[10] = offset & 0xFF
        dirEntry[11] = (offset >> 8) & 0xFF
        dirEntry[12] = (offset >> 16) & 0xFF
        dirEntry[13] = (offset >> 24) & 0xFF
        
        iconData.push(dirEntry)
        iconData.push(new Uint8Array(arrayBuffer))
        offset += arrayBuffer.byteLength
      }
      
      const finalData = new Uint8Array(offset)
      finalData.set(icoHeader)
      
      let currentOffset = 6
      for (const entry of iconData) {
        finalData.set(entry, currentOffset)
        currentOffset += entry.byteLength
      }
      
      resolve(new Blob([finalData], { type: 'image/x-icon' }))
    }
    img.src = URL.createObjectURL(file)
  })
}
