/**
 * Serialize a single MongoDB document for Next.js
 * Converts ObjectId and Dates to strings
 */
export function serializeMongoDoc(doc) {
  if (!doc) return null;
  
  const serialized = { ...doc };
  
  // Convert ObjectId to string
  if (serialized._id) {
    serialized._id = typeof serialized._id === 'object' 
      ? serialized._id.toString() 
      : serialized._id;
  }
  
  // Convert dates to ISO strings
  if (serialized.createdAt) {
    serialized.createdAt = serialized.createdAt instanceof Date
      ? serialized.createdAt.toISOString()
      : serialized.createdAt;
  }
  
  if (serialized.updatedAt) {
    serialized.updatedAt = serialized.updatedAt instanceof Date
      ? serialized.updatedAt.toISOString()
      : serialized.updatedAt;
  }

  // Handle nested populated fields (like category in blogs)
  if (serialized.category && typeof serialized.category === 'object' && serialized.category._id) {
    serialized.category = {
      ...serialized.category,
      _id: serialized.category._id.toString(),
    };
  }
  
  return serialized;
}

/**
 * Serialize an array of MongoDB documents
 */
export function serializeMongoArray(docs) {
  if (!Array.isArray(docs)) return [];
  return docs.map(doc => serializeMongoDoc(doc));
}