import type { Language, Translations } from './types'

export const translations: Translations = {
  // Navigation
  home: { en: 'Home', hi: 'होम', pa: 'ਹੋਮ' },
  browse: { en: 'Browse', hi: 'ब्राउज़ करें', pa: 'ਬ੍ਰਾਊਜ਼ ਕਰੋ' },
  sell: { en: 'Sell', hi: 'बेचें', pa: 'ਵੇਚੋ' },
  messages: { en: 'Messages', hi: 'संदेश', pa: 'ਸੁਨੇਹੇ' },
  orders: { en: 'Orders', hi: 'ऑर्डर', pa: 'ਆਰਡਰ' },
  profile: { en: 'Profile', hi: 'प्रोफाइल', pa: 'ਪ੍ਰੋਫਾਈਲ' },
  login: { en: 'Login', hi: 'लॉग इन', pa: 'ਲੌਗ ਇਨ' },
  signup: { en: 'Sign Up', hi: 'साइन अप', pa: 'ਸਾਈਨ ਅੱਪ' },
  logout: { en: 'Logout', hi: 'लॉग आउट', pa: 'ਲੌਗ ਆਊਟ' },
  
  // Auth
  email: { en: 'Email', hi: 'ईमेल', pa: 'ਈਮੇਲ' },
  password: { en: 'Password', hi: 'पासवर्ड', pa: 'ਪਾਸਵਰਡ' },
  fullName: { en: 'Full Name', hi: 'पूरा नाम', pa: 'ਪੂਰਾ ਨਾਮ' },
  phone: { en: 'Phone Number', hi: 'फोन नंबर', pa: 'ਫੋਨ ਨੰਬਰ' },
  iAmFarmer: { en: 'I am a Farmer', hi: 'मैं किसान हूं', pa: 'ਮੈਂ ਕਿਸਾਨ ਹਾਂ' },
  iAmBuyer: { en: 'I am a Buyer', hi: 'मैं खरीदार हूं', pa: 'ਮੈਂ ਖਰੀਦਦਾਰ ਹਾਂ' },
  createAccount: { en: 'Create Account', hi: 'खाता बनाएं', pa: 'ਖਾਤਾ ਬਣਾਓ' },
  alreadyHaveAccount: { en: 'Already have an account?', hi: 'पहले से खाता है?', pa: 'ਪਹਿਲਾਂ ਤੋਂ ਖਾਤਾ ਹੈ?' },
  dontHaveAccount: { en: "Don't have an account?", hi: 'खाता नहीं है?', pa: 'ਖਾਤਾ ਨਹੀਂ ਹੈ?' },
  
  // Landing page
  heroTitle: { 
    en: 'Farm Fresh, Direct to You', 
    hi: 'खेत से सीधे आपके घर', 
    pa: 'ਖੇਤ ਤੋਂ ਸਿੱਧਾ ਤੁਹਾਡੇ ਘਰ' 
  },
  heroSubtitle: { 
    en: 'Connect directly with Indian farmers. Get fresh produce at fair prices, while farmers earn more.', 
    hi: 'भारतीय किसानों से सीधे जुड़ें। उचित कीमत पर ताजा उपज पाएं, और किसानों को अधिक कमाई दें।', 
    pa: 'ਭਾਰਤੀ ਕਿਸਾਨਾਂ ਨਾਲ ਸਿੱਧੇ ਜੁੜੋ। ਉਚਿਤ ਕੀਮਤ ਤੇ ਤਾਜ਼ਾ ਉਪਜ ਲਵੋ, ਅਤੇ ਕਿਸਾਨਾਂ ਨੂੰ ਵੱਧ ਕਮਾਈ ਦਿਓ।' 
  },
  startShopping: { en: 'Start Shopping', hi: 'खरीदारी शुरू करें', pa: 'ਖਰੀਦਦਾਰੀ ਸ਼ੁਰੂ ਕਰੋ' },
  startSelling: { en: 'Start Selling', hi: 'बेचना शुरू करें', pa: 'ਵੇਚਣਾ ਸ਼ੁਰੂ ਕਰੋ' },
  
  // Features
  directFromFarm: { en: 'Direct from Farm', hi: 'खेत से सीधा', pa: 'ਖੇਤ ਤੋਂ ਸਿੱਧਾ' },
  directFromFarmDesc: { 
    en: 'No middlemen. Buy directly from farmers and help them earn more.', 
    hi: 'कोई बिचौलिया नहीं। किसानों से सीधे खरीदें और उन्हें अधिक कमाने में मदद करें।', 
    pa: 'ਕੋਈ ਵਿਚੋਲਾ ਨਹੀਂ। ਕਿਸਾਨਾਂ ਤੋਂ ਸਿੱਧੇ ਖਰੀਦੋ ਅਤੇ ਉਨ੍ਹਾਂ ਨੂੰ ਵੱਧ ਕਮਾਉਣ ਵਿੱਚ ਮਦਦ ਕਰੋ।' 
  },
  fairPricing: { en: 'Fair Pricing', hi: 'उचित मूल्य', pa: 'ਉਚਿਤ ਕੀਮਤ' },
  fairPricingDesc: { 
    en: 'Farmers set their own prices. Get quality produce at fair rates.', 
    hi: 'किसान अपना मूल्य खुद तय करें। उचित दरों पर गुणवत्तापूर्ण उपज पाएं।', 
    pa: 'ਕਿਸਾਨ ਆਪਣੀ ਕੀਮਤ ਖੁਦ ਤੈਅ ਕਰਨ। ਉਚਿਤ ਦਰਾਂ ਤੇ ਗੁਣਵੱਤਾ ਵਾਲੀ ਉਪਜ ਲਵੋ।' 
  },
  easyChat: { en: 'Easy Chat', hi: 'आसान चैट', pa: 'ਆਸਾਨ ਚੈਟ' },
  easyChatDesc: { 
    en: 'Chat directly with farmers like WhatsApp. Discuss quality, delivery, and more.', 
    hi: 'WhatsApp जैसे किसानों से सीधे चैट करें। गुणवत्ता, डिलीवरी आदि पर चर्चा करें।', 
    pa: 'WhatsApp ਵਾਂਗ ਕਿਸਾਨਾਂ ਨਾਲ ਸਿੱਧੇ ਚੈਟ ਕਰੋ। ਗੁਣਵੱਤਾ, ਡਿਲੀਵਰੀ ਆਦਿ ਬਾਰੇ ਚਰਚਾ ਕਰੋ।' 
  },
  securePayments: { en: 'Secure Payments', hi: 'सुरक्षित भुगतान', pa: 'ਸੁਰੱਖਿਅਤ ਭੁਗਤਾਨ' },
  securePaymentsDesc: { 
    en: 'Pay safely via UPI, Paytm, or card. Your money is protected.', 
    hi: 'UPI, Paytm या कार्ड से सुरक्षित भुगतान करें। आपका पैसा सुरक्षित है।', 
    pa: 'UPI, Paytm ਜਾਂ ਕਾਰਡ ਰਾਹੀਂ ਸੁਰੱਖਿਅਤ ਭੁਗਤਾਨ ਕਰੋ। ਤੁਹਾਡਾ ਪੈਸਾ ਸੁਰੱਖਿਅਤ ਹੈ।' 
  },
  
  // Categories
  categories: { en: 'Categories', hi: 'श्रेणियां', pa: 'ਸ਼੍ਰੇਣੀਆਂ' },
  allCategories: { en: 'All Categories', hi: 'सभी श्रेणियां', pa: 'ਸਾਰੀਆਂ ਸ਼੍ਰੇਣੀਆਂ' },
  
  // Listings
  addListing: { en: 'Add Listing', hi: 'लिस्टिंग जोड़ें', pa: 'ਲਿਸਟਿੰਗ ਸ਼ਾਮਲ ਕਰੋ' },
  editListing: { en: 'Edit Listing', hi: 'लिस्टिंग संपादित करें', pa: 'ਲਿਸਟਿੰਗ ਸੋਧੋ' },
  title: { en: 'Title', hi: 'शीर्षक', pa: 'ਸਿਰਲੇਖ' },
  description: { en: 'Description', hi: 'विवरण', pa: 'ਵੇਰਵਾ' },
  price: { en: 'Price', hi: 'कीमत', pa: 'ਕੀਮਤ' },
  pricePerUnit: { en: 'Price per unit', hi: 'प्रति यूनिट कीमत', pa: 'ਪ੍ਰਤੀ ਯੂਨਿਟ ਕੀਮਤ' },
  quantity: { en: 'Quantity', hi: 'मात्रा', pa: 'ਮਾਤਰਾ' },
  unit: { en: 'Unit', hi: 'इकाई', pa: 'ਯੂਨਿਟ' },
  organic: { en: 'Organic', hi: 'जैविक', pa: 'ਜੈਵਿਕ' },
  location: { en: 'Location', hi: 'स्थान', pa: 'ਸਥਾਨ' },
  harvestDate: { en: 'Harvest Date', hi: 'फसल की तारीख', pa: 'ਫ਼ਸਲ ਦੀ ਮਿਤੀ' },
  
  // Orders
  orderNow: { en: 'Order Now', hi: 'अभी ऑर्डर करें', pa: 'ਹੁਣੇ ਆਰਡਰ ਕਰੋ' },
  addToCart: { en: 'Add to Cart', hi: 'कार्ट में डालें', pa: 'ਕਾਰਟ ਵਿੱਚ ਪਾਓ' },
  checkout: { en: 'Checkout', hi: 'चेकआउट', pa: 'ਚੈਕਆਊਟ' },
  payNow: { en: 'Pay Now', hi: 'अभी भुगतान करें', pa: 'ਹੁਣੇ ਭੁਗਤਾਨ ਕਰੋ' },
  orderStatus: { en: 'Order Status', hi: 'ऑर्डर स्थिति', pa: 'ਆਰਡਰ ਸਥਿਤੀ' },
  pending: { en: 'Pending', hi: 'लंबित', pa: 'ਬਕਾਇਆ' },
  confirmed: { en: 'Confirmed', hi: 'पुष्टि', pa: 'ਪੁਸ਼ਟੀ' },
  shipped: { en: 'Shipped', hi: 'भेज दिया', pa: 'ਭੇਜ ਦਿੱਤਾ' },
  delivered: { en: 'Delivered', hi: 'पहुंचाया', pa: 'ਪਹੁੰਚਾਇਆ' },
  cancelled: { en: 'Cancelled', hi: 'रद्द', pa: 'ਰੱਦ' },
  
  // Chat
  sendMessage: { en: 'Send Message', hi: 'संदेश भेजें', pa: 'ਸੁਨੇਹਾ ਭੇਜੋ' },
  typeMessage: { en: 'Type a message...', hi: 'संदेश लिखें...', pa: 'ਸੁਨੇਹਾ ਲਿਖੋ...' },
  chatWithFarmer: { en: 'Chat with Farmer', hi: 'किसान से चैट करें', pa: 'ਕਿਸਾਨ ਨਾਲ ਚੈਟ ਕਰੋ' },
  
  // Dashboard
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड', pa: 'ਡੈਸ਼ਬੋਰਡ' },
  myListings: { en: 'My Listings', hi: 'मेरी लिस्टिंग', pa: 'ਮੇਰੀ ਲਿਸਟਿੰਗ' },
  myOrders: { en: 'My Orders', hi: 'मेरे ऑर्डर', pa: 'ਮੇਰੇ ਆਰਡਰ' },
  earnings: { en: 'Earnings', hi: 'कमाई', pa: 'ਕਮਾਈ' },
  totalSales: { en: 'Total Sales', hi: 'कुल बिक्री', pa: 'ਕੁੱਲ ਵਿਕਰੀ' },
  
  // Common
  search: { en: 'Search', hi: 'खोजें', pa: 'ਖੋਜੋ' },
  filter: { en: 'Filter', hi: 'फ़िल्टर', pa: 'ਫਿਲਟਰ' },
  sort: { en: 'Sort', hi: 'क्रम', pa: 'ਕ੍ਰਮ' },
  save: { en: 'Save', hi: 'सहेजें', pa: 'ਸੇਵ ਕਰੋ' },
  cancel: { en: 'Cancel', hi: 'रद्द करें', pa: 'ਰੱਦ ਕਰੋ' },
  delete: { en: 'Delete', hi: 'हटाएं', pa: 'ਮਿਟਾਓ' },
  edit: { en: 'Edit', hi: 'संपादित करें', pa: 'ਸੋਧੋ' },
  loading: { en: 'Loading...', hi: 'लोड हो रहा है...', pa: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...' },
  noResults: { en: 'No results found', hi: 'कोई परिणाम नहीं मिला', pa: 'ਕੋਈ ਨਤੀਜਾ ਨਹੀਂ ਮਿਲਿਆ' },
  perKg: { en: 'per kg', hi: 'प्रति किलो', pa: 'ਪ੍ਰਤੀ ਕਿਲੋ' },
  available: { en: 'Available', hi: 'उपलब्ध', pa: 'ਉਪਲਬਧ' },
  soldOut: { en: 'Sold Out', hi: 'बिक गया', pa: 'ਵਿਕ ਗਿਆ' },
  contactFarmer: { en: 'Contact Farmer', hi: 'किसान से संपर्क करें', pa: 'ਕਿਸਾਨ ਨਾਲ ਸੰਪਰਕ ਕਰੋ' },
  viewDetails: { en: 'View Details', hi: 'विवरण देखें', pa: 'ਵੇਰਵੇ ਦੇਖੋ' },
  
  // Units
  kg: { en: 'kg', hi: 'किलो', pa: 'ਕਿਲੋ' },
  quintal: { en: 'quintal', hi: 'क्विंटल', pa: 'ਕੁਇੰਟਲ' },
  ton: { en: 'ton', hi: 'टन', pa: 'ਟਨ' },
  dozen: { en: 'dozen', hi: 'दर्जन', pa: 'ਦਰਜਨ' },
  piece: { en: 'piece', hi: 'पीस', pa: 'ਪੀਸ' },
  litre: { en: 'litre', hi: 'लीटर', pa: 'ਲੀਟਰ' },
}

export function t(key: string, lang: Language = 'en'): string {
  const translation = translations[key]
  if (!translation) return key
  return translation[lang] || translation.en || key
}

export function getCategoryName(category: { name_en: string; name_hi: string; name_pa: string }, lang: Language): string {
  switch (lang) {
    case 'hi': return category.name_hi
    case 'pa': return category.name_pa
    default: return category.name_en
  }
}
