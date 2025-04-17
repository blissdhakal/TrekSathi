
import dotenv from "dotenv";
import Trek from "../models/Trek.js";
import Itinerary from "../models/Itinerary.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Debug: Check if environment variables are loaded
console.log("Environment variables loaded:", process.env.MONGODB_URI ? "Yes" : "No");
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/trekDB";

dotenv.config();
// Trek data with local image paths
const itineraryData = [
    {
      trekId: null, // This will be populated programmatically with the ABC trek's ObjectId
      trekName: "Annapurna Base Camp",
      priceRange: "NRS 20,000 - NRS 1,36,000", 
      days: [
        {
          day: 1,
          title: "Kathmandu to Pokhara",
          activities: [
            { description: "Trek briefing in Kathmandu", transport: "N/A" },
            { description: "Drive to Pokhara (Tourist Bus)", transport: "Bus" },
          ],
          image:
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.andbeyond.com%2Fwp-content%2Fuploads%2Fsites%2F5%2Fpokhara-valley-nepal.jpg&f=1&nofb=1&ipt=eb57584b66f8eab25d619ffaae072f514a073c582ca20279e6510f3510330fa5&ipo=images",
          distance: "200km",
          duration: "6-7 hours",
          highlights: ["Scenic drive", "Mountain views"],
          difficulty: "Easy",
          elevation: "827m",
          accommodation: "Hotel in Pokhara",
          meals: "Breakfast, Dinner",
          mealLocations: [
            { type: "Breakfast", location: "Hotel in Kathmandu" },
            { type: "Lunch", location: "On the road (not included)" },
            { type: "Dinner", location: "Hotel in Pokhara" },
          ],
          hotels: [
            { name: "Hotel Lakeside Pokhara", number: "9860000000", rating: 4.5 },
            { name: "Mount Annapurna Hotel", number: "9877000006", rating: 4.0 },
          ],
          reviews: ["Great start to the journey!", "Comfortable ride to Pokhara."],
          comments: [
            {
              avatar: "https://via.placeholder.com/40",
              text: "The drive offers beautiful views of rural Nepal!",
            },
          ],
          transport: "Tourist Bus (9800123456)",
          additionalInfo:
            "Pokhara is the gateway to the Annapurna region. Take some time to enjoy the beautiful lakeside city before starting your trek tomorrow.",
          safetyTips:
            "Keep your valuables secure during the bus journey. Rest well tonight as the trek starts tomorrow.",
        },
        {
          day: 2,
          title: "Pokhara to Nayapul to Tikhedhunga",
          activities: [
            { description: "Drive from Pokhara to Nayapul", transport: "Jeep" },
            {
              description: "Trek from Nayapul to Tikhedhunga",
              transport: "On foot",
            },
          ],
          image:
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmedia.nepaltrekadventures.com%2Fuploads%2Fimg%2Ftikhedhunga-travel-guide-b.webp&f=1&nofb=1&ipt=5a010187c4057597837398848ccb923e634b049ac9d9ead00cd6f663203b68e2&ipo=images",
          distance: "10km hiking",
          duration: "4-5 hours",
          highlights: [
            "First day of trekking",
            "Beautiful villages",
            "Riverside trails",
          ],
          difficulty: "Easy to Moderate",
          elevation: "1,540m",
          accommodation: "Tea House in Tikhedhunga",
          meals: "Breakfast, Lunch, Dinner",
          mealLocations: [
            { type: "Breakfast", location: "Hotel in Pokhara" },
            { type: "Lunch", location: "Local restaurant in Nayapul" },
            { type: "Dinner", location: "Tea house in Tikhedhunga" },
          ],
          hotels: [
            { name: "Tikhedhunga Guest House", number: "9841000001", rating: 3.5 },
          ],
          reviews: [
            "Beautiful start to the trek!",
            "Moderate hiking with good views.",
          ],
          comments: [
            {
              avatar: "https://via.placeholder.com/40",
              text: "The drive to Nayapul takes about 1.5 hours, and the trek isn't too challenging for the first day.",
            },
          ],
          transport: "Jeep to Nayapul (9800456789)",
          additionalInfo:
            "This first day of trekking is relatively easy and serves as a good warm-up. You'll follow the Modi Khola (river) for part of the route.",
          safetyTips:
            "Stay hydrated and pace yourself on this first day of trekking. Break in your hiking boots if they're new.",
        },
        {
          day: 3,
          title: "Tikhedhunga to Ghorepani",
          activities: [
            {
              description: "Trek from Tikhedhunga to Ghorepani",
              transport: "On foot",
            },
            {
              description: "Climb the famous 'stone staircase'",
              transport: "On foot",
            },
          ],
          image:
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.adventurehimalayantravels.com%2Fuploads%2Fimg%2Fghorepani-poon-hill-trek-1593613533.webp&f=1&nofb=1&ipt=046434dfc617bfd4513c419951fc236fdf2b790a13e2377ac65e58184b1e1a4e&ipo=images",
          distance: "13km",
          duration: "6-7 hours",
          highlights: [
            "Stone steps climb",
            "Rhododendron forests",
            "Mountain views",
          ],
          difficulty: "Moderate to Challenging",
          elevation: "2,860m",
          accommodation: "Tea House in Ghorepani",
          meals: "Breakfast, Lunch, Dinner",
          mealLocations: [
            { type: "Breakfast", location: "Tea house in Tikhedhunga" },
            { type: "Lunch", location: "Trail restaurant in Ulleri" },
            { type: "Dinner", location: "Tea house in Ghorepani" },
          ],
          hotels: [
            { name: "Sunny Hotel Ghorepani", number: "9841000002", rating: 4.0 },
            { name: "Mountain View Lodge", number: "9841000003", rating: 3.5 },
          ],
          reviews: [
            "Challenging but rewarding day!",
            "The stone steps are tough but worth it.",
          ],
          comments: [
            {
              avatar: "https://via.placeholder.com/40",
              text: "The climb to Ghorepani includes over 3,000 stone steps - pace yourself and take plenty of breaks!",
            },
          ],
          transport: "On foot",
          additionalInfo:
            "Today's trek includes the famous stone staircase with over 3,000 steps. The climb is challenging but rewards you with beautiful views of the countryside and mountains as you gain elevation.",
          safetyTips:
            "Take it slow on the stone steps and use trekking poles if you have them. Watch for signs of altitude sickness as you gain significant elevation today.",
        },
        {
          day: 4,
          title: "Ghorepani to Poon Hill to Tadapani",
          activities: [
            {
              description: "Early morning hike to Poon Hill for sunrise",
              transport: "On foot",
            },
            {
              description: "Trek from Ghorepani to Tadapani",
              transport: "On foot",
            },
          ],
          image:
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.tripspoint.com%2Fuploads%2Fattraction%2FU_XlSvetxzon2GAltSGE6e_0bEApEQMb_1024w.jpg&f=1&nofb=1&ipt=7e5ad91a76ea9b8c0cf01bdd5f22d9e47fbe50a22a0a6117f3c6ed17b863c744&ipo=images",
          distance: "12km",
          duration: "6-7 hours",
          highlights: [
            "Sunrise at Poon Hill",
            "Panoramic mountain views",
            "Rhododendron forests",
          ],
          difficulty: "Moderate",
          elevation: "3,210m (Poon Hill), 2,630m (Tadapani)",
          accommodation: "Tea House in Tadapani",
          meals: "Breakfast, Lunch, Dinner",
          mealLocations: [
            {
              type: "Breakfast",
              location: "Tea house in Ghorepani (after Poon Hill)",
            },
            { type: "Lunch", location: "Trail restaurant" },
            { type: "Dinner", location: "Tea house in Tadapani" },
          ],
          hotels: [
            { name: "Tadapani Guest House", number: "9841000004", rating: 3.5 },
          ],
          reviews: [
            "The sunrise at Poon Hill is magical!",
            "Worth the early wake-up call!",
          ],
          comments: [
            {
              avatar: "https://via.placeholder.com/40",
              text: "Wake up at 4:30 AM for the hike to Poon Hill - bring a headlamp and warm clothes!",
            },
          ],
          transport: "On foot",
          additionalInfo:
            "The pre-dawn hike to Poon Hill (3,210m) is a highlight of this trek, offering spectacular sunrise views over the Annapurna and Dhaulagiri ranges. After returning to Ghorepani for breakfast, you'll continue to Tadapani through beautiful rhododendron forests.",
          safetyTips:
            "It will be dark during the morning hike to Poon Hill - use a headlamp and stay with your group. Dress in layers as it will be cold before sunrise but will warm up quickly.",
        },
        {
          day: 5,
          title: "Tadapani to Chhomrong",
          activities: [
            {
              description: "Trek from Tadapani to Chhomrong",
              transport: "On foot",
            },
            { description: "Cross Kimrong Khola river", transport: "On foot" },
          ],
          image:
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.natureloverstrek.com%2Fpagegallery%2Feverything-you-need-to-know-about-chhomrong-village-in-annapurna-base-camp-trekking-trail22.jpg&f=1&nofb=1&ipt=3e0fa28b51fd5d534447f8256d10b40e7ca00cf6b796bf3f6e2b800af759f95e&ipo=images",
          distance: "12km",
          duration: "5-6 hours",
          highlights: [
            "Stunning valley views",
            "Gurung villages",
            "First views of Annapurna South",
          ],
          difficulty: "Moderate",
          elevation: "2,170m",
          accommodation: "Tea House in Chhomrong",
          meals: "Breakfast, Lunch, Dinner",
          mealLocations: [
            { type: "Breakfast", location: "Tea house in Tadapani" },
            { type: "Lunch", location: "Trail restaurant" },
            { type: "Dinner", location: "Tea house in Chhomrong" },
          ],
          hotels: [
            { name: "Excellent View Lodge", number: "9841000005", rating: 4.0 },
            { name: "Chhomrong Cottage", number: "9841000006", rating: 3.5 },
          ],
          reviews: [
            "Chhomrong is a beautiful village!",
            "Great views of Annapurna South.",
          ],
          comments: [
            {
              avatar: "https://via.placeholder.com/40",
              text: "Try the famous Gurung bread in Chhomrong - it's delicious!",
            },
          ],
          transport: "On foot",
          additionalInfo:
            "Chhomrong is the last permanent settlement and gateway to the Annapurna Sanctuary. The village is built on a hillside and offers excellent views of Annapurna South and Hiunchuli. This is also the last place to get some comforts like bakeries and hot showers before heading further into the mountains.",
          safetyTips:
            "The descent to Chhomrong can be steep in places - use trekking poles and take your time to protect your knees.",
        },
        {
          day: 6,
          title: "Chhomrong to Bamboo",
          activities: [
            { description: "Trek from Chhomrong to Bamboo", transport: "On foot" },
            {
              description: "Descend and ascend stone stairways",
              transport: "On foot",
            },
          ],
          image:
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.ytimg.com%2Fvi%2F6RNvtlwQBMY%2Fmaxresdefault.jpg&f=1&nofb=1&ipt=bcad82214812b45198325d0540bc8ad50c2d47dfa86f9750367dc3a3f56f63ac&ipo=images",
          distance: "10km",
          duration: "4-5 hours",
          highlights: [
            "Modi Khola river valley",
            "Bamboo forests",
            "Wildlife spotting opportunity",
          ],
          difficulty: "Moderate",
          elevation: "2,310m",
          accommodation: "Tea House in Bamboo",
          meals: "Breakfast, Lunch, Dinner",
          mealLocations: [
            { type: "Breakfast", location: "Tea house in Chhomrong" },
            { type: "Lunch", location: "Trail restaurant in Sinuwa" },
            { type: "Dinner", location: "Tea house in Bamboo" },
          ],
          hotels: [{ name: "Bamboo Lodge", number: "9841000007", rating: 3.0 }],
          reviews: [
            "Peaceful stay in the forest",
            "Basic but comfortable accommodation.",
          ],
          comments: [
            {
              avatar: "https://via.placeholder.com/40",
              text: "The climb out of Chhomrong is tough but the forest trail after is beautiful.",
            },
          ],
          transport: "On foot",
          additionalInfo:
            "After descending from Chhomrong and crossing the Chhomrong Khola river, you'll climb back up to Sinuwa before descending into the Modi Khola Valley. Bamboo is a small settlement in a forested area where you might spot wildlife like monkeys.",
          safetyTips:
            "Be prepared for significant up and down trekking today. The area around Bamboo can be muddy, especially during or after rain.",
        },
        {
          day: 7,
          title: "Bamboo to Deurali",
          activities: [
            { description: "Trek from Bamboo to Deurali", transport: "On foot" },
            { description: "Pass through Himalaya Hotel", transport: "On foot" },
          ],
          image:
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ffulltimeexplorer.com%2Fwp-content%2Fuploads%2F2022%2F04%2FDeurali-Nepal-ABC-Trek-Annapurna-Base-Camp-Trekking-1.jpg&f=1&nofb=1&ipt=168d7b6635e077d689fdcb9a51acdd7831a3210c3e173688b129c50b941ff485&ipo=images",
          distance: "11km",
          duration: "5-6 hours",
          highlights: [
            "Entering Annapurna Sanctuary",
            "Mountain stream views",
            "Increasing altitude",
          ],
          difficulty: "Moderate to Challenging",
          elevation: "3,230m",
          accommodation: "Tea House in Deurali",
          meals: "Breakfast, Lunch, Dinner",
          mealLocations: [
            { type: "Breakfast", location: "Tea house in Bamboo" },
            { type: "Lunch", location: "Himalaya Hotel" },
            { type: "Dinner", location: "Tea house in Deurali" },
          ],
          hotels: [
            { name: "Deurali Guest House", number: "9841000008", rating: 3.0 },
          ],
          reviews: ["Getting closer to ABC!", "Can feel the altitude change."],
          comments: [
            {
              avatar: "https://via.placeholder.com/40",
              text: "The air is noticeably thinner as you approach Deurali - take it slow.",
            },
          ],
          transport: "On foot",
          additionalInfo:
            "Today you enter the Annapurna Sanctuary, a high glacial basin surrounded by mountains. The landscape becomes more rugged and alpine as you gain elevation. Deurali is the last stop before Machhapuchhre Base Camp (MBC).",
          safetyTips:
            "You're now at significant altitude - watch for signs of altitude sickness and stay properly hydrated. The weather can change rapidly in the sanctuary, so be prepared.",
        },
        {
          day: 8,
          title: "Deurali to Annapurna Base Camp via MBC",
          activities: [
            { description: "Trek from Deurali to MBC", transport: "On foot" },
            {
              description: "Continue to Annapurna Base Camp",
              transport: "On foot",
            },
          ],
          image:
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages.prismic.io%2Findiahike%2Fb0d00177-d446-495c-a66d-ce6e49910fb0_November_%2BAnnapurna%2BBase%2BCamp%2BTrek%2B-%2BMandar%2BBapaye%2B-%2BGOLD.jpg&f=1&nofb=1&ipt=b23e1696e8102b763faf48f2a74d6873a454d512bedfad7ca1adc8836e451b97&ipo=images",
          distance: "10km",
          duration: "6-7 hours",
          highlights: ["Arrival at ABC", "360° mountain panorama", "Glacier views"],
          difficulty: "Challenging",
          elevation: "4,130m",
          accommodation: "Tea House at ABC",
          meals: "Breakfast, Lunch, Dinner",
          mealLocations: [
            { type: "Breakfast", location: "Tea house in Deurali" },
            { type: "Lunch", location: "Machhapuchhre Base Camp" },
            { type: "Dinner", location: "Tea house at Annapurna Base Camp" },
          ],
          hotels: [{ name: "ABC Lodge", number: "9841000010", rating: 3.5 }],
          reviews: [
            "Reaching ABC is an incredible feeling!",
            "The mountain amphitheater is breathtaking.",
          ],
          comments: [
            {
              avatar: "https://via.placeholder.com/40",
              text: "Try to reach ABC by early afternoon to enjoy the views before clouds roll in.",
            },
          ],
          transport: "On foot",
          additionalInfo:
            "Today is the highlight of your trek as you reach Annapurna Base Camp! From MBC, it's about 1-2 hours further to ABC. You'll be surrounded by a spectacular 360° panorama of Himalayan peaks, including Annapurna I (8,091m), Annapurna South, Machhapuchhre (Fishtail), and others. The setting sun on the mountains creates an unforgettable golden glow.",
          safetyTips:
            "This is the highest point of the trek (4,130m). Move slowly, stay hydrated, and inform your guide immediately if you experience any altitude sickness symptoms. Nights are very cold - use a warm sleeping bag.",
        },
        {
          day: 9,
          title: "Annapurna Base Camp to Bamboo",
          activities: [
            { description: "Sunrise at ABC", transport: "On foot" },
            { description: "Descend to Bamboo", transport: "On foot" },
          ],
          image:
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.ytimg.com%2Fvi%2F6RNvtlwQBMY%2Fmaxresdefault.jpg&f=1&nofb=1&ipt=bcad82214812b45198325d0540bc8ad50c2d47dfa86f9750367dc3a3f56f63ac&ipo=images",
          distance: "15km",
          duration: "7-8 hours",
          highlights: [
            "Sunrise over Annapurna",
            "Long descent",
            "Changing landscapes",
          ],
          difficulty: "Moderate (mostly downhill)",
          elevation: "2,310m",
          accommodation: "Tea House in Bamboo",
          meals: "Breakfast, Lunch, Dinner",
          mealLocations: [
            { type: "Breakfast", location: "Tea house at ABC" },
            { type: "Lunch", location: "MBC or Deurali" },
            { type: "Dinner", location: "Tea house in Bamboo" },
          ],
          hotels: [{ name: "Bamboo Lodge", number: "9841000007", rating: 3.0 }],
          reviews: [
            "Long day but easier going downhill",
            "Legs will feel it the next day!",
          ],
          comments: [
            {
              avatar: "https://via.placeholder.com/40",
              text: "Wake up early for sunrise at ABC - it's magical to see the first light hit the mountains.",
            },
          ],
          transport: "On foot",
          additionalInfo:
            "After enjoying the sunrise at ABC, you'll begin your descent. This is a long day of hiking, but it's mostly downhill. You'll pass through MBC and Deurali again before reaching Bamboo. The dramatic change in landscapes and decreasing altitude make for an interesting day.",
          safetyTips:
            "Downhill trekking can be tough on the knees - use trekking poles and take breaks when needed. The long descent can be tiring, so keep energy snacks handy.",
        },
        {
          day: 10,
          title: "Bamboo to Jhinu Danda (Hot Springs)",
          activities: [
            {
              description: "Trek from Bamboo to Jhinu Danda",
              transport: "On foot",
            },
            { description: "Relax in natural hot springs", transport: "On foot" },
          ],
          image:
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.nepaltrekkinginhimalaya.com%2Fimages%2Farticles%2F7LvGg-jhinu-danda-spring-1240.jpg&f=1&nofb=1&ipt=787a00216bedcc79ba91a3668daae40e21914af63310d4388d7254ac962fb189&ipo=images",
          distance: "14km",
          duration: "6-7 hours",
          highlights: ["Natural hot springs", "River views", "Relaxation day"],
          difficulty: "Moderate",
          elevation: "1,780m",
          accommodation: "Tea House in Jhinu Danda",
          meals: "Breakfast, Lunch, Dinner",
          mealLocations: [
            { type: "Breakfast", location: "Tea house in Bamboo" },
            { type: "Lunch", location: "Trail restaurant" },
            { type: "Dinner", location: "Tea house in Jhinu Danda" },
          ],
          hotels: [
            { name: "Hot Spring Lodge", number: "9841000012", rating: 4.0 },
            { name: "Jhinu Guest House", number: "9841000013", rating: 3.5 },
          ],
          reviews: [
            "The hot springs are amazing after days of trekking!",
            "Perfect way to soothe tired muscles.",
          ],
          comments: [
            {
              avatar: "https://via.placeholder.com/40",
              text: "The hot springs are about 20 minutes downhill from the village - absolutely worth it!",
            },
          ],
          transport: "On foot",
          additionalInfo:
            "Today you'll trek to Jhinu Danda, known for its natural hot springs by the Modi Khola river. After days of trekking, soaking in these therapeutic hot springs is a wonderful way to relax and rejuvenate your tired muscles. The springs are about a 20-minute walk downhill from the village.",
          safetyTips:
            "Be careful on the steep trail to the hot springs. Don't stay in the hot water too long if you're feeling lightheaded. Keep hydrated.",
        },
        {
          day: 11,
          title: "Jhinu Danda to Nayapul to Pokhara",
          activities: [
            {
              description: "Trek from Jhinu Danda to Nayapul",
              transport: "On foot",
            },
            { description: "Drive from Nayapul to Pokhara", transport: "Jeep" },
          ],
          image:
            "https://www.acethehimalaya.com/wp-content/uploads/2024/02/things-to-do-in-pokhara.jpg.webp",
          distance: "12km trekking, 42km driving",
          duration: "4-5 hours trekking, 1.5 hours driving",
          highlights: [
            "Final day of trekking",
            "Return to civilization",
            "Celebration dinner",
          ],
          difficulty: "Easy to Moderate",
          elevation: "827m (Pokhara)",
          accommodation: "Hotel in Pokhara",
          meals: "Breakfast, Lunch",
          mealLocations: [
            { type: "Breakfast", location: "Tea house in Jhinu Danda" },
            { type: "Lunch", location: "Restaurant in Nayapul" },
            { type: "Dinner", location: "Restaurant in Pokhara (not included)" },
          ],
          hotels: [
            { name: "Hotel Lakeside Pokhara", number: "9860000000", rating: 4.5 },
            { name: "Mount Annapurna Hotel", number: "9877000006", rating: 4.0 },
          ],
          reviews: [
            "Bittersweet final day of trekking",
            "Great to enjoy Pokhara's comforts again!",
          ],
          comments: [
            {
              avatar: "https://via.placeholder.com/40",
              text: "Celebrate your achievement with a nice dinner in Pokhara - you've earned it!",
            },
          ],
          transport: "On foot, Jeep from Nayapul to Pokhara (9800456789)",
          additionalInfo:
            "Your final day of trekking takes you from Jhinu Danda to Nayapul, mostly following the Modi Khola river. After lunch in Nayapul, you'll drive back to Pokhara where hot showers, comfortable beds, and restaurant meals await. Many trekkers celebrate their achievement with a nice dinner and drinks in Pokhara's lakeside district.",
          safetyTips:
            "This final stretch can feel long as you're eager to finish - pace yourself and enjoy the last views of the countryside.",
        },
        {
          day: 12,
          title: "Departure from Pokhara",
          activities: [
            {
              description: "Rest day in Pokhara or return to Kathmandu",
              transport: "Bus/Flight",
            },
            { description: "Optional activities in Pokhara", transport: "Various" },
          ],
          image:
            "https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2F4.bp.blogspot.com%2F-wr2Ny1h67LQ%2FUVxujTLt9hI%2FAAAAAAAAf28%2Fz8ACqdzlG6M%2Fs1600%2FKathmandu%2BNepal%2B1.jpeg&f=1&nofb=1&ipt=c2e829b1b84e5fd35a47faddc23bea443bf3ffe693ca39417f92a77c6e1a792b&ipo=images",
          distance: "200km (if returning to Kathmandu)",
          duration: "Flexible",
          highlights: ["Relaxation", "Reflection on trek", "Shopping"],
          difficulty: "Easy",
          elevation: "827m",
          accommodation: "Not included - departure day",
          meals: "Breakfast",
          mealLocations: [{ type: "Breakfast", location: "Hotel in Pokhara" }],
          hotels: [
            { name: "Hotel Lakeside Pokhara", number: "9860000000", rating: 4.5 },
          ],
          reviews: [
            "Perfect way to end the trip",
            "Pokhara is a great place to unwind after trekking.",
          ],
          comments: [
            {
              avatar: "https://via.placeholder.com/40",
              text: "Take a boat ride on Phewa Lake or visit the Peace Pagoda if you have time!",
            },
          ],
          transport:
            "Tourist Bus to Kathmandu (9800123456) or Flight (Buddha Air/Yeti Airlines)",
          additionalInfo:
            "Enjoy your final day in Pokhara with optional activities like boating on Phewa Lake, paragliding, visiting the Peace Pagoda, or shopping for souvenirs. If returning to Kathmandu, you can take either a tourist bus (6-7 hours) or a short flight (25 minutes).",
          safetyTips:
            "If flying to Kathmandu, morning flights are more reliable as afternoon flights can be affected by weather conditions.",
        },
      ],
      slug: "annapurna-base-camp-itinerary"
    }
  ];
 
  
  // Trek data with local image paths
  const trekDetails = {
    mardi: {
      name: "Mardi Base Camp",
      location: "Mardi Himal Trek",
      image: "/Users/xdzc0/Desktop/TrekSathi/server/public/mardi.jpg",
      distance: "14.7 km",
      duration: "5 Days",
      elevation: "4,500 m",
      description: "Experience the hidden gem of the Annapurna region with breathtaking views of the Machapuchare (Fishtail) mountain.",
      slug: "mardi-base-camp",
    },
    abc: {
      name: "Annapurna Base Camp",
      location: "Annapurna Sanctuary Trek",
      image: "/Users/xdzc0/Desktop/TrekSathi/server/public/abc.jpg",
      distance: "37 km",
      duration: "7 Days",
      elevation: "4,130 m",
      description: "Journey through diverse landscapes to reach the amphitheater of mountains in the Annapurna Sanctuary.",
      slug: "annapurna-base-camp",
    },
    everest: {
      name: "Everest Base Camp",
      location: "Everest Region Trek",
      image: "/Users/xdzc0/Desktop/TrekSathi/server/public/everest.jpg",
      distance: "65 km",
      duration: "12 Days",
      elevation: "5,364 m",
      description: "Trek to the base of the world's highest peak through Sherpa villages and stunning mountain vistas.",
      slug: "everest-base-camp",
    },
    langtang: {
      name: "Langtang Valley",
      location: "Langtang Trek",
      image: "/Users/xdzc0/Desktop/TrekSathi/server/public/langtang.jpeg",
      distance: "19 km",
      duration: "7 Days",
      elevation: "3,870 m",
      description: "Discover the beautiful Langtang Valley, rich in Tibetan culture and diverse flora and fauna.",
      slug: "langtang-valley",
    },
    manaslu: {
      name: "Manaslu Circuit",
      location: "Manaslu Trek",
      image: "/Users/xdzc0/Desktop/TrekSathi/server/public/manaslu.jpg",
      distance: "177 km",
      duration: "14 Days",
      elevation: "5,106 m",
      description: "Circle the eighth highest mountain in the world through remote villages and dramatic landscapes.",
      slug: "manaslu-circuit",
    },
  };
  
 
  
// Connect to MongoDB and run seeding once
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  retryWrites: true,
  writeConcern: {
    w: "majority"
  },
  appName: "trekbackend",
})
.then(async () => {
  console.log("MongoDB connected successfully");
  
  // Run the seeding function
  await seedDatabase();
  
  // Close the connection only after seeding completes
  console.log("Closing MongoDB connection");
  await mongoose.connection.close();
  
  console.log("Seeding process complete");
})
.catch((err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});

  
  // Function to upload images to Cloudinary and update trek data
  const processTrekImages = async (treks) => {
    const updatedTreks = [];
  
    for (const [key, trek] of Object.entries(treks)) {
      console.log(`Uploading image for: ${trek.name}`);
      
      const uploadedImage = await uploadOnCloudinary(trek.image);
  
      if (uploadedImage) {
        trek.image = uploadedImage.secure_url;
      } else {
        console.error(`Failed to upload image for ${trek.name}`);
      }
  
      updatedTreks.push(trek);
    }
  
    return updatedTreks;
  };
  
  // Function to seed database
  const seedDatabase = async () => {
    try {
      // Clear existing data
      await Trek.deleteMany({});
      await Itinerary.deleteMany({});
      console.log("Cleared existing data");
  
      // Process and insert treks
      const updatedTreks = await processTrekImages(trekDetails);
      const insertedTreks = await Trek.insertMany(updatedTreks);
      console.log(`${insertedTreks.length} treks inserted successfully`);
  
      // Find the ABC trek to get its ID for the itinerary
      const abcTrek = insertedTreks.find(trek => trek.slug === "annapurna-base-camp");
      if (!abcTrek) {
        throw new Error("Annapurna Base Camp trek not found in inserted data");
      }
  
      // Update itinerary data with the correct trekId
      itineraryData[0].trekId = abcTrek._id;
  
      // Insert itineraries
      const insertedItineraries = await Itinerary.insertMany(itineraryData);
      console.log(`${insertedItineraries.length} itineraries inserted successfully`);
  
      console.log("Database seeding completed successfully");
    } catch (error) {
      console.error("Error seeding database:", error);
    } finally {
      mongoose.connection.close();
    }
  };
  
 