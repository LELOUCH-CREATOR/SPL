import { createClient } from './supabase-server'

export const getStorageClient = async () => {
    const supabase = await createClient()
    return supabase.storage
}

/**
 * Uploads a file to a private bucket.
 * @param bucket - The name of the storage bucket
 * @param path - The path including filename to store the file
 * @param file - The file body (Blob, Buffer, etc.)
 * @returns { data, error }
 */
export const uploadFile = async (bucket: string, path: string, file: any) => {
    const storage = await getStorageClient()
    const { data, error } = await storage.from(bucket).upload(path, file, {
        upsert: true,
    })
    return { data, error }
}

/**
 * Generates a signed URL for secure access to a file in a private bucket.
 * @param bucket - The name of the storage bucket
 * @param path - The path to the file
 * @param expiresIn - Time in seconds until the URL expires (default 60s)
 * @returns { signedUrl, error }
 */
export const getSignedUrl = async (bucket: string, path: string, expiresIn = 60) => {
    const storage = await getStorageClient()
    const { data, error } = await storage.from(bucket).createSignedUrl(path, expiresIn)

    if (error) {
        return { signedUrl: null, error }
    }

    return { signedUrl: data.signedUrl, error: null }
}

/**
 * Deletes a file from the bucket.
 * @param bucket - The name of the storage bucket
 * @param path - The path to the file
 */
export const deleteFile = async (bucket: string, path: string) => {
    const storage = await getStorageClient()
    const { data, error } = await storage.from(bucket).remove([path])
    return { data, error }
}
