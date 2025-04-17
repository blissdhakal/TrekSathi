import React, { useState, useEffect } from "react";

import {
  MapPin,
  ArrowRight,
  Shield,
  Truck,
  RefreshCcw,
  ShoppingBag,
  Calendar,
  Clock,
  Book,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios"; // Make sure to install axios if not already installed
import { useSelector } from "react-redux";
import ChatBotIcon from "@/components/ChatBotIcon";
import trekServices from "@/services/trekServices";
import { useNavigate } from "react-router-dom";
import journalServices from "@/services/journalServices";
import authService from "@/services/auth"; // Import authService

export default function UserHomePage() {
  const navigate = useNavigate();
  const username = useSelector((state) => state.auth.userData.fullName);

  // State for storing trek data from MongoDB
  const [destinations, setDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // Add current user state

  const [journalEntries, setJournalEntries] = useState([]);
  const [isJournalLoading, setIsJournalLoading] = useState(true);
  const [journalError, setJournalError] = useState(null);

  // Fetch destinations from the API
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setIsLoading(true);
        const response = await trekServices.getAllTreks();
        setDestinations(response);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching trek destinations:", err);
        setError("Failed to load destinations. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  useEffect(() => {
    const fetchJournalEntries = async () => {
      try {
        // Only fetch entries if user is logged in
        if (currentUser) {
          const entries = await journalServices.getUserJournalEntries(
            currentUser._id
          );
          console.log(entries);
          setJournalEntries(entries);
          setIsJournalLoading(false);
        }
      } catch (error) {
        console.error("Error fetching entries:", error);
      }
    };

    fetchJournalEntries();
  }, [currentUser]); // Re-fetch when currentUser changes
  // Get current user on component mount
  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setCurrentUser(userData.data); // Store user data
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    getUserData();
  }, []);

  // Modified to fetch only user's journal entries

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="fixed bottom-6 right-6 z-50">
        <ChatBotIcon />
      </div>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            Welcome back, {username}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Ready for your next mountain adventure?
          </p>
        </div>

        {/* Gear Advertisement Section */}
        <section className="mb-8 sm:mb-12">
          <div className="bg-yellow-50 dark:bg-gray-800 p-4 sm:p-6 lg:p-8 rounded-xl shadow-md">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center flex-1 gap-4 sm:gap-6">
                <img
                  src="/trekkinggear.jpg"
                  alt="Trekking Gear"
                  className="w-full sm:w-32 h-48 sm:h-32 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white">
                    Get Premium Trekking Gear from{" "}
                    <span className="text-[#6366f1] dark:text-blue-400 block sm:inline">
                      Mountain Equipment Nepal
                    </span>
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">
                    Exclusive 20% discount for registered trekkers. Premium
                    quality gear for your Himalayan adventures!
                  </p>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3">
                    <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                      <Shield className="w-4 h-4 mr-1" />
                      Quality Guaranteed
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                      <Truck className="w-4 h-4 mr-1" />
                      Free Delivery
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                      <RefreshCcw className="w-4 h-4 mr-1" />
                      Easy Returns
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto">
                <Button className="bg-[#6366f1] text-white hover:bg-blue-700 px-4 sm:px-6 py-2">
                  Shop Now <ShoppingBag className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className="text-[#6366f1] border-blue-600"
                >
                  View Catalog
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Trek Journal Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Your Trek Journal
            </h2>
            <Button
              variant="ghost"
              className="text-blue-600"
              onClick={() => navigate("/journal")}
            >
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          {isJournalLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : journalError ? (
            <div className="text-center py-4 text-red-500">{journalError}</div>
          ) : (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {journalEntries.slice(0, 3).map((entry) => (
                <Card
                  key={entry._id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {entry.name}
                        </h3>

                        <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                          {entry.description}
                        </p>
                      </div>
                      <Book className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    </div>
                    {entry.image && (
                      <img
                        src={entry.image}
                        alt={entry.name}
                        className="mt-4 w-full h-32 object-cover rounded"
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        {/* Recommended Treks Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Recommended Treks
            </h2>
          </div>
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366f1] mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading destinations...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4 bg-[#6366f1] hover:bg-blue-700"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map((destination) => (
                <Card
                  key={destination._id}
                  className="group overflow-hidden rounded-xl transition-all duration-300 hover:shadow-xl cursor-pointer"
                  onClick={() => navigate(`/details/${destination.slug}`)}
                >
                  <CardContent className="p-0 relative">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-bold mb-2">
                        {destination.name}
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 opacity-90">
                          <MapPin className="h-4 w-4" />
                          <span>{destination.location}</span>
                        </div>
                        <div className="text-sm opacity-90">
                          {destination.duration}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
