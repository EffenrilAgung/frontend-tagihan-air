const PROFILE_MAX_SIZE = 2 * 1024 * 1024
const METER_MAX_SIZE = 10 * 1024 * 1024

const PROFILE_ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/pjpeg', 'image/x-png']
const METER_ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/pjpeg', 'image/x-png']

const PROFILE_ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png']
const BLOCKED_EXTENSIONS = ['.pdf', '.gif', '.webp', '.svg', '.bmp', '.heic', '.heif']

function getExtension(filename: string): string {
  const index = filename.lastIndexOf('.')
  return index >= 0 ? filename.slice(index).toLowerCase() : ''
}

function isBlockedFile(file: File): boolean {
  const ext = getExtension(file.name)
  return BLOCKED_EXTENSIONS.includes(ext) || file.type === 'application/pdf'
}

function isAllowedImage(file: File, allowedMimes: string[], allowedExtensions: string[]): boolean {
  const ext = getExtension(file.name)
  const mimeOk = !file.type || allowedMimes.includes(file.type)
  const extOk = !ext || allowedExtensions.includes(ext)
  return mimeOk && extOk && !isBlockedFile(file)
}

export function validateProfileImageFile(file: File): string | null {
  if (isBlockedFile(file)) {
    return 'File PDF tidak didukung. Gunakan JPG atau PNG.'
  }
  if (!isAllowedImage(file, PROFILE_ALLOWED_MIMES, PROFILE_ALLOWED_EXTENSIONS)) {
    return 'Format foto harus JPEG atau PNG.'
  }
  if (file.size > PROFILE_MAX_SIZE) {
    return 'Ukuran foto maksimal 2 MB.'
  }
  return null
}

export function validateMeterImageFile(file: File): string | null {
  if (isBlockedFile(file)) {
    return 'File PDF tidak didukung. Gunakan JPG atau PNG.'
  }
  if (!isAllowedImage(file, METER_ALLOWED_MIMES, PROFILE_ALLOWED_EXTENSIONS)) {
    return 'Format foto harus JPEG atau PNG.'
  }
  if (file.size > METER_MAX_SIZE) {
    return 'Ukuran foto maksimal 10 MB.'
  }
  return null
}