import mongoose from 'mongoose';

// Helper function to convert slug to readable trek name
const slugToTrekName = (slug) => {
  if (!slug) return '';
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const activitySchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  transport: {
    type: String,
    required: true
  }
});

const mealLocationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Breakfast', 'Lunch', 'Dinner']
  },
  location: {
    type: String,
    required: true
  }
});

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  number: {
    type: String
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  }
});

const commentSchema = new mongoose.Schema({
  avatar: {
    type: String
  },
  text: {
    type: String,
    required: true
  }
});

const itineraryDaySchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  activities: [activitySchema],
  image: {
    type: String,
    required: true
  },
  distance: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  highlights: [String],
  difficulty: {
    type: String,
    required: true
  },
  elevation: {
    type: String,
    required: true
  },
  accommodation: {
    type: String
  },
  meals: {
    type: String
  },
  mealLocations: [mealLocationSchema],
  hotels: [hotelSchema],
  reviews: [String],
  comments: [commentSchema],
  transport: {
    type: String
  },
  additionalInfo: {
    type: String
  },
  safetyTips: {
    type: String
  }
});

const itinerarySchema = new mongoose.Schema({
  trekId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trek',
    required: true
  },
  trekName: {
    type: String,
    trim: true
  },
  priceRange: {
    type: String,
    default: 'Contact for pricing'
  },
  days: [itineraryDaySchema],
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  }
}, { timestamps: true });

// Pre-save middleware to generate trek name from slug if not provided
itinerarySchema.pre('save', function(next) {
  if (!this.trekName && this.slug) {
    this.trekName = slugToTrekName(this.slug);
  }
  next();
});

// Virtual for getting trek name from slug (in case it's needed dynamically)
itinerarySchema.virtual('generatedTrekName').get(function() {
  return slugToTrekName(this.slug);
});

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

export default Itinerary;