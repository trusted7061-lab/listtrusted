// Sub-areas / localities for each city
// URL: /escorts-service/:city/:area

const AREAS = {
  'delhi': [
    { name: 'Connaught Place',  slug: 'connaught-place' },
    { name: 'Karol Bagh',       slug: 'karol-bagh' },
    { name: 'Lajpat Nagar',     slug: 'lajpat-nagar' },
    { name: 'Dwarka',           slug: 'dwarka' },
    { name: 'South Delhi',      slug: 'south-delhi' },
    { name: 'Rohini',           slug: 'rohini' },
    { name: 'Saket',            slug: 'saket' },
    { name: 'Janakpuri',        slug: 'janakpuri' },
    { name: 'Vasant Kunj',      slug: 'vasant-kunj' },
    { name: 'Noida Sector 18',  slug: 'noida-sector-18' },
  ],
  'mumbai': [
    { name: 'Bandra',           slug: 'bandra' },
    { name: 'Juhu',             slug: 'juhu' },
    { name: 'Andheri',          slug: 'andheri' },
    { name: 'Colaba',           slug: 'colaba' },
    { name: 'Powai',            slug: 'powai' },
    { name: 'Borivali',         slug: 'borivali' },
    { name: 'Kurla',            slug: 'kurla' },
    { name: 'Dadar',            slug: 'dadar' },
    { name: 'Malad',            slug: 'malad' },
    { name: 'Thane West',       slug: 'thane-west' },
  ],
  'bangalore': [
    { name: 'Koramangala',      slug: 'koramangala' },
    { name: 'Indiranagar',      slug: 'indiranagar' },
    { name: 'MG Road',          slug: 'mg-road' },
    { name: 'Whitefield',       slug: 'whitefield' },
    { name: 'Electronic City',  slug: 'electronic-city' },
    { name: 'HSR Layout',       slug: 'hsr-layout' },
    { name: 'Marathahalli',     slug: 'marathahalli' },
    { name: 'Jayanagar',        slug: 'jayanagar' },
    { name: 'JP Nagar',         slug: 'jp-nagar' },
  ],
  'hyderabad': [
    { name: 'Hitech City',      slug: 'hitech-city' },
    { name: 'Banjara Hills',    slug: 'banjara-hills' },
    { name: 'Jubilee Hills',    slug: 'jubilee-hills' },
    { name: 'Gachibowli',       slug: 'gachibowli' },
    { name: 'Secunderabad',     slug: 'secunderabad' },
    { name: 'Kukatpally',       slug: 'kukatpally' },
    { name: 'Madhapur',         slug: 'madhapur' },
    { name: 'Begumpet',         slug: 'begumpet' },
  ],
  'chennai': [
    { name: 'Anna Nagar',       slug: 'anna-nagar' },
    { name: 'T. Nagar',         slug: 't-nagar' },
    { name: 'Velachery',        slug: 'velachery' },
    { name: 'Adyar',            slug: 'adyar' },
    { name: 'Nungambakkam',     slug: 'nungambakkam' },
    { name: 'OMR',              slug: 'omr' },
    { name: 'Porur',            slug: 'porur' },
  ],
  'kolkata': [
    { name: 'Park Street',      slug: 'park-street' },
    { name: 'Salt Lake',        slug: 'salt-lake' },
    { name: 'New Town',         slug: 'new-town' },
    { name: 'Esplanade',        slug: 'esplanade' },
    { name: 'Howrah',           slug: 'howrah' },
    { name: 'Ballygunge',       slug: 'ballygunge' },
  ],
  'pune': [
    { name: 'Koregaon Park',    slug: 'koregaon-park' },
    { name: 'Kalyani Nagar',    slug: 'kalyani-nagar' },
    { name: 'Viman Nagar',      slug: 'viman-nagar' },
    { name: 'Hadapsar',         slug: 'hadapsar' },
    { name: 'Kothrud',          slug: 'kothrud' },
    { name: 'Shivajinagar',     slug: 'shivajinagar' },
  ],
  'ahmedabad': [
    { name: 'CG Road',          slug: 'cg-road' },
    { name: 'Navrangpura',      slug: 'navrangpura' },
    { name: 'Satellite',        slug: 'satellite' },
    { name: 'SG Highway',       slug: 'sg-highway' },
    { name: 'Vastrapur',        slug: 'vastrapur' },
  ],
  'noida': [
    { name: 'Sector 18',        slug: 'sector-18' },
    { name: 'Sector 62',        slug: 'sector-62' },
    { name: 'Sector 50',        slug: 'sector-50' },
    { name: 'Greater Noida',    slug: 'greater-noida' },
  ],
  'gurugram': [
    { name: 'DLF Phase 1',      slug: 'dlf-phase-1' },
    { name: 'DLF Phase 4',      slug: 'dlf-phase-4' },
    { name: 'Golf Course Road', slug: 'golf-course-road' },
    { name: 'Sohna Road',       slug: 'sohna-road' },
    { name: 'MG Road',          slug: 'mg-road' },
  ],
  'jaipur': [
    { name: 'MI Road',          slug: 'mi-road' },
    { name: 'Malviya Nagar',    slug: 'malviya-nagar' },
    { name: 'Vaishali Nagar',   slug: 'vaishali-nagar' },
    { name: 'C-Scheme',         slug: 'c-scheme' },
  ],
  'goa': [
    { name: 'Calangute',        slug: 'calangute' },
    { name: 'Baga',             slug: 'baga' },
    { name: 'Candolim',         slug: 'candolim' },
    { name: 'Panaji',           slug: 'panaji' },
    { name: 'Vagator',          slug: 'vagator' },
    { name: 'Anjuna',           slug: 'anjuna' },
  ],
  'chandigarh': [
    { name: 'Sector 17',        slug: 'sector-17' },
    { name: 'Sector 22',        slug: 'sector-22' },
    { name: 'Sector 35',        slug: 'sector-35' },
  ],
  'lucknow': [
    { name: 'Hazratganj',       slug: 'hazratganj' },
    { name: 'Gomti Nagar',      slug: 'gomti-nagar' },
    { name: 'Aliganj',          slug: 'aliganj' },
  ],
  'kochi': [
    { name: 'MG Road',          slug: 'mg-road' },
    { name: 'Edapally',         slug: 'edapally' },
    { name: 'Kakkanad',         slug: 'kakkanad' },
  ],
};

// Build area lookup: citySlug → { areaSlug → area }
const AREA_BY_SLUG = {};
Object.entries(AREAS).forEach(([citySlug, areas]) => {
  AREA_BY_SLUG[citySlug] = areas.reduce((map, area) => {
    map[area.slug] = area;
    return map;
  }, {});
});

const getAreasForCity = (citySlug) => AREAS[citySlug] || [];
const getArea = (citySlug, areaSlug) => (AREA_BY_SLUG[citySlug] || {})[areaSlug] || null;

module.exports = { AREAS, AREA_BY_SLUG, getAreasForCity, getArea };
