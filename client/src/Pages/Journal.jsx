import React, { useState, useEffect, useRef } from "react";
import MapComponent from "../components/MapComponent";
import journalServices from "@/services/journalServices";
import authService from "@/services/auth"; // Import authService

const Journal = () => {
  const [markers, setMarkers] = useState([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [newEntry, setNewEntry] = useState({
    position: [],
    name: "",
    description: "",
    image: "",
    locationName: "",
  });
  const [locationStatus, setLocationStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [colors, setColors] = useState({});
  const [scrollProgress, setScrollProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null); // Add current user state

  const scrollContainerRef = useRef(null);

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

  // Geocoding functions
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return data.display_name || "Unknown location";
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return "Location name not available";
    }
  };

  // Location handlers
  const getLocation = async () => {
    setLocationStatus("Fetching location...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newPosition = [
            Number(position.coords.latitude.toFixed(6)),
            Number(position.coords.longitude.toFixed(6)),
          ];

          try {
            const locationName = await reverseGeocode(...newPosition);
            setNewEntry((prev) => ({
              ...prev,
              position: newPosition,
              locationName,
            }));
            setLocationStatus(`Location captured: ${locationName}`);
          } catch (error) {
            setLocationStatus("Error getting location name");
          }
        },
        (error) => {
          console.error("Location error:", error);
          setLocationStatus("Error getting location - check permissions");
        }
      );
    } else {
      setLocationStatus("Geolocation not supported");
    }
  };

  // Journal entry handlers
  const handleAddJournal = async () => {
    if (!validateEntry()) return;

    // Ensure user is logged in
    if (!currentUser) {
      alert("You must be logged in to create a journal entry");
      return;
    }

    try {
      // Add user ID to the journal entry
      const entryWithUser = {
        ...newEntry,
        user: currentUser._id, // Include the user ID from current user
      };

      const newMarker = await journalServices.addJournalEntry(entryWithUser);
      setMarkers((prev) => [...prev, newMarker]);
      resetForm();
    } catch (error) {
      console.error("Error adding entry:", error);
      alert("Failed to save journal entry");
    }
  };

  const validateEntry = () => {
    if (!newEntry.position.length) {
      alert("Please select a location");
      return false;
    }
    if (!newEntry.name || !newEntry.description || !newEntry.image) {
      alert("Please fill all required fields");
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setNewEntry({
      position: [],
      name: "",
      description: "",
      image: "",
      locationName: "",
    });
    setSearchQuery("");
    setShowForm(false);
  };

  // Modified to fetch only user's journal entries
  useEffect(() => {
    const fetchJournalEntries = async () => {
      try {
        // Only fetch entries if user is logged in
        if (currentUser) {
          const entries = await journalServices.getUserJournalEntries(
            currentUser._id
          );
          if (Array.isArray(entries)) setMarkers(entries);
        }
      } catch (error) {
        console.error("Error fetching entries:", error);
      }
    };

    fetchJournalEntries();
  }, [currentUser]); // Re-fetch when currentUser changes

  const getAverageColor = (imageUrl, callback) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0, img.width, img.height);
      const imageData = context.getImageData(0, 0, img.width, img.height);
      const data = imageData.data;

      let r = 0,
        g = 0,
        b = 0;
      let totalPixels = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }

      r = Math.floor(r / totalPixels);
      g = Math.floor(g / totalPixels);
      b = Math.floor(b / totalPixels);

      // If the image is too white or there's an error, set the color to light gray
      if ((r > 240 && g > 240 && b > 240) || isNaN(r) || isNaN(g) || isNaN(b)) {
        callback("rgba(211, 211, 211, 0.2)");
      } else {
        callback(`rgba(${r}, ${g}, ${b}, 0.2)`);
      }
    };

    img.onerror = () => {
      // If image can't be loaded, set the color to light gray
      callback("rgba(211, 211, 211, 0.2)");
    };
  };

  const handleMarkerClick = (id) => {
    setSelectedMarkerId((prevId) => (prevId === id ? null : id));
  };

  useEffect(() => {
    markers.forEach((marker) => {
      getAverageColor(marker.image, (color) => {
        setColors((prevColors) => ({
          ...prevColors,
          [marker._id]: color, // Use _id instead of id
        }));
      });
    });
  }, [markers]);

  const handleScroll = () => {
    const scrollTop = scrollContainerRef.current.scrollTop;
    const scrollHeight = scrollContainerRef.current.scrollHeight;
    const clientHeight = scrollContainerRef.current.clientHeight;
    const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setScrollProgress(scrolled);
  };

  // Show login message if user is not logged in
  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <div className="text-center p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p className="mb-4">
            You need to be logged in to view and create journal entries.
          </p>
          {/* Add a link to your login page here */}
          <a
            href="/login"
            className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] bg-white">
      <div className="w-full md:w-1/4 p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4">My Journal Entries</h2>
        <div className="relative">
          <div
            className="absolute top-0 left-0 h-1 bg-blue-500"
            style={{ width: `${scrollProgress}%` }}
          ></div>
        </div>
        <div
          className="flex-1 overflow-y-auto no-scrollbar"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {Array.isArray(markers) && markers.length > 0 ? (
            markers.map((marker) => (
              <div
                key={marker._id}
                className={`bg-white p-4 mb-4 shadow rounded cursor-pointer flex ${
                  selectedMarkerId === marker._id
                    ? "border border-blue-500"
                    : ""
                }`}
                onClick={() => handleMarkerClick(marker._id)}
                style={{
                  backgroundColor:
                    colors[marker._id] || "rgba(211, 211, 211, 0.2)",
                }}
              >
                <img
                  src={marker.image}
                  alt={marker.name}
                  className="w-1/4 h-32 object-cover mb-2 mr-4"
                />
                <div className="w-3/4">
                  <h3 className="text-lg font-bold">{marker.name}</h3>
                  <p className="text-sm text-gray-600">{marker.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No journal entries yet. Create your first entry!
            </div>
          )}
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full bg-black text-white py-3 rounded-lg mb-2 hover:bg-gray-800 transition duration-300"
          >
            Add Journal
          </button>
        )}

        {showForm && (
          <div className="bg-white p-4 shadow rounded backdrop-filter backdrop-blur-lg bg-opacity-30">
            <h3 className="text-lg font-bold mb-2">Add Journal Entry</h3>
            <input
              type="text"
              placeholder="Name"
              value={newEntry.name}
              onChange={(e) =>
                setNewEntry({ ...newEntry, name: e.target.value })
              }
              className="w-full p-2 mb-2 border rounded"
              required
            />
            <textarea
              placeholder="Description"
              value={newEntry.description}
              onChange={(e) =>
                setNewEntry({ ...newEntry, description: e.target.value })
              }
              className="w-full p-2 mb-2 border rounded"
              required
            />
            <input
              type="file"
              onChange={(e) =>
                setNewEntry({ ...newEntry, image: e.target.files[0] })
              }
              className="w-full p-2 mb-2 border rounded"
              required
            />
            {/* Location status display */}
            <div className="mb-4">
              <button
                onClick={getLocation}
                className="w-full bg-black text-white py-4 rounded-3xl mb-2 hover:bg-gray-800 transition duration-300"
              >
                Use Current Location
              </button>
              {locationStatus && (
                <div className="text-sm p-2 bg-gray-100 rounded">
                  {locationStatus.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                if (!newEntry.position || newEntry.position.length !== 2) {
                  alert("Please get your location first!");
                  return;
                }
                if (
                  !newEntry.name ||
                  !newEntry.description ||
                  !newEntry.image
                ) {
                  alert("Please fill all required fields!");
                  return;
                }
                handleAddJournal();
              }}
              className="w-full bg-black text-white py-4 rounded-3xl hover:bg-gray-800 transition duration-300"
            >
              Create Journal
            </button>
          </div>
        )}
      </div>
      {/* Map component */}
      <div className="w-full md:w-3/4 h-full">
        <MapComponent
          markers={markers}
          selectedMarkerId={selectedMarkerId}
          onMarkerClick={handleMarkerClick}
        />
      </div>
    </div>
  );
};

export default Journal;
