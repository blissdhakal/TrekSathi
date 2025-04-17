import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  FaBus,
  FaHotel,
  FaStar,
  FaWalking,
  FaMountain,
  FaUtensils,
  FaMapMarkerAlt,
  FaBed,
} from "react-icons/fa";
import {
  Download,
  Phone,
  Calendar,
  ArrowRight,
  CheckCircle,
  Award,
  Map as MapIcon,
  ChevronDown,
  Info,
  AlertTriangle,
  Clock,
  Sun,
} from "lucide-react";
const API_URL = import.meta.env.VITE_BACKEND_URL;

import ChatBotIcon from "@/components/ChatBotIcon";
import { pdfDownload } from "@/lib/pdfDownload";

import { motion, AnimatePresence } from "framer-motion";

const TrekItinerary = () => {
  const [expandedDays, setExpandedDays] = useState([]);
  const [itinerary, setItinerary] = useState(null);
  const { slug } = useParams();

  useEffect(() => {
    console.log("Trek slug received:", slug);
    fetchItinerary(slug);
  }, [slug]);

  const fetchItinerary = async (slug) => {
    try {
      console.log("Fetching itinerary for slug:", slug);
      const response = await fetch(`${API_URL}/itinerary/${slug}`);
      const responseData = await response.json();
      console.log("Fetched itinerary data:", responseData);

      if (responseData.success && responseData.data) {
        // Create a proper itinerary object with the days array and trek info
        const itineraryData = {
          ...responseData.data.trek, // Include trek information like title, price, etc.
          days: responseData.data.itinerary, // Set the days array from the API response
        };
        setItinerary(itineraryData);
      } else {
        console.error("Invalid data format received from API");
      }
    } catch (error) {
      console.error("Error fetching itinerary:", error);
    }
  };

  const toggleDay = (day) => {
    setExpandedDays((prevExpandedDays) => {
      if (prevExpandedDays.includes(day)) {
        return prevExpandedDays.filter((expandedDay) => expandedDay !== day);
      } else {
        return [...prevExpandedDays, day];
      }
    });
  };

  if (!itinerary) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gradient-to-b pt-16 from-sky-50 via-indigo-50 to-white min-h-screen">
      <div className="fixed bottom-6 right-6 z-50">
        <ChatBotIcon />
      </div>

      <div className="container max-w-7xl  rounded-t-3xl mx-auto py-8 px-4 sm:px-6">
        <section className="max-w-7xl mx-auto mb-8 md:mb-12 text-center flex flex-col md:flex-row justify-between items-center gap-4">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-4 md:mb-0"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
              {itinerary.name} {"Itinerary"}
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <span className="inline-block bg-gradient-to-r from-green-500 to-emerald-400 text-white font-semibold px-6 py-2 rounded-full shadow-lg text-sm sm:text-base">
              Price: {itinerary.price}
            </span>
          </motion.div>
        </section>

        <section className="mb-20">
          <div className="relative">
            <div className="relative">
              {/* Timeline */}
              <div className="absolute w-1.5 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-full top-12 bottom-0 transform translate-x-6"></div>

              {/* Timeline Marker */}
              <div className="absolute hidden md:block bottom-0 z-10">
                <div className="w-14 h-14 bg-gradient-to-r  flex from-indigo-500 to-blue-500 rounded-full  items-center justify-center shadow-lg">
                  <div className="bg-white rounded-full p-2">
                    <MapIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
              </div>

              {itinerary.days.map((day, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.8 }}
                  key={index}
                  className="relative mb-16"
                >
                  <div className="flex flex-row items-stretch">
                    {/* Day Indicator */}
                    <div className="w-24  md:block hidden relative">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-lg z-10">
                        {day.day}
                      </div>
                    </div>

                    {/* Content Box */}
                    <div className="flex-1">
                      <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 h-full transform hover:-translate-y-1 border border-gray-100">
                        <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden">
                          <img
                            src={day.image}
                            alt={`Day ${day.day}`}
                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-indigo-600" />
                              <span className="font-bold text-indigo-700">
                                Day {day.day}
                              </span>
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent py-4 px-4">
                            <div className="flex justify-between items-center text-white">
                              <div className="flex items-center gap-2">
                                <FaWalking className="text-white" />
                                <span className="text-sm md:text-base">
                                  {day.distance}
                                </span>
                                <span className="text-white/50">•</span>
                                <Clock className="h-3.5 w-3.5" />
                                <span className="text-sm md:text-base">
                                  {day.duration}
                                </span>
                              </div>
                              <span className="bg-indigo-500/80 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium">
                                {day.difficulty}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 sm:p-6 md:p-7">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
                              {day.title}
                            </h3>
                          </div>

                          {/* Highlights */}
                          <div className="mb-5">
                            <div className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                              <Sun className="h-4 w-4 mr-1.5 text-amber-500" />
                              Highlights:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {day.highlights.map((highlight, idx) => (
                                <span
                                  key={idx}
                                  className="bg-blue-50 text-blue-700 text-xs md:text-sm px-3 py-1.5 rounded-full border border-blue-100 shadow-sm"
                                >
                                  {highlight}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Activities */}
                          <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                            {day.activities.map((activity, idx) => (
                              <div
                                key={idx}
                                className="pb-3 border-b border-gray-100 last:border-0 last:pb-0"
                              >
                                <p className="text-gray-700 font-medium mb-2">
                                  {activity.description}
                                </p>
                                <div className="flex flex-wrap gap-3">
                                  {activity.transport && (
                                    <div className="flex items-center text-sm text-gray-600 bg-white px-3 py-1 rounded-lg shadow-sm">
                                      <FaBus className="mr-1.5 text-indigo-500" />
                                      <span>{activity.transport}</span>
                                    </div>
                                  )}
                                  {activity.hotel && (
                                    <div className="flex items-center text-sm text-gray-600 bg-white px-3 py-1 rounded-lg shadow-sm">
                                      <FaHotel className="mr-1.5 text-indigo-500" />
                                      <span>{activity.hotel}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => toggleDay(day.day)}
                            className="mt-5 text-indigo-600 font-medium hover:text-indigo-800  flex items-center gap-1 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-all"
                          >
                            {expandedDays.includes(day.day)
                              ? "Show Less"
                              : "View Details"}
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                expandedDays.includes(day.day)
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </button>

                          {/* Expanded Content */}
                          <AnimatePresence>
                            {expandedDays.includes(day.day) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-5 mt-5 border-t border-gray-100">
                                  <h4 className="text-lg font-semibold text-gray-800 mb-4 bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
                                    Detailed Information
                                  </h4>

                                  {/* Additional details from DetailedItinerary */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    <div className="flex items-start bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                      <FaMountain className="mr-3 text-blue-600 mt-1 flex-shrink-0 text-lg" />
                                      <div>
                                        <span className="font-medium block text-gray-800">
                                          Elevation
                                        </span>
                                        <span className="text-gray-600">
                                          {day.elevation}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-start bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                      <FaBed className="mr-3 text-blue-600 mt-1 flex-shrink-0 text-lg" />
                                      <div>
                                        <span className="font-medium block text-gray-800">
                                          Accommodation
                                        </span>
                                        <span className="text-gray-600">
                                          {day.accommodation}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-start bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                      <FaUtensils className="mr-3 text-blue-600 mt-1 flex-shrink-0 text-lg" />
                                      <div>
                                        <span className="font-medium block text-gray-800">
                                          Meals
                                        </span>
                                        <span className="text-gray-600">
                                          {day.meals}
                                        </span>
                                      </div>
                                    </div>
                                    {day.transport && (
                                      <div className="flex items-start bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                        <FaBus className="mr-3 text-blue-600 mt-1 flex-shrink-0 text-lg" />
                                        <div>
                                          <span className="font-medium block text-gray-800">
                                            Transport
                                          </span>
                                          <span className="text-gray-600">
                                            {day.transport}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Description */}
                                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                                    <p className="text-gray-600">
                                      {day.additionalInfo}
                                    </p>
                                  </div>

                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Meal Locations */}
                                    <div className="mb-4">
                                      <h5 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                                        <FaUtensils className="mr-2 text-blue-600" />
                                        Meal Locations
                                      </h5>
                                      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                        <ul className="space-y-2.5">
                                          {day.mealLocations.map(
                                            (meal, idx) => (
                                              <li
                                                key={idx}
                                                className="flex items-center text-sm text-gray-600 p-2 border-b border-gray-50 last:border-0"
                                              >
                                                <div className="p-1.5 bg-blue-50 rounded-md mr-3">
                                                  <FaMapMarkerAlt className="text-blue-600 flex-shrink-0" />
                                                </div>
                                                <span>
                                                  <strong className="font-semibold">
                                                    {meal.type}:
                                                  </strong>{" "}
                                                  {meal.location}
                                                </span>
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      </div>
                                    </div>

                                    {/* Hotels/Accommodation */}
                                    {day.hotels && day.hotels.length > 0 && (
                                      <div className="mb-4">
                                        <h5 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                                          <FaHotel className="mr-2 text-blue-600" />
                                          Accommodations
                                        </h5>
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                          <ul className="space-y-3">
                                            {day.hotels.map((hotel, idx) => (
                                              <li
                                                key={idx}
                                                className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                              >
                                                <div className="font-semibold text-gray-800 mb-1">
                                                  {hotel.name}
                                                </div>
                                                <div className="text-gray-600 mb-1 flex items-center text-sm">
                                                  <Phone className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                                                  {hotel.number}
                                                </div>
                                                <div className="flex items-center">
                                                  {[...Array(5)].map((_, i) => (
                                                    <FaStar
                                                      key={i}
                                                      className={`h-3.5 w-3.5 ${
                                                        i < hotel.rating
                                                          ? "text-yellow-500"
                                                          : "text-gray-300"
                                                      }`}
                                                    />
                                                  ))}
                                                </div>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Reviews/Comments */}
                                  {(day.reviews?.length > 0 ||
                                    day.comments?.length > 0) && (
                                    <div className="mb-6">
                                      <h5 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                                        <Award className="mr-2 h-4 w-4 text-blue-600" />
                                        Trekker Insights
                                      </h5>
                                      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                        {day.reviews?.length > 0 && (
                                          <div className="mb-3">
                                            <ul className="space-y-2">
                                              {day.reviews.map(
                                                (review, idx) => (
                                                  <li
                                                    key={idx}
                                                    className="text-gray-600 text-sm flex items-start p-2 border-b border-gray-50 last:border-0"
                                                  >
                                                    <span className="text-blue-600 mr-2 mt-0.5">
                                                      ➤
                                                    </span>
                                                    {review}
                                                  </li>
                                                )
                                              )}
                                            </ul>
                                          </div>
                                        )}
                                        {day.comments?.length > 0 && (
                                          <div className="space-y-3">
                                            {day.comments.map(
                                              (comment, idx) => (
                                                <div
                                                  key={idx}
                                                  className="flex items-start bg-gray-50 p-3 rounded-lg text-sm"
                                                >
                                                  <div className="w-8 h-8 rounded-full bg-blue-500 mr-3 flex-shrink-0 flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">
                                                      T
                                                    </span>
                                                  </div>
                                                  <p className="text-gray-700 pt-0.5">
                                                    {comment.text}
                                                  </p>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Safety Tips */}
                                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                                    <div className="flex items-start gap-3">
                                      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                      <p className="text-sm text-gray-700">
                                        {day.safetyTips ||
                                          "Be prepared for changing weather conditions. Carry extra layers, sunscreen, and sufficient water."}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <div>
        <section className="max-w-7xl mx-auto mb-20 px-4 sm:px-6">
          <div className="bg-white rounded-b-3xl p-5 sm:p-8 md:p-10 shadow-xl">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                <Phone className="h-7 w-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent">
                Emergency Information
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
                Your safety is our top priority. Download our emergency contact
                list for quick access during your trek.
              </p>
            </motion.div>

            <div className="flex flex-col lg:flex-row items-stretch justify-center gap-6">
              <div className="lg:w-1/2">
                <div className="bg-gray-50 rounded-xl p-5 h-full shadow-md border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Info className="h-5 w-5 text-red-600 mr-2" />
                    Key Emergency Numbers
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="bg-gradient-to-r from-red-500 to-red-600 p-2.5 rounded-full mr-4 shadow-sm">
                        <Phone className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          Mountain Rescue
                        </div>
                        <div className="font-semibold text-lg">
                          +977 9841234567
                        </div>
                      </div>
                    </li>
                    <li className="flex items-center bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2.5 rounded-full mr-4 shadow-sm">
                        <Phone className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          Trek Guide
                        </div>
                        <div className="font-semibold text-lg">
                          +977 9807654321
                        </div>
                      </div>
                    </li>
                    <li className="flex items-center bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 p-2.5 rounded-full mr-4 shadow-sm">
                        <Phone className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          Local Police
                        </div>
                        <div className="font-semibold text-lg">
                          +977 9812345678
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="lg:w-1/2">
                <div className="bg-gray-50 p-5 rounded-xl mb-5 shadow-md border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    Safety Tips
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <li className="flex items-start bg-white p-3 rounded-lg shadow-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">
                        Always trek with a companion or guide
                      </span>
                    </li>
                    <li className="flex items-start bg-white p-3 rounded-lg shadow-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">
                        Carry sufficient water and stay hydrated
                      </span>
                    </li>
                    <li className="flex items-start bg-white p-3 rounded-lg shadow-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">
                        Respect altitude and acclimatize properly
                      </span>
                    </li>
                    <li className="flex items-start bg-white p-3 rounded-lg shadow-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">
                        Inform someone of your trekking plans
                      </span>
                    </li>
                    <li className="flex items-start bg-white p-3 rounded-lg shadow-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">
                        Carry a basic first aid kit and know how to use it
                      </span>
                    </li>
                  </ul>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={pdfDownload}
                  className="group flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 w-full justify-center"
                >
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">
                    Download Emergency Contacts
                  </span>
                  <Download className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                </motion.button>
              </div>
            </div>
          </div>
        </section>

        {/* Advertisement Section */}
        <section className="max-w-7xl mx-auto mb-16 px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-xl shadow-2xl">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1533234427049-9e9bb093186d?q=80&w=1000&auto=format&fit=crop')",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-700/95 to-blue-700/90"></div>
            </div>

            <div className="relative p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center">
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="md:w-2/3 text-white mb-8 md:mb-0 md:pr-6"
              >
                <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
                  <Award className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">
                    Premium Experience
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                  Experience the Ultimate Himalayan Adventure
                </h3>
                <p className="mb-6 text-white/90 text-sm sm:text-base leading-relaxed max-w-2xl">
                  Book your Annapurna Base Camp trek with experienced guides,
                  comfortable accommodations, and all-inclusive packages. Create
                  memories that will last a lifetime in the heart of the
                  Himalayas.
                </p>
                <div className="flex items-center space-x-4 flex-wrap gap-y-3">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <motion.img
                        key={i}
                        whileHover={{ y: -3 }}
                        src={`https://randomuser.me/api/portraits/men/${
                          20 + i
                        }.jpg`}
                        className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-md"
                        alt="Happy Trekker"
                      />
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <FaStar key={i} className="text-amber-400 w-4 h-4" />
                      ))}
                    </div>
                    <div className="text-white text-xs sm:text-sm">
                      4.9 (3,500+ reviews)
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 30, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="md:w-1/3 w-full"
              >
                <div className="bg-white p-6 rounded-xl shadow-2xl">
                  <h4 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
                    Book Your Trek Today
                  </h4>
                  <div className="bg-indigo-50 text-indigo-800 text-sm font-semibold px-4 py-2 rounded-lg mb-4 border border-indigo-100">
                    20% early bird discount for bookings made 3+ months in
                    advance!
                  </div>
                  <p className="text-gray-600 text-sm mb-5">
                    Free hotel night in Kathmandu included with every booking!
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 px-4 rounded-lg shadow-md hover:shadow-xl transition-all w-full font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    Reserve Your Spot
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TrekItinerary;
