import crypto from "crypto"
import os from "os"

// Use a machine-specific value as the encryption key
// This is a simple approach and not suitable for high-security applications
const getMachineKey = (): string => {
  const hostname = os.hostname()
  const username = os.userInfo().username
  const machineId = `${hostname}-${username}`
  return crypto.createHash("sha256").update(machineId).digest("hex").substring(0, 32)
}

const ENCRYPTION_KEY = getMachineKey()
const ALGORITHM = "aes-256-cbc"

/**
 * Encrypt a string
 * @param text The text to encrypt
 * @returns The encrypted text
 */
export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv)
    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")
    return `${iv.toString("hex")}:${encrypted}`
  } catch (error) {
    console.error("Encryption error:", error)
    return text // Return the original text if encryption fails
  }
}

/**
 * Decrypt a string
 * @param encryptedText The encrypted text
 * @returns The decrypted text
 */
export function decrypt(encryptedText: string): string {
  try {
    const [ivHex, encrypted] = encryptedText.split(":")
    if (!ivHex || !encrypted) {
      return encryptedText // Return the original text if it's not in the expected format
    }

    const iv = Buffer.from(ivHex, "hex")
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv)
    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
  } catch (error) {
    console.error("Decryption error:", error)
    return encryptedText // Return the original text if decryption fails
  }
}
