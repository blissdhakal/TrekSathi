import Itinerary from '../models/Itinerary.js';
import Trek from '../models/Trek.js';

// Get itinerary by trek slug
export const getItineraryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Find trek by slug first
    const trek = await Trek.findOne({ slug });
    
    if (!trek) {
      return res.status(404).json({ success: false, message: 'Trek not found' });
    }
    
    // Find itinerary by trek ID
    const itinerary = await Itinerary.findOne({ trekId: trek._id });
    
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found for this trek' });
    }
    
    // Enhance trek data with price and name from itinerary if available
    const enhancedTrek = {
      ...trek.toObject(),
      price: itinerary.priceRange || trek.price || 'Contact for pricing',
      name: itinerary.trekName || trek.name
    };
    
    // Return both enhanced trek and itinerary data
    res.status(200).json({
      success: true,
      data: {
        trek: enhancedTrek,
        itinerary: itinerary.days
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new itinerary
export const createItinerary = async (req, res) => {
  try {
    const { trekId, days, slug, trekName, priceRange } = req.body;
    
    // Check if trek exists
    const trek = await Trek.findById(trekId);
    if (!trek) {
      return res.status(404).json({ success: false, message: 'Trek not found' });
    }
    
    // Create new itinerary with price and name
    const itinerary = new Itinerary({
      trekId,
      days,
      slug: slug || trek.slug, // Use trek slug if no slug provided
      trekName: trekName || trek.name, // Use trek name if no trekName provided
      priceRange: priceRange || 'Contact for pricing' // Default price range
    });
    
    await itinerary.save();
    res.status(201).json({ success: true, data: itinerary });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update an itinerary
export const updateItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    
    // If trekName or priceRange are being updated, include them
    const updateData = {
      ...req.body
    };
    
    const itinerary = await Itinerary.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
    
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }
    
    res.status(200).json({ success: true, data: itinerary });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete an itinerary
export const deleteItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    const itinerary = await Itinerary.findByIdAndDelete(id);
    
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all itineraries with price and name details
export const getAllItineraries = async (req, res) => {
  try {
    // Find all itineraries and populate trek information
    const itineraries = await Itinerary.find().populate('trekId');
    
    // Map the results to include price and name
    const formattedItineraries = itineraries.map(itinerary => {
      return {
        _id: itinerary._id,
        trekId: itinerary.trekId._id,
        trekName: itinerary.trekName || itinerary.trekId.name,
        priceRange: itinerary.priceRange || 'Contact for pricing',
        slug: itinerary.slug,
        daysCount: itinerary.days.length,
        // You can include more summary data as needed
        createdAt: itinerary.createdAt
      };
    });
    
    res.status(200).json({
      success: true,
      count: itineraries.length,
      data: formattedItineraries
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get itinerary by ID with price and name
export const getItineraryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find itinerary and populate trek information
    const itinerary = await Itinerary.findById(id).populate('trekId');
    
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }
    
    // Enhance trek data with price and name from itinerary if available
    const enhancedTrek = {
      ...itinerary.trekId.toObject(),
      price: itinerary.priceRange || itinerary.trekId.price || 'Contact for pricing',
      name: itinerary.trekName || itinerary.trekId.name
    };
    
    res.status(200).json({
      success: true,
      data: {
        trek: enhancedTrek,
        itinerary: itinerary.days
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};