import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Import icons
import {
  Users,
  Map,
  BookOpen,
  Camera,
  MessageCircle,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  Calendar,
  Mountain,
  Heart,
  Twitter,
  Star,
  ArrowUpRight,
} from "lucide-react";

const Home = () => {
  const [scrollY, setScrollY] = useState(0);

  // Track scroll for parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const fadeInUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // Features data
  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Find Trek Companions",
      description:
        "Connect with like-minded trekkers and make new friends for your next adventure.",
      color:
        "bg-blue-600/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
    },
    {
      icon: <Map className="h-6 w-6" />,
      title: "Trek Itineraries",
      description:
        "Create detailed itineraries or join existing ones for popular treks across Nepal.",
      color:
        "bg-emerald-600/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Trekking Journal",
      description:
        "Document your adventures, share photos, and keep memories alive with a personal trek journal.",
      color:
        "bg-amber-600/10 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
    },
    {
      icon: <Camera className="h-6 w-6" />,
      title: "Photo Sharing",
      description:
        "Upload and share your best trekking photos with the community.",
      color:
        "bg-purple-600/10 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Community Forums",
      description:
        "Discuss routes, equipment, and experiences with the Trek Sathi community.",
      color:
        "bg-rose-600/10 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Group Planning",
      description:
        "Plan group treks with integrated calendars, checklists, and coordination tools.",
      color:
        "bg-indigo-600/10 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
    },
  ];

  // Popular treks data
  const popularTreks = [
    {
      id: 1,
      name: "Everest Base Camp",
      image: "/everest.jpg",
      duration: "14 days",
      difficulty: "Challenging",
      elevation: "5,364m",
      groups: 8,
      rating: 4.9,
    },
    {
      id: 2,
      name: "Annapurna Circuit",
      image: "/abc.jpg",
      duration: "18 days",
      difficulty: "Moderate",
      elevation: "5,416m",
      groups: 12,
      rating: 4.8,
    },
    {
      id: 3,
      name: "Langtang Valley",
      image: "/langtang.jpg",
      duration: "7 days",
      difficulty: "Moderate",
      elevation: "3,870m",
      groups: 6,
      rating: 4.7,
    },
  ];

  const CountUp = ({ end, duration = 2, delay = 0 }) => {
    const [count, setCount] = useState(0);
    const nodeRef = useRef(null);
    const inView = useInView(nodeRef, { once: true, amount: 0.5 });
    const valueText = end.toString();
    const isNumeric = !isNaN(parseInt(valueText));
    const numericValue = isNumeric ? parseInt(valueText) : 0;
    const suffix = isNumeric ? valueText.replace(/[0-9]/g, "") : valueText;

    useEffect(() => {
      if (!inView) return;

      let startTime;
      let animationFrame;

      const updateCount = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / (duration * 1000), 1);

        if (isNumeric) {
          setCount(Math.floor(percentage * numericValue));
        } else {
          setCount(percentage);
        }

        if (percentage < 1) {
          animationFrame = requestAnimationFrame(updateCount);
        }
      };

      // Start animation after delay
      const timer = setTimeout(() => {
        animationFrame = requestAnimationFrame(updateCount);
      }, delay * 1000);

      return () => {
        clearTimeout(timer);
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }, [inView, duration, delay, numericValue, isNumeric]);

    return (
      <span ref={nodeRef} className="inline-block">
        {isNumeric ? count + suffix : valueText}
      </span>
    );
  };

  // Stats data
  const stats = [
    { label: "Active Trekkers", value: "5,000+" },
    { label: "Treks Completed", value: "1,200+" },
    { label: "Trek Routes", value: "50+" },
    { label: "Success Rate", value: "98%" },
  ];

  const teamMembers = [
    {
      name: "Bliss Dhakal",
      role: "Lead Developer",
      image: "/bliss-dhakal.jpg",
      bio: "Computer Science enthusiast specializing in backend development",
      social: {
        github: "#",
        linkedin: "#",
        twitter: "#",
      },
    },
    {
      name: "Pratima Budha Magar",
      role: "UI/UX Designer",
      image: "/pratima-budha-magar.jpg",
      bio: "Passionate about creating beautiful, user-friendly interfaces",
      social: {
        github: "#",
        linkedin: "#",
        twitter: "#",
      },
    },
    {
      name: "Seema Thapa",
      role: "Frontend Developer",
      image: "/seema-thapa.jpg",
      bio: "Creates responsive and interactive web experiences",
      social: {
        github: "#",
        linkedin: "#",
        twitter: "#",
      },
    },
  ];

  return (
    <div className=" min-h-screen overflow-x-hidden font-sans">
      <section className="relative min-h-screen flex items-center  overflow-hidden">
        <motion.div
          className="absolute inset-0 z-[-1]"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10 }}
        >
          <img
            src="hero.png"
            className="w-full h-full object-cover"
            alt="Beautiful mountains of Nepal"
            style={{
              transform: `translateY(${scrollY * 0.2}px)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/60 via-blue-800/40 to-transparent"></div>
        </motion.div>
        <div className="max-w-7xl container  px-4 sm:px-6 lg:px-8 py-24 md:py-32 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20"
            >
              Nepal's #1 Trekking Community Platform
            </motion.span>
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Find Your{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Trekking Companions</span>
                <span className="absolute -bottom-2 left-0 w-full h-3 bg-yellow-400 z-0"></span>
              </span>
            </motion.h1>
            <motion.p
              className="text-xl text-gray-100 mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              Trek Sathi connects adventure-seekers across Nepal. Plan journeys,
              form groups, and create unforgettable memories together in the
              Himalayas.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <Link
                to="/signup"
                className="group relative bg-white hover:bg-blue-50 text-blue-600 hover:text-white transition delay-100 font-medium px-8 py-4 rounded-xl text-center shadow-lg flex items-center justify-center overflow-hidden"
              >
                <span className="relative z-10 flex items-center transition-transform duration-300 group-hover:translate-x-1">
                  Get Started
                  <ArrowUpRight className="ml-2 h-5 w-5 transition-transform duration-300" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 group-hover:duration-500"></span>
              </Link>
              {/* <Link
                to="/discover"
                className="relative overflow-hidden bg-transparent border border-white/30 backdrop-blur-sm hover:border-white/60 text-white font-medium px-8 py-4 rounded-xl text-center transition-all duration-300 hover:bg-white/10"
              >
                <span className="relative z-10 flex items-center">
                  Explore Treks
                  <ChevronRight className="ml-1 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link> */}
            </motion.div>

            {/* Subtle floating mountain shapes */}
            <motion.div
              className="absolute -right-10 top-20 opacity-20 w-64 h-64"
              animate={{
                y: [0, -15, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path
                  fill="#FFFFFF"
                  d="M41.9,-65.7C51.1,-55,52.9,-37.7,57.4,-22.3C61.9,-7,69,6.4,67.8,18.8C66.5,31.2,56.9,42.5,45.4,51.8C33.8,61.1,20.3,68.3,4.2,65.5C-11.9,62.7,-30.7,49.9,-45.3,35.7C-59.9,21.5,-70.4,5.9,-70.6,-10.5C-70.8,-26.9,-60.6,-44.1,-46.6,-54.8C-32.6,-65.6,-14.8,-69.9,1.6,-72C18,-74.1,32.7,-76.3,41.9,-65.7Z"
                  transform="translate(100 100)"
                />
              </svg>
            </motion.div>

            <motion.div
              className="absolute -left-20 bottom-20 opacity-10 w-96 h-96"
              animate={{
                y: [0, 20, 0],
                rotate: [0, -8, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path
                  fill="#FFFFFF"
                  d="M45.3,-77.6C59.9,-71,73.8,-61.2,80.2,-47.8C86.6,-34.4,85.6,-17.2,83.2,-1.4C80.9,14.5,77.2,28.9,70.1,42C63,55.1,52.5,66.8,39.5,75.3C26.6,83.7,11.3,88.9,-2.1,92C-15.5,95,-31,96.1,-41,89C-51,81.9,-55.6,66.7,-60.5,53.2C-65.5,39.7,-70.7,27.8,-75.1,14.3C-79.4,0.7,-82.9,-14.5,-78.3,-26.6C-73.7,-38.7,-61,-47.8,-47.5,-54.6C-33.9,-61.3,-19.5,-65.8,-3.2,-60.9C13,-56.1,30.6,-84.1,45.3,-77.6Z"
                  transform="translate(100 100)"
                />
              </svg>
            </motion.div>
          </motion.div>
        </div>
        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, 10, 0],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <div className="flex flex-col items-center text-white">
            <span className="text-sm font-light tracking-widest opacity-70">
              SCROLL
            </span>
            <svg
              className="w-6 h-10 mt-2"
              viewBox="0 0 24 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="1"
                y="1"
                width="22"
                height="38"
                rx="11"
                stroke="white"
                strokeWidth="2"
                strokeOpacity="0.3"
              />
              <circle
                className="animate-bounce"
                cx="12"
                cy="24"
                r="4"
                fill="white"
              />
            </svg>
          </div>
        </motion.div>
      </section>

      {/* What is Trek Sathi Section */}
      <section className="py-28 bg-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-50 rounded-full opacity-70 blur-3xl"></div>
        <div className="absolute left-10 bottom-10 w-32 h-32 bg-yellow-50 rounded-full opacity-50 blur-2xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="rounded-3xl overflow-hidden shadow-2xl"
            >
              <img
                src="/5640271.jpg"
                alt="Group of trekkers"
                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <span className="text-blue-600 font-medium bg-blue-50 px-4 py-1.5 rounded-full text-sm tracking-wide">
                ABOUT US
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mt-6 mb-8">
                What is{" "}
                <span className="relative">
                  <span className="relative z-10">Trek Sathi</span>
                  <span className="absolute -bottom-2 left-0 right-0 h-3 bg-yellow-400 z-0"></span>
                </span>
                ?
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                <strong>Trek Sathi</strong> (where "Sathi" means "Friend" in
                Nepali) is a community platform that connects trekking
                enthusiasts, helping you find the perfect companions for your
                next adventure in the beautiful landscapes of Nepal.
              </p>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Whether you're planning to conquer the Everest Base Camp or
                explore the Annapurna Circuit, Trek Sathi makes it easy to find
                friends, create detailed itineraries, form groups, and document
                your journey with a personal trekking journal.
              </p>

              <motion.div
                className="space-y-4 mb-8"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  "Connect with like-minded trekkers",
                  "Create and join trekking groups",
                  "Plan itineraries together",
                  "Document memories in your personal journal",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    variants={fadeInUpVariant}
                    className="flex items-center bg-gray-50 p-3 rounded-xl hover:bg-blue-50 transition-colors duration-300"
                  >
                    <div className="mr-4 bg-blue-600 rounded-full p-1 text-white">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </motion.div>
                ))}
              </motion.div>

              <Link
                to="/about"
                className="inline-flex items-center bg-gray-100 hover:bg-blue-50 text-blue-600 font-medium px-6 py-3 rounded-xl transition-colors group"
              >
                <span>Learn more about us</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-28 bg-gray-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-72 bg-gradient-to-b from-white to-white/0"></div>
        <div className="absolute -left-40 top-80 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl"></div>
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium tracking-wide mb-5">
              FEATURES
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Trek Sathi</span>
                <span className="absolute -bottom-2 left-0 w-full h-3 bg-yellow-400 z-0"></span>
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform offers everything you need to make your trekking
              adventures more social, organized, and memorable.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8 flex flex-col h-full group hover:-translate-y-2 border border-gray-100"
              >
                <div
                  className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6 transition-colors duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 flex-grow mb-6">
                  {feature.description}
                </p>
                <Link
                  to="/features"
                  className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
                >
                  <span>Learn More</span>
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 z-0">
          {/* Optional pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "url('/mountains-silhouettes.jpg')",
            }}
          ></div>
        </div>

        {/* Updated parallax element */}
        <div
          className="absolute bottom-0 w-full z-10 h-48 bg-bottom bg-contain bg-repeat-x"
          style={{
            backgroundImage: "url('/mountains-silhouettes.jpg')",
            transform: `translateY(${scrollY * 0.2}px)`, // Increased multiplier for a stronger effect
            opacity: 0.3,
          }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          {/* Section title */}
          <motion.div viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Impact in{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Numbers</span>
                <span className="absolute -bottom-2 left-0 w-full h-3 bg-yellow-400/50 z-0"></span>
              </span>
            </h2>
          </motion.div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="py-8 px-6 backdrop-blur-sm bg-white/10 rounded-2xl border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/20"
              >
                <div className="flex flex-col items-center">
                  {/* Circular icon highlight */}
                  <div className="mb-3 w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    {index === 0 && <Users className="h-8 w-8 text-white" />}
                    {index === 1 && <Map className="h-8 w-8 text-white" />}
                    {index === 2 && <Mountain className="h-8 w-8 text-white" />}
                    {index === 3 && (
                      <CheckCircle className="h-8 w-8 text-white" />
                    )}
                  </div>
                  <motion.div
                    initial={{ scale: 0.8 }}
                    whileInView={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      delay: index * 0.1 + 0.3,
                    }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-5xl font-bold text-white mb-2"
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-blue-100 font-medium text-lg">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Achievement badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-full py-2 px-5 border border-white/20 flex items-center">
              <Star className="h-5 w-5 text-yellow-400 mr-2 fill-yellow-400" />
              <span className="text-white font-medium">
                Award Winning Community
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full py-2 px-5 border border-white/20 flex items-center">
              <Heart className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-white font-medium">Trusted by Locals</span>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-28 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium tracking-wide mb-5">
              OUR TEAM
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Meet The{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Team</span>
                <span className="absolute -bottom-2 left-0 w-full h-3 bg-yellow-400 z-0"></span>
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trek Sathi was developed by a passionate team of Computer Science
              students at Tribhuvan University.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden group relative border border-gray-100"
              >
                <div className="h-80 overflow-hidden relative">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Social icons */}
                  <div className="absolute bottom-0 w-full p-5 flex justify-center space-x-4 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    {Object.keys(member.social).map((platform) => (
                      <a
                        key={platform}
                        href={member.social[platform]}
                        className="bg-white/20 backdrop-blur-sm hover:bg-white/40 p-2 rounded-full text-white transition-colors duration-300"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {platform === "github" ? (
                          <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                          </svg>
                        ) : platform === "linkedin" ? (
                          <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                            <rect x="2" y="9" width="4" height="12"></rect>
                            <circle cx="4" cy="4" r="2"></circle>
                          </svg>
                        ) : (
                          <Twitter className="h-4 w-4" />
                        )}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="p-6 text-center bg-gradient-to-b from-gray-50 to-white">
                  <h3 className="text-xl font-bold mb-1 group-hover:text-blue-600 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
