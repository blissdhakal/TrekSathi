import Trek from "../models/Trek.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get all treks
const getAllTreks = asyncHandler(async (req, res) => {
  const treks = await Trek.find({});
  
  console.log(`Found ${treks.length} treks in database`);
  
  if (!treks.length) {
    return res.status(200).json(
      new ApiResponse(200, [], "No treks found")
    );
  }
  
  return res.status(200).json(
    new ApiResponse(200, treks, "All treks fetched successfully")
  );
});

// Get trek by slug
const getTrekBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  
  console.log(`Attempting to find trek with slug: "${slug}"`);
  
  if (!slug) {
    throw new ApiError(400, "Slug is required");
  }
  
  const trek = await Trek.findOne({ slug: slug.toLowerCase() });
  
  if (!trek) {
    console.log(`Trek with slug "${slug}" not found in database`);
    throw new ApiError(404, "Trek not found");
  }
  
  console.log(`Found trek: ${trek.name} with id: ${trek._id}`);
  
  return res.status(200).json(
    new ApiResponse(200, trek, "Trek fetched successfully")
  );
});

export { getAllTreks, getTrekBySlug };