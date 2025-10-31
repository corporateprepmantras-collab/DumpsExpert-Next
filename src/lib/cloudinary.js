import cloudinary from 'cloudinary';
import {Readable} from 'stream';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (file) => {
  return new Promise(async (resolve, reject) => {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());

      const stream = cloudinary.v2.uploader.upload_stream(
        { folder: 'product_categories' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      stream.end(buffer);
    } catch (err) {
      reject(err);
    }
  });
};

// Upload image with image transformations
export const uploadImageToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    console.log("🔼 Starting Image upload to Cloudinary...");
    console.log("📦 Buffer size:", buffer.length, "bytes");
    
    const stream = cloudinary.v2.uploader.upload_stream(
      {
        folder: 'products',
        resource_type: 'image', // Image with optimizations
        quality: 'auto',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error) {
          console.error("❌ Image upload error:", error.message);
          return reject(error);
        }
        
        console.log("✅ Image upload successful!");
        console.log("📍 Public ID:", result.public_id);
        console.log("🔗 Secure URL:", result.secure_url);
        console.log("📊 Format:", result.format);
        
        resolve(result);
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

// Upload PDF as raw file (no transformation, keeps original)
export const uploadPdfToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    console.log("🔼 Starting PDF upload to Cloudinary (RAW)...");
    console.log("📦 Buffer size:", buffer.length, "bytes");
    
    const stream = cloudinary.v2.uploader.upload_stream(
      {
        folder: 'products',
        resource_type: 'raw', // RAW - No transformation, keeps PDF intact
      },
      (error, result) => {
        if (error) {
          console.error("❌ PDF upload error:", error.message);
          return reject(error);
        }
        
        console.log("✅ PDF upload successful!");
        console.log("📍 Public ID:", result.public_id);
        console.log("🔗 Secure URL:", result.secure_url);
        console.log("⏰ Upload timestamp:", result.created_at);
        console.log("📊 Version:", result.version);
        console.log("📄 Format:", result.format);
        
        resolve(result);
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

// Keep old function for backward compatibility but use new one internally
export const uploadToCloudinaryfile = (buffer, fileType = 'auto') => {
  return new Promise((resolve, reject) => {
    console.log("🔼 Starting file upload to Cloudinary...");
    console.log("📦 Buffer size:", buffer.length, "bytes");
    console.log("📄 File type:", fileType);
    
    const stream = cloudinary.v2.uploader.upload_stream(
      {
        folder: 'products',
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          console.error("❌ File upload error:", error.message);
          return reject(error);
        }
        
        console.log("✅ File upload successful!");
        console.log("📍 Public ID:", result.public_id);
        console.log("🔗 Secure URL:", result.secure_url);
        
        resolve(result);
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

export const uploadToCloudinaryBlog = async (file) => {
  try {
    const buffer = await file.arrayBuffer();
    const bytes = Buffer.from(buffer);
    
    console.log("🔼 Starting Blog image upload to Cloudinary...");
    console.log("📦 Buffer size:", bytes.length, "bytes");
    
    return new Promise((resolve, reject) => { 
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        { 
          folder: 'blogs',
          resource_type: 'image',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error("❌ Blog upload error:", error.message);
            reject(error);
          } else {
            console.log("✅ Blog upload successful!");
            console.log("🔗 Secure URL:", result.secure_url);
            resolve(result);
          }
        }
      );
      
      uploadStream.end(bytes);
    });
  } catch (error) {
    console.error("❌ Blog upload failed:", error.message);
    throw new Error('Failed to upload image');
  }
};

export const deleteFromCloudinary = async (public_id) => {
  if (!public_id) {
    console.warn("⚠️ No public_id provided for deletion");
    return;
  }
  
  try {
    console.log("🗑️ Deleting from Cloudinary...");
    console.log("📍 Public ID:", public_id);
    
    const result = await cloudinary.v2.uploader.destroy(public_id);
    
    console.log("✅ Delete successful!");
    console.log("📊 Result:", result.result);
    
    return result;
  } catch (err) {
    console.error("❌ Cloudinary Deletion Error:", err.message);
    console.error("📍 Attempted to delete:", public_id);
  }
};

export default cloudinary;