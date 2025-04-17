import express from 'express';
import {
  getItineraryBySlug,
  createItinerary,
  updateItinerary,
  deleteItinerary,} from '../controllers/ItineraryController.js';
const router = express.Router();

router.get('/:slug', getItineraryBySlug);
router.post('/', createItinerary);
router.put('/:id', updateItinerary);
router.delete('/:id', deleteItinerary);

export default router;