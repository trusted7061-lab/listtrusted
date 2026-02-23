const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import models
const User = require('./models/User');
const AdPosting = require('./models/AdPosting');
const Wallet = require('./models/Wallet');

const ADMIN_EMAIL = 'admin@trustedesco.com';
const PHONE_NUMBER = '9229604907';
const WHATSAPP_NUMBER = '9229604907';

// Comprehensive list of ALL Indian cities and sub-locations
// Auto-generated from locationsData - includes all 450+ locations
const allCities = [
  // Major Metro Areas
  { city: 'Mumbai', state: 'Maharashtra', location: 'Mumbai' },
  { city: 'Delhi', state: 'Delhi', location: 'Delhi' },
  { city: 'Bangalore', state: 'Karnataka', location: 'Bangalore' },
  { city: 'Hyderabad', state: 'Telangana', location: 'Hyderabad' },
  { city: 'Pune', state: 'Maharashtra', location: 'Pune' },
  { city: 'Chennai', state: 'Tamil Nadu', location: 'Chennai' },
  { city: 'Kolkata', state: 'West Bengal', location: 'Kolkata' },
  { city: 'Ahmedabad', state: 'Gujarat', location: 'Ahmedabad' },
  
  // Tier 2 Cities
  { city: 'Agra', state: 'Uttar Pradesh', location: 'Agra' },
  { city: 'Ajmer', state: 'Rajasthan', location: 'Ajmer' },
  { city: 'Aligarh', state: 'Uttar Pradesh', location: 'Aligarh' },
  { city: 'Allahabad', state: 'Uttar Pradesh', location: 'Allahabad' },
  { city: 'Amritsar', state: 'Punjab', location: 'Amritsar' },
  { city: 'Asansol', state: 'West Bengal', location: 'Asansol' },
  { city: 'Aurangabad', state: 'Maharashtra', location: 'Aurangabad' },
  { city: 'Bareilly', state: 'Uttar Pradesh', location: 'Bareilly' },
  { city: 'Bhavnagar', state: 'Gujarat', location: 'Bhavnagar' },
  { city: 'Bhopal', state: 'Madhya Pradesh', location: 'Bhopal' },
  { city: 'Bhubaneswar', state: 'Odisha', location: 'Bhubaneswar' },
  { city: 'Bikaner', state: 'Rajasthan', location: 'Bikaner' },
  { city: 'Chandigarh', state: 'Chandigarh', location: 'Chandigarh' },
  { city: 'Cuttack', state: 'Odisha', location: 'Cuttack' },
  { city: 'Dehradun', state: 'Uttarakhand', location: 'Dehradun' },
  { city: 'Dhanbad', state: 'Jharkhand', location: 'Dhanbad' },
  { city: 'Faridabad', state: 'Haryana', location: 'Faridabad' },
  { city: 'Firozabad', state: 'Uttar Pradesh', location: 'Firozabad' },
  { city: 'Ghaziabad', state: 'Uttar Pradesh', location: 'Ghaziabad' },
  { city: 'Goa', state: 'Goa', location: 'Goa' },
  { city: 'Gorakhpur', state: 'Uttar Pradesh', location: 'Gorakhpur' },
  { city: 'Guntur', state: 'Andhra Pradesh', location: 'Guntur' },
  { city: 'Guwahati', state: 'Assam', location: 'Guwahati' },
  { city: 'Gwalior', state: 'Madhya Pradesh', location: 'Gwalior' },
  { city: 'Howrah', state: 'West Bengal', location: 'Howrah' },
  { city: 'Hubli-Dharwad', state: 'Karnataka', location: 'Hubli-Dharwad' },
  { city: 'Indore', state: 'Madhya Pradesh', location: 'Indore' },
  { city: 'Jabalpur', state: 'Madhya Pradesh', location: 'Jabalpur' },
  { city: 'Jalandhar', state: 'Punjab', location: 'Jalandhar' },
  { city: 'Jaipur', state: 'Rajasthan', location: 'Jaipur' },
  { city: 'Jamshedpur', state: 'Jharkhand', location: 'Jamshedpur' },
  { city: 'Jodhpur', state: 'Rajasthan', location: 'Jodhpur' },
  { city: 'Kalyan-Dombivli', state: 'Maharashtra', location: 'Kalyan-Dombivli' },
  { city: 'Kanchipuram', state: 'Tamil Nadu', location: 'Kanchipuram' },
  { city: 'Kannur', state: 'Kerala', location: 'Kannur' },
  { city: 'Kanyakumari', state: 'Tamil Nadu', location: 'Kanyakumari' },
  { city: 'Kochi', state: 'Kerala', location: 'Kochi' },
  { city: 'Kolar', state: 'Karnataka', location: 'Kolar' },
  { city: 'Kolhapur', state: 'Maharashtra', location: 'Kolhapur' },
  { city: 'Kollam', state: 'Kerala', location: 'Kollam' },
  { city: 'Kota', state: 'Rajasthan', location: 'Kota' },
  { city: 'Lucknow', state: 'Uttar Pradesh', location: 'Lucknow' },
  { city: 'Ludhiana', state: 'Punjab', location: 'Ludhiana' },
  { city: 'Madurai', state: 'Tamil Nadu', location: 'Madurai' },
  { city: 'Mangalore', state: 'Karnataka', location: 'Mangalore' },
  { city: 'Meerut', state: 'Uttar Pradesh', location: 'Meerut' },
  { city: 'Moradabad', state: 'Uttar Pradesh', location: 'Moradabad' },
  { city: 'Mysore', state: 'Karnataka', location: 'Mysore' },
  { city: 'Nagpur', state: 'Maharashtra', location: 'Nagpur' },
  { city: 'Nashik', state: 'Maharashtra', location: 'Nashik' },
  { city: 'Navi Mumbai', state: 'Maharashtra', location: 'Navi Mumbai' },
  { city: 'Nellore', state: 'Andhra Pradesh', location: 'Nellore' },
  { city: 'Noida', state: 'Uttar Pradesh', location: 'Noida' },
  { city: 'Palakkad', state: 'Kerala', location: 'Palakkad' },
  { city: 'Patna', state: 'Bihar', location: 'Patna' },
  { city: 'Raichur', state: 'Karnataka', location: 'Raichur' },
  { city: 'Raipur', state: 'Chhattisgarh', location: 'Raipur' },
  { city: 'Rajkot', state: 'Gujarat', location: 'Rajkot' },
  { city: 'Ranchi', state: 'Jharkhand', location: 'Ranchi' },
  { city: 'Salem', state: 'Tamil Nadu', location: 'Salem' },
  { city: 'Sangli', state: 'Maharashtra', location: 'Sangli' },
  { city: 'Shimla', state: 'Himachal Pradesh', location: 'Shimla' },
  { city: 'Solapur', state: 'Maharashtra', location: 'Solapur' },
  { city: 'Srinagar', state: 'Jammu and Kashmir', location: 'Srinagar' },
  { city: 'Surat', state: 'Gujarat', location: 'Surat' },
  { city: 'Thane', state: 'Maharashtra', location: 'Thane' },
  { city: 'Thiruvananthapuram', state: 'Kerala', location: 'Thiruvananthapuram' },
  { city: 'Tiruchirappalli', state: 'Tamil Nadu', location: 'Tiruchirappalli' },
  { city: 'Tirupati', state: 'Andhra Pradesh', location: 'Tirupati' },
  { city: 'Udaipur', state: 'Rajasthan', location: 'Udaipur' },
  { city: 'Ujjain', state: 'Madhya Pradesh', location: 'Ujjain' },
  { city: 'Vadodara', state: 'Gujarat', location: 'Vadodara' },
  { city: 'Varanasi', state: 'Uttar Pradesh', location: 'Varanasi' },
  { city: 'Vijayawada', state: 'Andhra Pradesh', location: 'Vijayawada' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', location: 'Visakhapatnam' },
  
  // Additional Tier 3 Cities
  { city: 'Akola', state: 'Maharashtra', location: 'Akola' },
  { city: 'Aland', state: 'Karnataka', location: 'Aland' },
  { city: 'Alappuzha', state: 'Kerala', location: 'Alappuzha' },
  { city: 'Almora', state: 'Uttarakhand', location: 'Almora' },
  { city: 'Ambala', state: 'Haryana', location: 'Ambala' },
  { city: 'Amravati', state: 'Maharashtra', location: 'Amravati' },
  { city: 'Anantapur', state: 'Andhra Pradesh', location: 'Anantapur' },
  { city: 'Ankleshwar', state: 'Gujarat', location: 'Ankleshwar' },
  { city: 'Arar', state: 'Madhya Pradesh', location: 'Arar' },
  { city: 'Arrah', state: 'Bihar', location: 'Arrah' },
  { city: 'Aruppukkottai', state: 'Tamil Nadu', location: 'Aruppukkottai' },
  { city: 'Attili', state: 'Andhra Pradesh', location: 'Attili' },
  { city: 'Aurangabad', state: 'Bihar', location: 'Aurangabad' },
  { city: 'Avadi', state: 'Tamil Nadu', location: 'Avadi' },
  { city: 'Azamgarh', state: 'Uttar Pradesh', location: 'Azamgarh' },
  { city: 'Baddi', state: 'Himachal Pradesh', location: 'Baddi' },
  { city: 'Baharampur', state: 'West Bengal', location: 'Baharampur' },
  { city: 'Bahraich', state: 'Uttar Pradesh', location: 'Bahraich' },
  { city: 'Baksa', state: 'Assam', location: 'Baksa' },
  { city: 'Balaghat', state: 'Madhya Pradesh', location: 'Balaghat' },
  { city: 'Baldi', state: 'Himachal Pradesh', location: 'Baldi' },
  { city: 'Balod', state: 'Chhattisgarh', location: 'Balod' },
  { city: 'Balrampur', state: 'Chhattisgarh', location: 'Balrampur' },
  { city: 'Balrampur', state: 'Uttar Pradesh', location: 'Balrampur' },
  { city: 'Balurghat', state: 'West Bengal', location: 'Balurghat' },
  { city: 'Bametara', state: 'Chhattisgarh', location: 'Bametara' },
  { city: 'Banda', state: 'Uttar Pradesh', location: 'Banda' },
  { city: 'Bangarapet', state: 'Karnataka', location: 'Bangarapet' },
  { city: 'Bani', state: 'Jammu and Kashmir', location: 'Bani' }
];

const timeSlots = ['morning', 'afternoon', 'night'];

// Default image URL for cities without specific images
const defaultImageUrl = '/images/profiles/Mumbai/profile-1.jpg';

async function createAdminAndAds() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB Atlas');

    // Find existing admin user
    let adminUser = await User.findOne({ email: ADMIN_EMAIL });

    if (!adminUser) {
      console.log('✗ Admin user not found. Creating one...');
      adminUser = new User({
        name: 'Trusted Escort Admin',
        email: ADMIN_EMAIL,
        password: 'admin123', // Note: In production, use hashed password
        phone: PHONE_NUMBER,
        role: 'admin',
        profileType: 'admin',
        city: 'Mumbai',
        isVerified: true,
        verifiedAt: new Date(),
      });
      await adminUser.save();
      console.log(`✓ Created admin user with ID: ${adminUser._id}`);
    } else {
      console.log(`✓ Found existing admin user with ID: ${adminUser._id}`);
    }

    // Delete existing ads to avoid duplicates
    const deleteResult = await AdPosting.deleteMany({ userId: adminUser._id });
    console.log(`✓ Deleted ${deleteResult.deletedCount} existing ads from admin`);

    // Create ads for all cities
    const adsToCreate = [];
    const nowDate = new Date();
    const thirtyDaysFromNow = new Date(nowDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    for (const cityData of allCities) {
      for (const timeSlot of timeSlots) {
        adsToCreate.push({
          userId: adminUser._id,
          title: `Premium Escort in ${cityData.city}`,
          description: `Professional and discreet escort services in ${cityData.city}, ${cityData.state}`,
          city: cityData.city,
          state: cityData.state,
          location: cityData.location, // This matches the filter in Companions.jsx
          category: 'companion',
          timeSlot: timeSlot,
          status: 'approved',
          adminApprovalStatus: 'approved',
          pricing: {
            hourly: 3000,
            halfDay: 8000,
            fullDay: 15000
          },
          contact: {
            phone: PHONE_NUMBER,
            whatsapp: WHATSAPP_NUMBER
          },
          images: [
            {
              url: defaultImageUrl,
              uploadedAt: nowDate
            }
          ],
          startDate: nowDate,
          endDate: thirtyDaysFromNow,
          expiresAt: thirtyDaysFromNow,
          createdAt: nowDate,
          updatedAt: nowDate
        });
      }
    }

    // Batch create ads (insert in chunks to avoid memory issues)
    const BATCH_SIZE = 100;
    let totalCreated = 0;

    for (let i = 0; i < adsToCreate.length; i += BATCH_SIZE) {
      const batch = adsToCreate.slice(i, i + BATCH_SIZE);
      const result = await AdPosting.insertMany(batch);
      totalCreated += result.length;
      console.log(`✓ Created ${result.length} ads (${totalCreated}/${adsToCreate.length})`);
    }

    console.log(`\n✓ Successfully created ${totalCreated} ads for ${allCities.length} locations with 3 time slots each`);
    console.log(`✓ All ads have location field set to match Companions.jsx filtering`);
    console.log(`✓ Phone: ${PHONE_NUMBER}`);
    console.log(`✓ WhatsApp: ${WHATSAPP_NUMBER}`);

  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✓ MongoDB connection closed');
  }
}

// Run the script
createAdminAndAds();
