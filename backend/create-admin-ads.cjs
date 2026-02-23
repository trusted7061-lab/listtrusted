const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import models
const User = require('./models/User');
const AdPosting = require('./models/AdPosting');
const Wallet = require('./models/Wallet');

const ADMIN_EMAIL = 'admin@trustedesco.com'; // Change this to your actual admin email
const PHONE_NUMBER = '9229604907';
const WHATSAPP_NUMBER = '9229604907';

// All cities and their sub-locations/areas to create ads for
const majorCities = [
  // Major cities with areas/sub-locations
  { city: 'Mumbai', state: 'Maharashtra', location: 'Mumbai' },
  { city: 'Bandra', state: 'Maharashtra', location: 'Mumbai' },
  { city: 'Andheri', state: 'Maharashtra', location: 'Mumbai' },
  { city: 'Juhu', state: 'Maharashtra', location: 'Mumbai' },
  { city: 'Powai', state: 'Maharashtra', location: 'Mumbai' },
  { city: 'Lower Parel', state: 'Maharashtra', location: 'Mumbai' },
  { city: 'Worli', state: 'Maharashtra', location: 'Mumbai' },
  { city: 'Colaba', state: 'Maharashtra', location: 'Mumbai' },
  { city: 'Chembur', state: 'Maharashtra', location: 'Mumbai' },
  { city: 'Goregaon', state: 'Maharashtra', location: 'Mumbai' },
  
  { city: 'Delhi', state: 'Delhi', location: 'Delhi' },
  { city: 'Connaught Place', state: 'Delhi', location: 'Delhi' },
  { city: 'Greater Kailash', state: 'Delhi', location: 'Delhi' },
  { city: 'Karol Bagh', state: 'Delhi', location: 'Delhi' },
  { city: 'Saket', state: 'Delhi', location: 'Delhi' },
  { city: 'Dwarka', state: 'Delhi', location: 'Delhi' },
  { city: 'Rohini', state: 'Delhi', location: 'Delhi' },
  { city: 'Vasant Kunj', state: 'Delhi', location: 'Delhi' },
  { city: 'Lajpat Nagar', state: 'Delhi', location: 'Delhi' },
  { city: 'Green Park', state: 'Delhi', location: 'Delhi' },
  
  { city: 'Bangalore', state: 'Karnataka', location: 'Bangalore' },
  { city: 'Koramangala', state: 'Karnataka', location: 'Bangalore' },
  { city: 'Indiranagar', state: 'Karnataka', location: 'Bangalore' },
  { city: 'Whitefield', state: 'Karnataka', location: 'Bangalore' },
  { city: 'Electronic City', state: 'Karnataka', location: 'Bangalore' },
  { city: 'BTM Layout', state: 'Karnataka', location: 'Bangalore' },
  { city: 'Hebbal', state: 'Karnataka', location: 'Bangalore' },
  { city: 'Marathahalli', state: 'Karnataka', location: 'Bangalore' },
  { city: 'Bellandur', state: 'Karnataka', location: 'Bangalore' },
  { city: 'Domlur', state: 'Karnataka', location: 'Bangalore' },
  
  { city: 'Hyderabad', state: 'Telangana', location: 'Hyderabad' },
  { city: 'Banjara Hills', state: 'Telangana', location: 'Hyderabad' },
  { city: 'Jubilee Hills', state: 'Telangana', location: 'Hyderabad' },
  { city: 'HITEC City', state: 'Telangana', location: 'Hyderabad' },
  { city: 'Gachibowli', state: 'Telangana', location: 'Hyderabad' },
  { city: 'Madhapur', state: 'Telangana', location: 'Hyderabad' },
  { city: 'Secunderabad', state: 'Telangana', location: 'Hyderabad' },
  { city: 'Kukatpally', state: 'Telangana', location: 'Hyderabad' },
  { city: 'SR Nagar', state: 'Telangana', location: 'Hyderabad' },
  { city: 'Somajiguda', state: 'Telangana', location: 'Hyderabad' },
  
  { city: 'Pune', state: 'Maharashtra', location: 'Pune' },
  { city: 'Koregaon Park', state: 'Maharashtra', location: 'Pune' },
  { city: 'Hinjewadi', state: 'Maharashtra', location: 'Pune' },
  { city: 'Kharadi', state: 'Maharashtra', location: 'Pune' },
  { city: 'Viman Nagar', state: 'Maharashtra', location: 'Pune' },
  { city: 'Aundh', state: 'Maharashtra', location: 'Pune' },
  { city: 'Baner', state: 'Maharashtra', location: 'Pune' },
  { city: 'Wakad', state: 'Maharashtra', location: 'Pune' },
  { city: 'Kalyani Nagar', state: 'Maharashtra', location: 'Pune' },
  { city: 'Shivajinagar', state: 'Maharashtra', location: 'Pune' },
  
  { city: 'Chennai', state: 'Tamil Nadu', location: 'Chennai' },
  { city: 'T Nagar', state: 'Tamil Nadu', location: 'Chennai' },
  { city: 'Anna Nagar', state: 'Tamil Nadu', location: 'Chennai' },
  { city: 'Velachery', state: 'Tamil Nadu', location: 'Chennai' },
  { city: 'Nungambakkam', state: 'Tamil Nadu', location: 'Chennai' },
  { city: 'Mylapore', state: 'Tamil Nadu', location: 'Chennai' },
  { city: 'Guindy', state: 'Tamil Nadu', location: 'Chennai' },
  { city: 'Adyar', state: 'Tamil Nadu', location: 'Chennai' },
  { city: 'Besant Nagar', state: 'Tamil Nadu', location: 'Chennai' },
  { city: 'Tambaram', state: 'Tamil Nadu', location: 'Chennai' },
  
  { city: 'Kolkata', state: 'West Bengal', location: 'Kolkata' },
  { city: 'Park Street', state: 'West Bengal', location: 'Kolkata' },
  { city: 'Salt Lake', state: 'West Bengal', location: 'Kolkata' },
  { city: 'New Town', state: 'West Bengal', location: 'Kolkata' },
  { city: 'Ballygunge', state: 'West Bengal', location: 'Kolkata' },
  { city: 'Esplanade', state: 'West Bengal', location: 'Kolkata' },
  { city: 'Howrah', state: 'West Bengal', location: 'Kolkata' },
  { city: 'Tollygunge', state: 'West Bengal', location: 'Kolkata' },
  { city: 'Alipore', state: 'West Bengal', location: 'Kolkata' },
  
  { city: 'Ahmedabad', state: 'Gujarat', location: 'Ahmedabad' },
  { city: 'CG Road', state: 'Gujarat', location: 'Ahmedabad' },
  { city: 'Navrangpura', state: 'Gujarat', location: 'Ahmedabad' },
  { city: 'Vastrapur', state: 'Gujarat', location: 'Ahmedabad' },
  { city: 'Chandkheda', state: 'Gujarat', location: 'Ahmedabad' },
  { city: 'Maninagar', state: 'Gujarat', location: 'Ahmedabad' },
  { city: 'Ashram Road', state: 'Gujarat', location: 'Ahmedabad' },
  { city: 'Paldi', state: 'Gujarat', location: 'Ahmedabad' },
  
  { city: 'Jaipur', state: 'Rajasthan', location: 'Jaipur' },
  { city: 'MI Road', state: 'Rajasthan', location: 'Jaipur' },
  { city: 'C-Scheme', state: 'Rajasthan', location: 'Jaipur' },
  { city: 'Civil Lines', state: 'Rajasthan', location: 'Jaipur' },
  { city: 'Vaishali Nagar', state: 'Rajasthan', location: 'Jaipur' },
  { city: 'Malviya Nagar', state: 'Rajasthan', location: 'Jaipur' },
  { city: 'Jagatpura', state: 'Rajasthan', location: 'Jaipur' },
  
  { city: 'Lucknow', state: 'Uttar Pradesh', location: 'Lucknow' },
  { city: 'Hazratganj', state: 'Uttar Pradesh', location: 'Lucknow' },
  { city: 'Gomti Nagar', state: 'Uttar Pradesh', location: 'Lucknow' },
  { city: 'Aliganj', state: 'Uttar Pradesh', location: 'Lucknow' },
  { city: 'Indira Nagar', state: 'Uttar Pradesh', location: 'Lucknow' },
  
  { city: 'Chandigarh', state: 'Chandigarh', location: 'Chandigarh' },
  { city: 'Sector 17', state: 'Chandigarh', location: 'Chandigarh' },
  { city: 'Sector 22', state: 'Chandigarh', location: 'Chandigarh' },
  { city: 'Sector 35', state: 'Chandigarh', location: 'Chandigarh' },
  { city: 'Sector 43', state: 'Chandigarh', location: 'Chandigarh' },
  
  { city: 'Goa', state: 'Goa', location: 'Goa' },
  { city: 'Calangute', state: 'Goa', location: 'Goa' },
  { city: 'Baga', state: 'Goa', location: 'Goa' },
  { city: 'Candolim', state: 'Goa', location: 'Goa' },
  { city: 'Anjuna', state: 'Goa', location: 'Goa' },
  { city: 'Panjim', state: 'Goa', location: 'Goa' },
  
  // Other major cities without detailed areas
  { city: 'Agra', state: 'Uttar Pradesh', location: 'Agra' },
  { city: 'Ajmer', state: 'Rajasthan', location: 'Ajmer' },
  { city: 'Aligarh', state: 'Uttar Pradesh', location: 'Aligarh' },
  { city: 'Allahabad-Prayagraj', state: 'Uttar Pradesh', location: 'Allahabad-Prayagraj' },
  { city: 'Amritsar', state: 'Punjab', location: 'Amritsar' },
  { city: 'Asansol', state: 'West Bengal', location: 'Asansol' },
  { city: 'Aurangabad', state: 'Maharashtra', location: 'Aurangabad' },
  { city: 'Bareilly', state: 'Uttar Pradesh', location: 'Bareilly' },
  { city: 'Bhavnagar', state: 'Gujarat', location: 'Bhavnagar' },
  { city: 'Bhopal', state: 'Madhya Pradesh', location: 'Bhopal' },
  { city: 'Bhubaneswar', state: 'Odisha', location: 'Bhubaneswar' },
  { city: 'Bikaner', state: 'Rajasthan', location: 'Bikaner' },
  { city: 'Cuttack', state: 'Odisha', location: 'Cuttack' },
  { city: 'Dehradun', state: 'Uttarakhand', location: 'Dehradun' },
  { city: 'Dhanbad', state: 'Jharkhand', location: 'Dhanbad' },
  { city: 'Faridabad', state: 'Haryana', location: 'Faridabad' },
  { city: 'Firozabad', state: 'Uttar Pradesh', location: 'Firozabad' },
  { city: 'Ghaziabad', state: 'Uttar Pradesh', location: 'Ghaziabad' },
  { city: 'Gorakhpur', state: 'Uttar Pradesh', location: 'Gorakhpur' },
  { city: 'Guntur', state: 'Andhra Pradesh', location: 'Guntur' },
  { city: 'Guwahati', state: 'Assam', location: 'Guwahati' },
  { city: 'Gwalior', state: 'Madhya Pradesh', location: 'Gwalior' },
  { city: 'Hubli-Dharwad', state: 'Karnataka', location: 'Hubli-Dharwad' },
  { city: 'Indore', state: 'Madhya Pradesh', location: 'Indore' },
  { city: 'Jabalpur', state: 'Madhya Pradesh', location: 'Jabalpur' },
  { city: 'Jalandhar', state: 'Punjab', location: 'Jalandhar' },
  { city: 'Jamshedpur', state: 'Jharkhand', location: 'Jamshedpur' },
  { city: 'Jodhpur', state: 'Rajasthan', location: 'Jodhpur' },
  { city: 'Kalyan-Dombivli', state: 'Maharashtra', location: 'Kalyan-Dombivli' },
  { city: 'Kollam', state: 'Kerala', location: 'Kollam' },
  { city: 'Kota', state: 'Rajasthan', location: 'Kota' },
  { city: 'Ludhiana', state: 'Punjab', location: 'Ludhiana' },
  { city: 'Madurai', state: 'Tamil Nadu', location: 'Madurai' },
  { city: 'Mangalore', state: 'Karnataka', location: 'Mangalore' },
  { city: 'Meerut', state: 'Uttar Pradesh', location: 'Meerut' },
  { city: 'Moradabad', state: 'Uttar Pradesh', location: 'Moradabad' },
  { city: 'Mysuru-Mysore', state: 'Karnataka', location: 'Mysuru-Mysore' },
  { city: 'Nagpur', state: 'Maharashtra', location: 'Nagpur' },
  { city: 'Nashik', state: 'Maharashtra', location: 'Nashik' },
  { city: 'Navi-Mumbai', state: 'Maharashtra', location: 'Navi-Mumbai' },
  { city: 'Nellore', state: 'Andhra Pradesh', location: 'Nellore' },
  { city: 'Noida', state: 'Uttar Pradesh', location: 'Noida' },
  { city: 'Patna', state: 'Bihar', location: 'Patna' },
  { city: 'Raipur', state: 'Chhattisgarh', location: 'Raipur' },
  { city: 'Rajkot', state: 'Gujarat', location: 'Rajkot' },
  { city: 'Ranchi', state: 'Jharkhand', location: 'Ranchi' },
  { city: 'Salem', state: 'Tamil Nadu', location: 'Salem' },
  { city: 'Solapur', state: 'Maharashtra', location: 'Solapur' },
  { city: 'Srinagar', state: 'Jammu and Kashmir', location: 'Srinagar' },
  { city: 'Surat', state: 'Gujarat', location: 'Surat' },
  { city: 'Thane', state: 'Maharashtra', location: 'Thane' },
  { city: 'Tiruchirappalli', state: 'Tamil Nadu', location: 'Tiruchirappalli' },
  { city: 'Vadodara', state: 'Gujarat', location: 'Vadodara' },
  { city: 'Varanasi', state: 'Uttar Pradesh', location: 'Varanasi' },
  { city: 'Vijayawada', state: 'Andhra Pradesh', location: 'Vijayawada' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', location: 'Visakhapatnam' }
];

// Time slots and the number of ads per
const timeSlots = ['morning', 'afternoon', 'night'];

// Image URLs for each city (using images from public/images/profiles)
const imageUrls = {
  'Agra': '/images/profiles/Agra/profile-1.jpg',
  'Ahmedabad': '/images/profiles/Ahmedabad/profile-1.jpg',
  'Ajmer': '/images/profiles/Ajmer/profile-1.jpg',
  'Aligarh': '/images/profiles/Aligarh/profile-1.jpg',
  'Allahabad-Prayagraj': '/images/profiles/Allahabad-Prayagraj/profile-1.jpg',
  'Amritsar': '/images/profiles/Amritsar/profile-1.jpg',
  'Asansol': '/images/profiles/Asansol/profile-1.jpg',
  'Aurangabad': '/images/profiles/Aurangabad/profile-1.jpg',
  'Bangalore': '/images/profiles/Bangalore/profile-1.jpg',
  'Bareilly': '/images/profiles/Bareilly/profile-1.jpg',
  'Bhavnagar': '/images/profiles/Bhavnagar/profile-1.jpg',
  'Bhopal': '/images/profiles/Bhopal/profile-1.jpg',
  'Bhubaneswar': '/images/profiles/Bhubaneswar/profile-1.jpg',
  'Bikaner': '/images/profiles/Bikaner/profile-1.jpg',
  'Chandigarh': '/images/profiles/Chandigarh/profile-1.jpg',
  'Chennai': '/images/profiles/Chennai/profile-1.jpg',
  'Cuttack': '/images/profiles/Cuttack/profile-1.jpg',
  'Dehradun': '/images/profiles/Dehradun/profile-1.jpg',
  'Delhi': '/images/profiles/Delhi/profile-1.jpg',
  'Dhanbad': '/images/profiles/Dhanbad/profile-1.jpg',
  'Faridabad': '/images/profiles/Faridabad/profile-1.jpg',
  'Firozabad': '/images/profiles/Firozabad/profile-1.jpg',
  'Ghaziabad': '/images/profiles/Ghaziabad/profile-1.jpg',
  'Goa': '/images/profiles/Goa/profile-1.jpg',
  'Gorakhpur': '/images/profiles/Gorakhpur/profile-1.jpg',
  'Guntur': '/images/profiles/Guntur/profile-1.jpg',
  'Guwahati': '/images/profiles/Guwahati/profile-1.jpg',
  'Gwalior': '/images/profiles/Gwalior/profile-1.jpg',
  'Howrah': '/images/profiles/Howrah/profile-1.jpg',
  'Hubli-Dharwad': '/images/profiles/Hubli-Dharwad/profile-1.jpg',
  'Hyderabad': '/images/profiles/Hyderabad/profile-1.jpg',
  'Indore': '/images/profiles/Indore/profile-1.jpg',
  'Jabalpur': '/images/profiles/Jabalpur/profile-1.jpg',
  'Jaipur': '/images/profiles/Jaipur/profile-1.jpg',
  'Jalandhar': '/images/profiles/Jalandhar/profile-1.jpg',
  'Jamshedpur': '/images/profiles/Jamshedpur/profile-1.jpg',
  'Jodhpur': '/images/profiles/Jodhpur/profile-1.jpg',
  'Kalyan-Dombivli': '/images/profiles/Kalyan-Dombivli/profile-1.jpg',
  'Kolkata': '/images/profiles/Kolkata/profile-1.jpg',
  'Kollam': '/images/profiles/Kollam/profile-1.jpg',
  'Kota': '/images/profiles/Kota/profile-1.jpg',
  'Lucknow': '/images/profiles/Lucknow/profile-1.jpg',
  'Ludhiana': '/images/profiles/Ludhiana/profile-1.jpg',
  'Madurai': '/images/profiles/Madurai/profile-1.jpg',
  'Mangalore': '/images/profiles/Mangalore/profile-1.jpg',
  'Meerut': '/images/profiles/Meerut/profile-1.jpg',
  'Moradabad': '/images/profiles/Moradabad/profile-1.jpg',
  'Mumbai': '/images/profiles/Mumbai/profile-1.jpg',
  'Mysuru-Mysore': '/images/profiles/Mysuru-Mysore/profile-1.jpg',
  'Nagpur': '/images/profiles/Nagpur/profile-1.jpg',
  'Nashik': '/images/profiles/Nashik/profile-1.jpg',
  'Navi-Mumbai': '/images/profiles/Navi-Mumbai/profile-1.jpg',
  'Nellore': '/images/profiles/Nellore/profile-1.jpg',
  'Noida': '/images/profiles/Noida/profile-1.jpg',
  'Patna': '/images/profiles/Patna/profile-1.jpg',
  'Pune': '/images/profiles/Pune/profile-1.jpg',
  'Raipur': '/images/profiles/Raipur/profile-1.jpg',
  'Rajkot': '/images/profiles/Rajkot/profile-1.jpg',
  'Ranchi': '/images/profiles/Ranchi/profile-1.jpg',
  'Salem': '/images/profiles/Salem/profile-1.jpg',
  'Solapur': '/images/profiles/Solapur/profile-1.jpg',
  'Srinagar': '/images/profiles/Srinagar/profile-1.jpg',
  'Surat': '/images/profiles/Surat/profile-1.jpg',
  'Thane': '/images/profiles/Thane/profile-1.jpg',
  'Tiruchirappalli': '/images/profiles/Tiruchirappalli/profile-1.jpg',
  'Vadodara': '/images/profiles/Vadodara/profile-1.jpg',
  'Varanasi': '/images/profiles/Varanasi/profile-1.jpg',
  'Vijayawada': '/images/profiles/Vijayawada/profile-1.jpg',
  'Visakhapatnam': '/images/profiles/Visakhapatnam/profile-1.jpg'
};

async function createAdminAds() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://trustedescort:Kold800%2A@trustedescort.hpw445b.mongodb.net/trustedescort?retryWrites=true&w=majority';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Find or create admin user
    let admin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (!admin) {
      console.log('Admin user not found, creating...');
      admin = await User.create({
        email: ADMIN_EMAIL,
        phone: PHONE_NUMBER,
        passwordHash: 'admin', // In production, this should be hashed
        displayName: 'Super Admin',
        role: 'admin',
        isEmailVerified: true,
        isPhoneVerified: true,
        isVerified: true,
        authProvider: 'local'
      });
      console.log('Admin user created:', admin._id);
    } else {
      console.log('Admin user found:', admin._id);
    }

    // Ensure admin has wallet
    let wallet = await Wallet.findOne({ userId: admin._id });
    if (!wallet) {
      wallet = new Wallet({ userId: admin._id });
      await wallet.save();
      console.log('Wallet created for admin');
    }

    // Delete existing ads from admin user to avoid duplicates
    console.log('Checking for existing ads from admin...');
    const existingAds = await AdPosting.deleteMany({ userId: admin._id });
    if (existingAds.deletedCount > 0) {
      console.log(`✓ Deleted ${existingAds.deletedCount} existing ads`);
    }

    let adsCreated = 0;

    // Create 15 ads: 5 cities x 3 time slots
    for (const cityData of majorCities) {
      for (const timeSlot of timeSlots) {
        const adTitle = `Premium ${cityData.city} Companion Services - ${timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)}`;
        const adDescription = `Premium and discreet companion services available in ${cityData.city}, ${cityData.state}. 
Professional, friendly, and punctual service. Available for dates, events, social gatherings, and more.
Call or WhatsApp for immediate availability and booking.
${PHONE_NUMBER} / ${WHATSAPP_NUMBER}`;

        const now = new Date();
        const expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

        const adPosting = new AdPosting({
          userId: admin._id,
          title: adTitle,
          description: adDescription,
          category: 'companion',
          timeSlot: timeSlot,
          location: cityData.location,
          city: cityData.city,
          state: cityData.state,
          contact: {
            phone: PHONE_NUMBER,
            email: ADMIN_EMAIL,
            whatsapp: WHATSAPP_NUMBER
          },
          pricing: {
            hourly: 3000,
            halfDay: 8000,
            fullDay: 15000
          },
          images: [
            {
              url: imageUrls[cityData.location],
              uploadedAt: now
            }
          ],
          coinsUsed: 0,
          isPremium: false,
          startDate: now,
          endDate: now,
          expiresAt: expiryDate,
          status: 'approved',
          adminApprovalStatus: 'approved',
          approvedBy: admin._id,
          metadata: {
            ipAddress: '127.0.0.1',
            userAgent: 'admin-script',
            deviceType: 'admin'
          }
        });

        await adPosting.save();
        adsCreated++;
        console.log(`✓ Created ad ${adsCreated}: ${adTitle}`);
      }
    }

    console.log(`\n✓✓✓ Successfully created ${adsCreated} ads! ✓✓✓`);
    console.log(`\n📍 Coverage: ${majorCities.length} locations × 3 time slots = ${adsCreated} ads`);
    console.log(`\n Time Slots:`);
    console.log(`   🌅 Morning: 6 AM - 12 PM`);
    console.log(`   🌞 Afternoon: 12 PM - 6 PM`);
    console.log(`   🌙 Night: 6 PM - 6 AM`);

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error creating ads:', error.message);
    process.exit(1);
  }
}

createAdminAds();
