
import React, { useState } from "react";
import {
  FaMountain,
  FaWalking,
  FaBed,
  FaBus,
  FaUtensils,
  FaMapMarkerAlt,
  FaStar,
} from "react-icons/fa";
import { ArrowLeft } from "lucide-react";
import mardi from "../assets/mardi.jpg";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Link, Navigate, useNavigate } from "react-router-dom";
import ChatBotIcon from "@/components/ChatBotIcon";

const DetailedItinerary = () => {
  const exampleHotels = [
    { name: "Hotel Machhapuchhre", number: "9860000000", rating: 4.5 },
    { name: "Hotel Annapurna", number: "9877000006", rating: 4.0 },
  ];

  const detailedItinerary = [
    {
      day: 1,
      title: "Arrive in Pokhara",
      description:
        "Arrive in Pokhara, the gateway to the Annapurna region. Enjoy the beautiful lakeside city and prepare for your trek.",
      elevation: "827m",
      distance: "N/A",
      accommodation: "Hotel in Pokhara",
      meals: "Welcome Dinner",
      image:
        "https://www.acethehimalaya.com/wp-content/uploads/2024/02/things-to-do-in-pokhara.jpg.webp",
      mealLocations: [
        { type: "Breakfast", location: "Pokhara Lakeside" },
        { type: "Lunch", location: "Pokhara Restaurant" },
        { type: "Dinner", location: "Hotel Restaurant" },
      ],
      hotels: exampleHotels,
      reviews: ["Great experience!", "Lovely place."],
      comments: [
        {
          avatar: "https://via.placeholder.com/40",
          text: "Amazing trek!",
        },
      ],
      transport: "Bus 9800000000, Jeep 9800000009",
    },
    {
      day: 2,
      title: "Drive to Kande and Trek to Forest Camp",
      description:
        "After a short drive to Kande, begin your trek through rhododendron forests to reach Forest Camp.",
      elevation: "2,520m",
      distance: "5-6 hours",
      accommodation: "Tea House",
      meals: "Breakfast, Lunch, Dinner",
      image:
        "https://missionhimalayatreks.com/wp-content/uploads/2022/12/View-Of-Forest-Camp-Mardi-Himal-Treks.webp",
      mealLocations: [
        { type: "Breakfast", location: "Forest Camp" },
        { type: "Lunch", location: "Forest Camp" },
        { type: "Dinner", location: "Forest Camp" },
      ],
      hotels: exampleHotels,
      reviews: ["Beautiful forest!", "Great hike."],
      comments: [
        {
          avatar: "https://via.placeholder.com/40",
          text: "Stunning views!",
        },
      ],
      transport: "Jeep ",
    },
    {
      day: 3,
      title: "Trek to Low Camp",
      description:
        "Continue trekking through the forest, passing beautiful rhododendrons and enjoying the serene ambiance to reach Low Camp.",
      elevation: "2,970m",
      distance: "5-6 hours",
      accommodation: "Tea House",
      meals: "Breakfast, Lunch, Dinner",
      image:
        "https://mountainroutes.com/wp-content/uploads/2024/10/View-from-Low-Camp-on-Mardi-Trek-2022.jpg",
      mealLocations: [
        { type: "Breakfast", location: "Low Camp" },
        { type: "Lunch", location: "Low Camp" },
        { type: "Dinner", location: "Low Camp" },
      ],
      hotels: exampleHotels,
      reviews: ["Nice place to rest!", "Friendly people."],
      comments: [
        {
          avatar: "https://via.placeholder.com/40",
          text: "Loved the tranquility!",
        },
      ],
      transport: "On foot",
    },
    {
      day: 4,
      title: "Trek to High Camp",
      description:
        "Ascend to High Camp, where you'll get the first spectacular views of the Annapurna range and Machhapuchhre.",
      elevation: "3,580m",
      distance: "4-5 hours",
      accommodation: "Tea House",
      meals: "Breakfast, Lunch, Dinner",
      image:
        "https://nepalbasecamptreks.com/wp-content/uploads/2024/07/mardi-himal-trek.webp",
      mealLocations: [
        { type: "Breakfast", location: "High Camp" },
        { type: "Lunch", location: "High Camp" },
        { type: "Dinner", location: "High Camp" },
      ],
      hotels: exampleHotels,
      reviews: ["Breathtaking views!", "Great place to acclimatize."],
      comments: [
        {
          avatar: "https://via.placeholder.com/40",
          text: "Incredible mountain scenery!",
        },
      ],
      transport: "On foot",
    },
    {
      day: 5,
      title: "Summit Mardi Himal Base Camp and Return to High Camp",
      description:
        "Early morning trek to Mardi Himal Base Camp to witness the sunrise over the Himalayas, then return to High Camp.",
      elevation: "4,500m",
      distance: "7-8 hours",
      accommodation: "Tea House",
      meals: "Breakfast, Lunch, Dinner",
      image:
        "https://media.nepaltrekadventures.com/uploads/img/mardi-himal-trek-banner.webp",
      mealLocations: [
        { type: "Breakfast", location: "Mardi Himal Base Camp" },
        { type: "Lunch", location: "High Camp" },
        { type: "Dinner", location: "High Camp" },
      ],
      hotels: exampleHotels,
      reviews: ["Amazing trek to the top!", "Unforgettable experience."],
      comments: [
        {
          avatar: "https://via.placeholder.com/40",
          text: "A trekker's dream come true!",
        },
      ],
      transport: "On foot",
    },
    {
      day: 6,
      title: "Trek to Siding Village",
      description:
        "Descend through the forest and terraced fields to reach the traditional village of Siding.",
      elevation: "1,750m",
      distance: "6-7 hours",
      accommodation: "Home Stay",
      meals: "Breakfast, Lunch, Dinner",
      image:
        "https://www.nepalglaciertreks.com/uploads/gallery/mardi-himal-trekking-route.jpg",
      mealLocations: [
        { type: "Breakfast", location: "High Camp" },
        { type: "Lunch", location: "On the trail" },
        { type: "Dinner", location: "Siding Village Homestay" },
      ],
      hotels: exampleHotels,
      reviews: ["Warm hospitality!", "Beautiful village."],
      comments: [
        {
          avatar: "https://via.placeholder.com/40",
          text: "Loved the local culture!",
        },
      ],
      transport: "On foot",
    },
    {
      day: 7,
      title: "Trek to Lumre and Drive to Pokhara",
      description:
        "Finish the trek with a gentle walk to Lumre, followed by a drive back to Pokhara.",
      elevation: "827m",
      distance: "3-4 hours trek, 2 hours drive",
      accommodation: "Hotel in Pokhara",
      meals: "Breakfast, Lunch",
      image: "/images/drive-to-pokhara.jpg",
      mealLocations: [
        { type: "Breakfast", location: "Siding Village" },
        { type: "Lunch", location: "On the trail" },
        { type: "Dinner", location: "Pokhara Restaurant" },
      ],
      hotels: exampleHotels,
      reviews: ["Great end to the trek!", "Relaxing return journey."],
      comments: [
        {
          avatar: "https://via.placeholder.com/40",
          text: "What an adventure!",
        },
      ],
      transport: "On foot, Bus 9800000000",
    },
    {
      day: 8,
      title: "Departure from Pokhara",
      description: "After breakfast at your hotel, enjoy some free time for last-minute shopping or relaxation by the Phewa Lake. Depart from Pokhara according to your onward travel schedule.",
      elevation: "827m",
      distance: "City distances",
      accommodation: "Not included - departure day",
      meals: "Breakfast",
      image: "https://www.acethehimalaya.com/wp-content/uploads/2024/02/things-to-do-in-pokhara.jpg.webp",
      mealLocations: [
        { type: "Breakfast", location: "Hotel Restaurant" }
      ],
      hotels: exampleHotels,
      reviews: [
        "Sad to leave!", 
        "Great memories.",
        "Perfect end to the trek"
      ],
      comments: [
        {
          avatar: "https://via.placeholder.com/40",
          text: "Can't wait to come back!"
        },
        {
          avatar: "https://via.placeholder.com/40",
          text: "Beautiful last morning in Pokhara"
        }
      ],
      transport: "Taxi 9800000001, Tourist Bus 9800000002" 
    }
  ];
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const handleNextPage = () => {
    if (currentPage < detailedItinerary.length) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      Navigate("/trekdetails");
    }
  };
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const currentDay = detailedItinerary[currentPage - 1];

  return (
    <div className="container mx-auto p-6 max-w-2xl bg-white shadow-lg rounded-lg">
      {/* back Section */}
      <div className="fixed bottom-6 right-6 z-50">
        <ChatBotIcon />
      </div>
      <Link
        to="/trekdetails"
        className="p-2 hover:bg-white/50 rounded-full transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
        Detailed Itinerary
      </h1>
      <div className="progress-bar bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{
            width: `${(currentPage / detailedItinerary.length) * 100}%`,
          }}
        ></div>
      </div>

      <Card className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <CardHeader className="bg-blue-600 text-white py-4 px-6 flex justify-between items-center">
          <h3 className="text-2xl font-semibold">
            Day {currentDay.day}: {currentDay.title}
          </h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <img
              src={currentDay.image}
              alt={`Day ${currentDay.day} - ${currentDay.title}`}
              className="rounded-lg object-cover w-full h-full"
            />
          </div>
          <p className="text-gray-700 mb-4">{currentDay.description}</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-gray-600">
              <FaMountain className="mr-2 text-blue-600" />
              <span>Elevation: {currentDay.elevation}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FaWalking className="mr-2 text-blue-600" />
              <span>Distance: {currentDay.distance}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FaBed className="mr-2 items-top text-blue-600" />
              <span>Accommodation: {currentDay.accommodation}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FaUtensils className="mr-2 text-blue-600" />
              <span>Meals: {currentDay.meals}</span>
            </div>
            {currentDay.transport && (
              <div className="flex text-gray-600">
                <FaBus className="mr-2 items-top my-1.5 text-blue-600" />
                <span>Transport: {currentDay.transport}</span>
              </div>
            )}
          </div>

          {/* Meal Locations */}
          <div className="mb-6">
            <h4 className="text-xl font-semibold text-gray-700 mb-2">
              Meal Locations
            </h4>
            <ul className="space-y-2">
              {currentDay.mealLocations.map((meal, idx) => (
                <li key={idx} className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="mr-2 text-blue-600" />
                  <span>
                    <strong>{meal.type}:</strong> {meal.location}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hotels */}
          <div className="mb-6">
            <h4 className="text-xl font-semibold text-gray-700 mb-2">Hotels</h4>
            <ul className="space-y-2">
              {currentDay.hotels.map((hotel, idx) => (
                <li key={idx} className="text-gray-700">
                  <strong>{hotel.name}:</strong> {hotel.number}
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={
                          i < hotel.rating ? "text-yellow-500" : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Reviews */}
          <div className="mb-6">
            <h4 className="text-xl font-semibold text-gray-700 mb-2">
              Reviews
            </h4>
            <ul className="space-y-2">
              {currentDay.reviews.map((review, idx) => (
                <li key={idx} className="text-gray-700">
                  {review}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <button
          className="bg-gray-300 text-gray-700 py-2 px-4 rounded shadow"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <button
          className="bg-blue-600 text-white py-2 px-4 rounded shadow "
          onClick={handleNextPage}
          // disabled={currentPage === detailedItinerary.length}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DetailedItinerary;
