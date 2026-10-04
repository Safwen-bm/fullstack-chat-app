import cloudinary from "./cloudinary.js";

// https://res.cloudinary.com/<cloud>/image/upload/v123/onlychat/messages/abc.jpg
// gives the public id "onlychat/messages/abc"
const getPublicId = (url) => {
  const match = typeof url === "string" && url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
  return match ? match[1] : null;
};

// best effort: a failure here must never break the request
export const destroyImageByUrl = async (url) => {
  try {
    const publicId = getPublicId(url);
    if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.log("Could not delete image from Cloudinary:", error.message);
  }
};