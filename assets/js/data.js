/**
 * STAYSCAPE — Central Luxury Dataset & Image Registry
 * Sample hotels, curated destinations, and initial bookings.
 */

// Storage Namespace Keys
const STORAGE_KEYS = {
  BOOKINGS: 'stayscape:bookings',
  FAVOURITES: 'stayscape:favourites',
  HOTELS: 'stayscape:hotels',
  LAST_SEARCH: 'stayscape:lastSearch',
  PROFILE: 'stayscape:savedProfile'
};

// Safe neutral fallback image data URI (SVG) if an image fails to load
const FALLBACK_IMAGE = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22600%22%20height%3D%22400%22%20viewBox%3D%220%200%20600%20400%22%20fill%3D%22none%22%3E%3Crect%20width%3D%22600%22%20height%3D%22400%22%20fill%3D%22%23E8DDCD%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2248%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20fill%3D%22%235F686D%22%3ESTAYSCAPE%3C%2Ftext%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2258%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20fill%3D%22%23879B83%22%3EImage%20Preview%20Unavailable%3C%2Ftext%3E%3C%2Fsvg%3E";

// 8 Curated Destinations
const DESTINATIONS = [
  {
    id: 'goa',
    name: 'Goa',
    state: 'Goa',
    tagline: 'Sun-drenched shores & Portuguese villas',
    image: 'assets/images/fernando-alvarez-rodriguez-M7GddPqJowg-unsplash.jpg',
    stayCount: 3,
    description: 'Bask along pristine Arabian Sea coastlines, explore colonial architecture, and unwind in secluded luxury beachfront retreats.'
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    tagline: 'The Pink City of royals & grand havelis',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    stayCount: 2,
    description: 'Immerse yourself in regal Rajasthani hospitality, sandstone courtyards, hand-carved jharokhas, and timeless courtyards.'
  },
  {
    id: 'manali',
    name: 'Manali',
    state: 'Himachal Pradesh',
    tagline: 'Pine-forested peaks & alpine chalets',
    image: 'assets/images/toni-osmundson-XHBCqZGZre0-unsplash.jpg',
    stayCount: 2,
    description: 'Breathe crisp Himalayan air in handcrafted cedar wood lodges overlooking snow-kissed ridges and rushing mountain rivers.'
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    tagline: 'Sea-facing skyline & art deco heritage',
    image: 'assets/images/vojtech-bruzek-Yrxr3bsPdS0-unsplash.jpg',
    stayCount: 2,
    description: 'Experience cosmopolitan grandeur with panoramic Arabian Sea views, heritage ballrooms, and refined culinary ateliers.'
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    tagline: 'The Garden City of tranquil urban sanctuaries',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    stayCount: 2,
    description: 'Find serene luxury surrounded by lush botanical gardens, tranquil courtyards, and state-of-the-art modern comforts.'
  },
  {
    id: 'udaipur',
    name: 'Udaipur',
    state: 'Rajasthan',
    tagline: 'Romantic palaces upon shimmering lakes',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    stayCount: 2,
    description: 'Glittering waters of Lake Pichola reflecting majestic marble palaces, heritage suites, and candlelit waterside dining.'
  },
  {
    id: 'noida',
    name: 'Noida',
    state: 'Uttar Pradesh',
    tagline: 'Skyline suites & contemporary minimalist retreats',
    image: 'assets/images/linus-mimietz-p3UWyaujtQo-unsplash.jpg',
    stayCount: 1,
    description: 'Sleek geometric architecture, high-altitude city vistas, rooftop infinity pools, and serene urban elegance.'
  },
  {
    id: 'delhi',
    name: 'Delhi',
    state: 'National Capital Region',
    tagline: 'Imperial avenues & monumental grandeur',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    stayCount: 2,
    description: 'Historic colonial elegance, manicured English lawns, curated art galleries, and dignified five-star diplomatic luxury.'
  }
];

// 14 Curated Fictional Hotels (across all 8 destinations)
const SAMPLE_HOTELS = [
  {
    id: 1,
    name: 'The Azure Bay Resort & Spa',
    tagline: 'Oceanfront sanctuary on the golden sands of Cavelossim',
    city: 'Goa',
    location: 'Cavelossim Beach, South Goa',
    image: 'assets/images/fernando-alvarez-rodriguez-M7GddPqJowg-unsplash.jpg',
    gallery: [
      'assets/images/fernando-alvarez-rodriguez-M7GddPqJowg-unsplash.jpg',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Set between the tranquil Sal River and the turquoise waters of the Arabian Sea, The Azure Bay Resort offers private beach cabanas, an open-air Ayurvedic spa pavilion, and lagoon-style infinity pools surrounded by swaying coconut palms.',
    pricePerNight: 16500,
    rating: 4.9,
    reviewCount: 312,
    stars: 5,
    amenities: [
      'Free High-Speed WiFi',
      'Infinity Pool',
      'Ayurvedic Spa',
      'Ocean View',
      'Complimentary Gourmet Breakfast',
      'Private Beach Cabana',
      'Cocktail Lounge',
      'Valet Parking',
      '24/7 Concierge'
    ],
    roomType: 'Ocean Pavilion Suite with Private Sun Deck',
    capacity: 3,
    checkIn: '14:00',
    checkOut: '11:00',
    houseRules: [
      'Valid Government Photo ID required at check-in',
      'Strictly non-smoking inside residential suites',
      'Quiet evening hours observed on beach cabanas after 11:00 PM',
      'Complimentary welcome beverage upon arrival'
    ],
    availability: 'Available',
    featured: true
  },
  {
    id: 2,
    name: 'Haveli Raj Palace Heritage',
    tagline: 'Regal 18th-century royal court living in the Pink City',
    city: 'Jaipur',
    location: 'Amer Road, Pink City, Jaipur',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'A faithfully restored aristocratic palace featuring intricate fresco ceilings, hand-cut stone jaali screens, marble fountains, and private royal courtyards where peacock calls welcome the morning sunrise.',
    pricePerNight: 14200,
    rating: 4.8,
    reviewCount: 248,
    stars: 5,
    amenities: [
      'Free High-Speed WiFi',
      'Heritage Courtyard Pool',
      'Royal Dining Hall',
      'Complimentary Gourmet Breakfast',
      'Evening Sitar Recital',
      'Valet Parking',
      'Antique Library',
      'Airport Shuttle'
    ],
    roomType: 'Maharaja Heritage Suite with Jharokha Window',
    capacity: 2,
    checkIn: '14:00',
    checkOut: '12:00',
    houseRules: [
      'Government ID required for all staying guests',
      'Preserve architectural antiques with care',
      'Shoe removal requested in designated prayer chambers',
      'Heritage walking tour conducted daily at 5:00 PM'
    ],
    availability: 'Limited Rooms',
    featured: true
  },
  {
    id: 3,
    name: 'Cedar Ridge Alpine Lodge',
    tagline: 'Hand-hewn cedar chalets nestled in high Himalayan pine slopes',
    city: 'Manali',
    location: 'Old Manali Hills, Himachal Pradesh',
    image: 'assets/images/toni-osmundson-XHBCqZGZre0-unsplash.jpg',
    gallery: [
      'assets/images/toni-osmundson-XHBCqZGZre0-unsplash.jpg',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Surrounded by deodar forests and overlooking snow-capped Pir Panjal peaks, Cedar Ridge pairs crackling stone fireplaces with floor-to-ceiling glass panoramic balconies and heated pine floors.',
    pricePerNight: 9800,
    rating: 4.9,
    reviewCount: 184,
    stars: 4,
    amenities: [
      'Free High-Speed WiFi',
      'Stone Hearth Fireplace',
      'Mountain View Balcony',
      'Complimentary Gourmet Breakfast',
      'Heated Hydrotherapy Jacuzzi',
      'Alpine Trekking Guides',
      'In-House Bakery & Café'
    ],
    roomType: 'Deodar Alpine Chalet with Wood-burning Stove',
    capacity: 4,
    checkIn: '13:00',
    checkOut: '11:00',
    houseRules: [
      'Government ID required at check-in',
      'Firewood replenishments available until 10:00 PM',
      'Outdoor footwear to be left in heated boot vestibules',
      'Trekking equipment rental available at front desk'
    ],
    availability: 'Available',
    featured: true
  },
  {
    id: 4,
    name: 'The Marine Grand Suites',
    tagline: 'Art Deco grandeur overlooking the Queen\'s Necklace',
    city: 'Mumbai',
    location: 'Marine Drive, Nariman Point, Mumbai',
    image: 'assets/images/vojtech-bruzek-Yrxr3bsPdS0-unsplash.jpg',
    gallery: [
      'assets/images/vojtech-bruzek-Yrxr3bsPdS0-unsplash.jpg',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'An iconic promenade address featuring Italian marble hallways, sea-facing brass balconies, Michelin-curated Indian coastal gastronomy, and a rooftop cocktail terrace overlooking Mumbai harbour.',
    pricePerNight: 22000,
    rating: 4.9,
    reviewCount: 420,
    stars: 5,
    amenities: [
      'Free High-Speed WiFi',
      'Arabian Sea View',
      'Rooftop Infinity Pool',
      'Fine Dining Restaurant',
      'Fitness Centre & Sauna',
      'Valet Parking',
      '24/7 Butler Service',
      'Cocktail Lounge'
    ],
    roomType: 'Harbour View Premier Suite with Deep Soaking Tub',
    capacity: 2,
    checkIn: '15:00',
    checkOut: '12:00',
    houseRules: [
      'Official government photo identification required',
      'Formal smart casual attire in rooftop dining rooms',
      'No pets allowed in premium tower suites',
      'Express luggage valet available 24/7'
    ],
    availability: 'Filling Fast',
    featured: true
  },
  {
    id: 5,
    name: 'The Regent Sky Residences',
    tagline: 'Modern minimalist luxury soaring high above the NCR skyline',
    city: 'Noida',
    location: 'Sector 128, Expressway, Noida',
    image: 'assets/images/linus-mimietz-p3UWyaujtQo-unsplash.jpg',
    gallery: [
      'assets/images/linus-mimietz-p3UWyaujtQo-unsplash.jpg',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Engineered for executive relaxation, The Regent Sky Residences features sleek monolithic concrete aesthetics, ambient acoustic insulation, high-floor panoramic terrace pools, and curated contemporary art collections.',
    pricePerNight: 11500,
    rating: 4.7,
    reviewCount: 156,
    stars: 5,
    amenities: [
      'Free High-Speed WiFi',
      'Rooftop Sky Pool',
      'High-Tech Fitness Studio',
      'Complimentary Gourmet Breakfast',
      'EV Charging Stations',
      'Executive Boardroom Access',
      'Valet Parking'
    ],
    roomType: 'Skyline Panorama Loft with Smart Glass Terrace',
    capacity: 2,
    checkIn: '14:00',
    checkOut: '12:00',
    houseRules: [
      'Valid ID proof must be presented upon check-in',
      'Digital keyless card access provided upon check-in',
      'Terrace lounge quiet hours from midnight onwards',
      'High-speed fiber ethernet connection provided in all suites'
    ],
    availability: 'Available',
    featured: false
  },
  {
    id: 6,
    name: 'Lake Pichola Oberoi View Palace',
    tagline: 'Fairy-tale white marble splendor on shimmering waters',
    city: 'Udaipur',
    location: 'Haridas Ji Ki Magri, Lake Pichola, Udaipur',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Reflected like an illuminated jewel upon Lake Pichola, this palace sanctuary features private sunlit jharokhas, royal boat transfers across serene waters, and hand-painted miniature wall art.',
    pricePerNight: 24500,
    rating: 4.9,
    reviewCount: 388,
    stars: 5,
    amenities: [
      'Free High-Speed WiFi',
      'Lake View Pavilion',
      'Royal Boat Shuttle',
      'Ayurvedic Spa & Steam',
      'Infinity Pool',
      'Fine Dining Restaurant',
      'Evening Cultural Dance',
      '24/7 Butler Service'
    ],
    roomType: 'Royal Lake Pavilion Suite with Candlelit Balcony',
    capacity: 3,
    checkIn: '14:00',
    checkOut: '12:00',
    houseRules: [
      'Government issued photo ID required at check-in',
      'Private boat transfers depart every 30 minutes until 11 PM',
      'Drone videography prohibited over heritage waters',
      'Heritage conservation etiquette applies'
    ],
    availability: 'Limited Rooms',
    featured: true
  },
  {
    id: 7,
    name: 'Silicon Grove Luxury Sanctuary',
    tagline: 'Botanical tranquil oasis within Bengaluru\'s tech heart',
    city: 'Bengaluru',
    location: 'Residency Road, Central Bengaluru',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Concealed behind towering tropical rain trees and bamboo groves, Silicon Grove features Japanese Zen water gardens, sound-dampened garden suites, bespoke tea salons, and an Olympian lap pool.',
    pricePerNight: 13800,
    rating: 4.8,
    reviewCount: 210,
    stars: 5,
    amenities: [
      'Free High-Speed WiFi',
      'Botanical Garden Courtyard',
      'Lap Swimming Pool',
      'Complimentary Gourmet Breakfast',
      'Artisanal Tea Lounge',
      'EV Charging Station',
      'Valet Parking',
      'Fitness Studio'
    ],
    roomType: 'Botanical Garden Veranda Chamber',
    capacity: 2,
    checkIn: '14:00',
    checkOut: '12:00',
    houseRules: [
      'Government identification required for check-in',
      'Botanical pathway quiet hours after 10:30 PM',
      'Organic herb garden harvest sessions every Saturday',
      'Eco-friendly linen reuse program in effect'
    ],
    availability: 'Available',
    featured: false
  },
  {
    id: 8,
    name: 'Imperial Lutyens Heritage Hotel',
    tagline: 'Aristocratic British colonial grandeur on Janpath',
    city: 'Delhi',
    location: 'Janpath, Connaught Place, New Delhi',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Step into colonial prestige with white pillared verandas, hand-woven Persian carpets, curated British Raj museum art galleries, and manicured tea lawns shaded by centenarian banyan trees.',
    pricePerNight: 18500,
    rating: 4.9,
    reviewCount: 470,
    stars: 5,
    amenities: [
      'Free High-Speed WiFi',
      'Historic Museum Art Gallery',
      'Tea Lawns & High Tea',
      'Spa & Steam Bath',
      'Fine Dining Italian & Indian',
      'Valet Parking',
      'Concierge & Chauffeur'
    ],
    roomType: 'Heritage Viceroy Suite with Teak Four-Poster Bed',
    capacity: 2,
    checkIn: '14:00',
    checkOut: '12:00',
    houseRules: [
      'All guests must provide official government ID',
      'Proper footwear and dress code in heritage dining rooms',
      'Art gallery viewings open to guests from 9 AM to 8 PM',
      'No flash photography in vintage archives'
    ],
    availability: 'Available',
    featured: true
  },
  {
    id: 9,
    name: 'Casa Del Sol Beach Villa',
    tagline: 'Bohemian boutique villa nestled amid Morjim dunes',
    city: 'Goa',
    location: 'Morjim Beach Road, North Goa',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
      'assets/images/fernando-alvarez-rodriguez-M7GddPqJowg-unsplash.jpg'
    ],
    description: 'Casual luxury redefined with terracotta roofs, outdoor plunge pool courtyards, hammock gardens under casuarina trees, and sunset seafood BBQs directly on Morjim\'s tranquil beach.',
    pricePerNight: 8900,
    rating: 4.7,
    reviewCount: 165,
    stars: 4,
    amenities: [
      'Free High-Speed WiFi',
      'Private Plunge Pool',
      'Beach Access',
      'Complimentary Gourmet Breakfast',
      'Pet Friendly',
      'Sunset Beach Bar',
      'Bicycle Rentals'
    ],
    roomType: 'Boho Sunset Villa with Open Sky Shower',
    capacity: 3,
    checkIn: '14:00',
    checkOut: '11:00',
    houseRules: [
      'Government identification required upon check-in',
      'Pets welcome with advance notification',
      'Beach towels provided complimentary at pool desk',
      'No loud amplified music after 10 PM on beach terrace'
    ],
    availability: 'Available',
    featured: false
  },
  {
    id: 10,
    name: 'Solang Valley Pine Chalet',
    tagline: 'Rustic cedar sanctuary facing cascading alpine waterfalls',
    city: 'Manali',
    location: 'Solang Valley Road, Manali',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'assets/images/toni-osmundson-XHBCqZGZre0-unsplash.jpg',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Perched high in Solang Valley with front-row panoramas of soaring snow glaciers, handcrafted pine beam architecture, heated alpine blankets, and warm spiced apple cider on arrival.',
    pricePerNight: 7400,
    rating: 4.6,
    reviewCount: 122,
    stars: 4,
    amenities: [
      'Free High-Speed WiFi',
      'Glacier Mountain View',
      'Heated Rooms',
      'Complimentary Gourmet Breakfast',
      'Bonfire & Stargazing Lawn',
      'Ski & Snowboard Storage',
      'Parking'
    ],
    roomType: 'Glacier Panorama Alpine Suite',
    capacity: 4,
    checkIn: '13:00',
    checkOut: '11:00',
    houseRules: [
      'Valid Government Photo ID required',
      'Complimentary evening bonfire hosted at 7:30 PM (weather permitting)',
      'Snow chains assistance available during peak winter',
      'Quiet mountain hours strictly observed'
    ],
    availability: 'Available',
    featured: false
  },
  {
    id: 11,
    name: 'Samode Heritage Courtyard Manor',
    tagline: 'Intimate royal retreat amidst ancient Aravalli foothills',
    city: 'Jaipur',
    location: 'Samode Village, Jaipur Outskirts',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'An idyllic heritage hideaway adorned with hand-painted gold leaf murals, antique silver canopy beds, marble stepped courtyards, and starlit royal dining with authentic Mewari delicacies.',
    pricePerNight: 12800,
    rating: 4.8,
    reviewCount: 195,
    stars: 4,
    amenities: [
      'Free High-Speed WiFi',
      'Marble Courtyard Pool',
      'Traditional Ayurvedic Spa',
      'Complimentary Gourmet Breakfast',
      'Camel Safari Tours',
      'Rooftop Stargazing Lounge',
      'Valet Parking'
    ],
    roomType: 'Heritage Courtyard Suite with Carved Jali',
    capacity: 3,
    checkIn: '14:00',
    checkOut: '11:00',
    houseRules: [
      'Valid ID required at registration',
      'Heritage preservation policies apply to all antique furnishings',
      'Special dietary preferences catered with advance notice',
      'No drone flying without heritage curator permission'
    ],
    availability: 'Available',
    featured: false
  },
  {
    id: 12,
    name: 'Jagmandir Royal Island Villa',
    tagline: 'Private marble villa floating on Lake Pichola',
    city: 'Udaipur',
    location: 'Jagmandir Island, Udaipur',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Accessible exclusively by royal boat jetty, this island sanctuary offers panoramic 360-degree views of Udaipur\'s city palace, tranquil water garden courtyards, and personalized private dining.',
    pricePerNight: 27000,
    rating: 5.0,
    reviewCount: 140,
    stars: 5,
    amenities: [
      'Free High-Speed WiFi',
      '360° Lake Views',
      'Private Island Boat Transfer',
      'Rooftop Plunge Pool',
      'Personal Chef & Butler',
      'Ayurvedic Island Spa',
      'Sunset Champagne Cruises'
    ],
    roomType: 'Imperial Island Villa with Private Sunset Pier',
    capacity: 4,
    checkIn: '15:00',
    checkOut: '12:00',
    houseRules: [
      'Pre-scheduled boat arrival coordination required',
      'Government identification required for all occupants',
      'Island nature reserve rules: strictly no open fires',
      'Water safety guidelines enforced on private docks'
    ],
    availability: 'Limited Rooms',
    featured: false
  },
  {
    id: 13,
    name: 'Worli Horizon Hotel & Sky Club',
    tagline: 'Breathtaking Bandra-Worli Sea Link vistas & high-altitude luxury',
    city: 'Mumbai',
    location: 'Worli Sea Face, Mumbai',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      'assets/images/vojtech-bruzek-Yrxr3bsPdS0-unsplash.jpg',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Fronting the crashing waves of the Worli shoreline, this sleek glass tower features infinity sky pools hovering over the ocean, artisanal sushi bar, and acoustically isolated master bedrooms.',
    pricePerNight: 19500,
    rating: 4.8,
    reviewCount: 290,
    stars: 5,
    amenities: [
      'Free High-Speed WiFi',
      'Sea Link Panoramic View',
      'Infinity Sky Pool',
      'Luxury Spa & Salon',
      'Cocktail Sky Bar',
      'Valet Parking',
      'Helipad Access'
    ],
    roomType: 'Worli Sea Link Horizon Penthouse',
    capacity: 2,
    checkIn: '14:00',
    checkOut: '12:00',
    houseRules: [
      'Valid passport or national ID required',
      'Sky club access requires smart casual evening attire',
      'Quiet hours inside residential towers after 11 PM',
      'Valet parking included with all suite bookings'
    ],
    availability: 'Available',
    featured: false
  },
  {
    id: 14,
    name: 'The Capital Roseate Diplomatic Villa',
    tagline: 'Understated diplomatic luxury surrounded by shaded manicured lawns',
    city: 'Delhi',
    location: 'Chanakyapuri Diplomatic Enclave, New Delhi',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Situated in the tree-lined tranquility of Chanakyapuri, this distinguished retreat offers bullet-tested privacy glass, classical colonnade gardens, subterranean wine cellar, and dedicated private concierge service.',
    pricePerNight: 17000,
    rating: 4.8,
    reviewCount: 175,
    stars: 5,
    amenities: [
      'Free High-Speed WiFi',
      'Private Colonnade Gardens',
      'Subterranean Wine Cellar',
      'Complimentary Gourmet Breakfast',
      'Executive Chauffeur Service',
      'Secure Valet Parking',
      '24/7 Diplomatic Concierge'
    ],
    roomType: 'Ambassador Executive Suite with Private Garden Terrace',
    capacity: 2,
    checkIn: '14:00',
    checkOut: '12:00',
    houseRules: [
      'Government identification required upon arrival',
      'Discreet photography guidelines across diplomatic premises',
      'Private security protocols respected with advance notice',
      'Early breakfast trays available upon request'
    ],
    availability: 'Available',
    featured: false
  }
];

// Initial Demo Bookings (Provides realistic data on first visit before any user bookings)
const INITIAL_DEMO_BOOKINGS = [
  {
    bookingId: 'SS-20261115-A491C2',
    hotelId: 1,
    hotelName: 'The Azure Bay Resort & Spa',
    city: 'Goa',
    image: 'assets/images/fernando-alvarez-rodriguez-M7GddPqJowg-unsplash.jpg',
    guestName: 'Arjun Sharma',
    email: 'arjun.sharma@example.com',
    phone: '+91 98765 43210',
    guests: 2,
    checkIn: '2026-11-15',
    checkOut: '2026-11-18',
    nights: 3,
    pricePerNight: 16500,
    total: 49500,
    specialRequest: 'Quiet suite on the upper level with sea view if possible.',
    status: 'confirmed',
    createdAt: '2026-10-20T10:15:00.000Z'
  },
  {
    bookingId: 'SS-20261010-98DF1A',
    hotelId: 3,
    hotelName: 'Cedar Ridge Alpine Lodge',
    city: 'Manali',
    image: 'assets/images/toni-osmundson-XHBCqZGZre0-unsplash.jpg',
    guestName: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+91 91234 56789',
    guests: 2,
    checkIn: '2026-10-05',
    checkOut: '2026-10-08',
    nights: 3,
    pricePerNight: 9800,
    total: 29400,
    specialRequest: 'Vegetarian breakfast preference requested.',
    status: 'confirmed',
    createdAt: '2026-09-28T14:30:00.000Z'
  },
  {
    bookingId: 'SS-20260901-C73E05',
    hotelId: 4,
    hotelName: 'The Marine Grand Suites',
    city: 'Mumbai',
    image: 'assets/images/vojtech-bruzek-Yrxr3bsPdS0-unsplash.jpg',
    guestName: 'Arjun Sharma',
    email: 'arjun.sharma@example.com',
    phone: '+91 98765 43210',
    guests: 1,
    checkIn: '2026-09-12',
    checkOut: '2026-09-14',
    nights: 2,
    pricePerNight: 22000,
    total: 44000,
    specialRequest: 'Late checkout at 1:00 PM if available.',
    status: 'cancelled',
    createdAt: '2026-08-25T09:00:00.000Z',
    cancelledAt: '2026-08-29T16:20:00.000Z'
  }
];
