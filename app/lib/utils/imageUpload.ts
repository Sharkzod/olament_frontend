interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload image to Cloudinary
 * @param file - File object or base64 string
 * @param folder - Optional folder name in Cloudinary
 */
export async function uploadToCloudinary(
  file: File | string,
  folder: string = 'profile-avatars'
): Promise<UploadResult> {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      console.error('Cloudinary credentials not found in environment variables');
      return {
        success: false,
        error: 'Cloudinary configuration missing'
      };
    }

    const formData = new FormData();

    // Handle File object or base64 string
    if (typeof file === 'string') {
      formData.append('file', file);
    } else {
      formData.append('file', file);
    }

    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folder);

    // Add transformation to optimize image
    formData.append('transformation', JSON.stringify({
      width: 500,
      height: 500,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto',
      fetch_format: 'auto'
    }));

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary upload error:', errorData);
      return {
        success: false,
        error: errorData.error?.message || 'Upload failed'
      };
    }

    const data: CloudinaryResponse = await response.json();

    return {
      success: true,
      url: data.secure_url
    };
  } catch (error: any) {
    console.error('Error uploading to Cloudinary:', error);
    return {
      success: false,
      error: error.message || 'Upload failed'
    };
  }
}

/**
 * Upload image to your backend API
 * @param file - File object or base64 string
 */
export async function uploadToBackend(
  file: File | string
): Promise<UploadResult> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    
    // Get auth token
    const token = typeof window !== 'undefined' ? 
      localStorage.getItem('authToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') :
      null;

    if (!token) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const formData = new FormData();

    // Handle File object or base64 string
    if (typeof file === 'string') {
      // Convert base64 to blob
      const response = await fetch(file);
      const blob = await response.blob();
      formData.append('avatar', blob, 'avatar.jpg');
    } else {
      formData.append('avatar', file);
    }

    const uploadResponse = await fetch(`${apiUrl}/upload/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      return {
        success: false,
        error: errorData.message || 'Upload failed'
      };
    }

    const data = await uploadResponse.json();

    return {
      success: true,
      url: data.url || data.imageUrl
    };
  } catch (error: any) {
    console.error('Error uploading to backend:', error);
    return {
      success: false,
      error: error.message || 'Upload failed'
    };
  }
}

/**
 * Compress image before upload
 * @param file - File object
 * @param maxWidth - Maximum width (default: 800)
 * @param maxHeight - Maximum height (default: 800)
 * @param quality - Image quality 0-1 (default: 0.8)
 */
export function compressImage(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 * @param file - File object
 * @param maxSize - Maximum file size in bytes (default: 5MB)
 */
export function validateImageFile(
  file: File,
  maxSize: number = 5 * 1024 * 1024
): { valid: boolean; error?: string } {
  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'Please select an image file'
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Image size must be less than ${maxSize / (1024 * 1024)}MB`
    };
  }

  // Check if it's a supported format
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!supportedFormats.includes(file.type)) {
    return {
      valid: false,
      error: 'Supported formats: JPEG, PNG, WebP'
    };
  }

  return { valid: true };
}