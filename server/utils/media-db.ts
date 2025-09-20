import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'

export interface MediaRecord {
  id: string
  url: string
  localPath: string
  type: 'image' | 'video'
  size: number
  mimeType: string
  source: string
  metadata: {
    postId?: string
    username?: string
    caption?: string
    downloadedAt: string
    lastAccessed: string
  }
}

class MediaDatabase {
  private dbPath = './storage/media-db.json'
  private storageDir = './storage/media'
  private db: Map<string, MediaRecord> = new Map()

  constructor() {
    this.init()
  }

  private async init() {
    // Create storage directories
    await this.ensureDirectories()
    
    // Load existing database
    await this.load()
  }

  private async ensureDirectories() {
    const dirs = [
      './storage',
      './storage/media',
      './storage/media/images',
      './storage/media/videos',
      './storage/media/thumbnails'
    ]

    for (const dir of dirs) {
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true })
      }
    }
  }

  private async load() {
    try {
      if (existsSync(this.dbPath)) {
        const data = await readFile(this.dbPath, 'utf-8')
        const records = JSON.parse(data) as MediaRecord[]
        records.forEach(record => {
          this.db.set(record.id, record)
        })
      }
    } catch (error) {
      console.error('Failed to load media database:', error)
    }
  }

  private async save() {
    try {
      const records = Array.from(this.db.values())
      await writeFile(this.dbPath, JSON.stringify(records, null, 2))
    } catch (error) {
      console.error('Failed to save media database:', error)
    }
  }

  async addRecord(record: MediaRecord) {
    this.db.set(record.id, record)
    await this.save()
  }

  async getRecord(id: string): Promise<MediaRecord | undefined> {
    const record = this.db.get(id)
    if (record) {
      // Update last accessed time
      record.metadata.lastAccessed = new Date().toISOString()
      await this.save()
    }
    return record
  }

  async findByUrl(url: string): Promise<MediaRecord | undefined> {
    for (const record of this.db.values()) {
      if (record.url === url) {
        record.metadata.lastAccessed = new Date().toISOString()
        await this.save()
        return record
      }
    }
    return undefined
  }

  async getAllRecords(): Promise<MediaRecord[]> {
    return Array.from(this.db.values())
  }

  async getStats() {
    const records = Array.from(this.db.values())
    const totalSize = records.reduce((sum, r) => sum + r.size, 0)
    const imageCount = records.filter(r => r.type === 'image').length
    const videoCount = records.filter(r => r.type === 'video').length

    return {
      totalRecords: records.length,
      totalSize,
      imageCount,
      videoCount,
      formattedSize: this.formatBytes(totalSize)
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }
}

// Export singleton instance
export const mediaDB = new MediaDatabase()