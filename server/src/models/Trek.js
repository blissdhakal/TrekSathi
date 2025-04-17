
import mongoose from 'mongoose';

const trekSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,  // URL or path to the image
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
  elevation: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  }
}, { timestamps: true });

trekSchema.pre("save", function(next) {
    if (!this.slug && this.name) {
      this.slug = slugify(this.name, { lower: true });
    }
    next();
  });

const Trek = mongoose.model('Trek', trekSchema);

export default Trek;