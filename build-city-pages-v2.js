/**
 * build-city-pages-v2.js
 * Generates premium city pages for top 10 inner-ring cities × 4 services
 * Each page: unique localized content, proper schema, photos, FAQ, CTAs
 */
const fs   = require('fs');
const path = require('path');

const BASE = __dirname;
const PHONE = '(616) 822-1978';
const PHONE_RAW = '6168221978';

// ── Top 10 inner-ring cities by population ──
const CITIES = [
  {
    slug: 'grand-rapids-mi', name: 'Grand Rapids', pop: '198,000+',
    county: 'Kent County', zip: '49503, 49504, 49505, 49506, 49507, 49508',
    distance: '6 miles', driveTime: '12 minutes',
    geo: { lat: 42.9634, lng: -85.6681 },
    localInfo: 'As the second-largest city in Michigan and the economic hub of West Michigan, Grand Rapids has over 80,000 residential properties ranging from historic Heritage Hill mansions to modern downtown condos. The Grand River and its tributaries create significant flood risk, particularly in the Riverside, Creston, and Heartside neighborhoods.',
    waterRisk: 'Grand Rapids faces unique water damage risks from the Grand River floodplain, aging municipal infrastructure (some pipes dating to the 1920s), and dense urban development that increases stormwater runoff. The city\'s combined sewer system can overflow during heavy rains, impacting basements throughout the west side and Grandville Avenue corridor.',
    fireRisk: 'Grand Rapids\' mix of historic wood-frame homes in Heritage Hill, Eastown, and the west side, combined with older electrical wiring and aging heating systems, creates elevated fire risk. Multi-unit housing density in midtown and downtown increases the complexity of fire restoration projects.',
    moldRisk: 'Grand Rapids\' proximity to the Grand River and Lake Michigan creates sustained humidity levels above 70% during summer months. Older homes in Heritage Hill, Alger Heights, and Creston often have stone foundations with poor vapor barriers, creating ideal conditions for basement mold growth.',
    sewageRisk: 'Grand Rapids operates a combined sewer overflow (CSO) system—meaning stormwater and sewage share the same pipes. During heavy rainfall, this system can back up into basements, particularly in the west side, Creston, and Garfield Park neighborhoods. The city has invested in CSO improvements, but aging laterals remain a risk.'
  },
  {
    slug: 'wyoming-mi', name: 'Wyoming', pop: '76,000+',
    county: 'Kent County', zip: '49418, 49509, 49519',
    distance: '8 miles', driveTime: '15 minutes',
    geo: { lat: 42.9134, lng: -85.7053 },
    localInfo: 'Wyoming is the second-largest city in the Grand Rapids metro area with over 30,000 households. Known for its suburban neighborhoods and strong school district, Wyoming features primarily 1950s–1980s ranch-style homes. Buck Creek and Plaster Creek run through the city, creating localized flood zones.',
    waterRisk: 'Wyoming\'s post-war housing stock means many homes have original plumbing that\'s 40–70 years old. Galvanized pipes, aging water heaters, and original sump pump systems are common failure points. Buck Creek and Plaster Creek flood zones affect hundreds of properties along 44th Street and Byron Center Avenue.',
    fireRisk: 'Wyoming\'s predominately 1950s–1970s ranch homes often have outdated electrical panels (Federal Pacific and Zinsco brands are common) and original wiring that increases fire risk. The city\'s numerous commercial corridors along 28th Street and 44th Street also see fire events in older retail spaces.',
    moldRisk: 'Wyoming\'s ranch-style homes typically have partial or full basements with poured concrete walls. Many lack modern vapor barriers and drain tile systems. Combined with Michigan\'s humidity, this creates persistent moisture issues—especially in homes near Buck Creek and Plaster Creek.',
    sewageRisk: 'Wyoming\'s sewer infrastructure includes many clay tile laterals from the 1950s–1970s construction era. Tree root intrusion is the number-one cause of sewage backups in Wyoming, particularly in established neighborhoods with mature trees along 36th Street and Lee Street corridors.'
  },
  {
    slug: 'kentwood-mi', name: 'Kentwood', pop: '52,000+',
    county: 'Kent County', zip: '49508, 49512, 49546',
    distance: '10 miles', driveTime: '18 minutes',
    geo: { lat: 42.8695, lng: -85.6447 },
    localInfo: 'Kentwood is one of West Michigan\'s fastest-growing suburbs with a diverse population and strong commercial base along East Beltline and 28th Street. Housing ranges from 1960s subdivisions to new construction developments. Plaster Creek runs through the southern portion of the city.',
    waterRisk: 'Kentwood\'s rapid development has increased stormwater runoff, creating flash flooding risks in low-lying areas along Plaster Creek and near the East Beltline commercial corridor. Newer developments sometimes experience sump pump overwhelm during heavy spring rains due to high water tables in formerly agricultural land.',
    fireRisk: 'Kentwood\'s mix of older subdivisions with original electrical systems and newer commercial developments along 28th Street and East Beltline creates varied fire restoration needs. Multi-family housing complexes in the 29th Street and Kalamazoo Avenue area require specialized response coordination.',
    moldRisk: 'Kentwood homes built in the 1960s–1980s often have finished basements with paneling over block-wall foundations—creating hidden moisture traps that go undetected for years. The high water table near Plaster Creek makes dehumidification challenging during Michigan\'s humid summers.',
    sewageRisk: 'Kentwood\'s sewer infrastructure serves a growing population and has experienced capacity challenges during extreme weather events. Homes near Plaster Creek and in older subdivisions along East Paris Avenue face elevated backup risk from tree root intrusion and aging clay laterals.'
  },
  {
    slug: 'walker-mi', name: 'Walker', pop: '25,000+',
    county: 'Kent County', zip: '49534, 49544',
    distance: '0 miles (headquarters)', driveTime: '0 minutes',
    geo: { lat: 43.0011, lng: -85.7335 },
    localInfo: 'Walker is our home — our headquarters at 3707 Northridge Dr NW is located right here. That means Walker residents get the fastest response times of any city we serve. Walker features a mix of established neighborhoods, commercial corridors along Alpine Avenue and Lake Michigan Drive, and newer developments along the I-96 corridor.',
    waterRisk: 'Walker\'s location along the Grand River tributary system and proximity to several small creeks means spring flooding is a regular occurrence. Many Walker homes built in the 1960s–1980s along Alpine Avenue and Remembrance Road have aging sump pump systems and original plumbing that are overdue for failure.',
    fireRisk: 'Walker\'s residential areas include both older homes along Alpine Avenue with original wiring and newer developments. The commercial corridor along Lake Michigan Drive and 3 Mile Road sees occasional commercial fire events that require coordinated restoration.',
    moldRisk: 'Walker homes, particularly in neighborhoods along the Grand River valley, experience high humidity and moisture intrusion from groundwater. Basements in the Remembrance Road and Covell Avenue areas are especially prone to moisture problems due to the area\'s clay soil composition.',
    sewageRisk: 'Walker\'s sewer infrastructure connects to the Grand Rapids metropolitan system. Homes in older neighborhoods near Alpine Avenue and the Grand River experience periodic sewer challenges, particularly during spring snowmelt combined with heavy rain events.'
  },
  {
    slug: 'grandville-mi', name: 'Grandville', pop: '16,000+',
    county: 'Kent County', zip: '49418',
    distance: '10 miles', driveTime: '17 minutes',
    geo: { lat: 42.9098, lng: -85.7631 },
    localInfo: 'Grandville is a tight-knit community known for its charming downtown, strong schools, and family-friendly neighborhoods. The RiverTown Crossings area has driven commercial growth. Housing includes well-maintained mid-century homes and newer subdivisions near the mall area.',
    waterRisk: 'Grandville sits in the Buck Creek watershed, and several neighborhoods near Chicago Drive and the railroad corridor experience localized flooding during intense storms. Many homes in the older downtown area have stone or block foundations with limited waterproofing, making basement water intrusion common.',
    fireRisk: 'Grandville\'s historic downtown district features connected commercial buildings where fire can spread quickly between units. Residential areas include older homes along Chicago Drive with original heating systems and wiring that require careful fire restoration approaches.',
    moldRisk: 'Grandville\'s lower elevation near Buck Creek contributes to high groundwater levels and persistent basement moisture. Homes built before 1970 in the downtown core and along Wilson Avenue frequently develop mold in basements and crawl spaces, especially after periods of heavy rain.',
    sewageRisk: 'Grandville\'s municipal sewer system handles significant volume from commercial developments. Residential laterals in older neighborhoods near Chicago Drive are often original clay tiles, and tree root intrusion is a primary cause of sewage backups for Grandville homeowners.'
  },
  {
    slug: 'east-grand-rapids-mi', name: 'East Grand Rapids', pop: '12,000+',
    county: 'Kent County', zip: '49506',
    distance: '8 miles', driveTime: '16 minutes',
    geo: { lat: 42.9412, lng: -85.6103 },
    localInfo: 'East Grand Rapids is one of West Michigan\'s most affluent communities, known for Reeds Lake, Gaslight Village, and its top-rated school district. Homes include stately Tudors, large colonials, and lakefront estates—many built in the 1920s–1950s. Premium properties require premium restoration care.',
    waterRisk: 'East Grand Rapids\' older homes present unique water damage challenges. Many feature original cast iron and galvanized plumbing, hardwood floors over wood subfloors, and plaster walls—all materials that require specialized drying techniques not needed in modern construction. Proximity to Reeds Lake raises groundwater levels throughout the community.',
    fireRisk: 'East Grand Rapids\' high-value homes require meticulous fire restoration. Tudor and colonial homes with plaster walls, hardwood throughout, and antique fixtures demand content pack-out, specialized cleaning, and reconstruction that matches the home\'s original architectural character.',
    moldRisk: 'East Grand Rapids homes near Reeds Lake experience elevated humidity and groundwater levels. Stone foundations in pre-1940s homes, combined with finished basements added decades later, create concealed moisture traps. Many EGR homes also have flat rubber roofs on additions that develop slow leaks leading to hidden mold.',
    sewageRisk: 'East Grand Rapids\' older sewer infrastructure includes some of the oldest laterals in the metro area. Tree-lined streets mean extensive root systems, and many original clay laterals are well past their expected lifespan. Sewage backup in a high-value EGR home requires meticulous restoration to protect premium finishes.'
  },
  {
    slug: 'rockford-mi', name: 'Rockford', pop: '8,000+',
    county: 'Kent County', zip: '49341',
    distance: '12 miles', driveTime: '20 minutes',
    geo: { lat: 43.1200, lng: -85.5600 },
    localInfo: 'Rockford is a charming small city along the Rogue River, known for its excellent schools, vibrant downtown, and strong community. Housing ranges from historic Main Street-area homes to newer lakefront developments around the many inland lakes in the area.',
    waterRisk: 'Rockford\'s location along the Rogue River creates real flood risk, especially during spring snowmelt. Homes near the river and in low-lying areas along Northland Drive have experienced significant flooding events. The area\'s many inland lakes also contribute to high water tables that challenge basement waterproofing.',
    fireRisk: 'Rockford\'s mix of historic downtown buildings and wooded residential areas creates varied fire risk. Homes surrounded by trees in the Belding Road and 10 Mile area face wildfire-adjacent ember risk during dry seasons, while historic structures along Main Street require careful restoration.',
    moldRisk: 'Rockford\'s river valley location creates naturally humid conditions. Homes along the Rogue River and near area lakes experience persistent moisture challenges. New construction in formerly wooded areas sometimes experiences unexpected moisture issues as grading settles.',
    sewageRisk: 'Rockford\'s sewer system serves a growing community. Homes in the older downtown area have aging laterals, while newer developments connect to extended infrastructure. Heavy spring rains combined with snowmelt create peak demand periods where backup risk increases.'
  },
  {
    slug: 'jenison-mi', name: 'Jenison', pop: '18,000+',
    county: 'Ottawa County', zip: '49428, 49418',
    distance: '12 miles', driveTime: '20 minutes',
    geo: { lat: 42.9072, lng: -85.8281 },
    localInfo: 'Jenison is an unincorporated community in Georgetown Township known for its family-oriented neighborhoods, top-rated Jenison Public Schools, and proximity to both Grand Rapids and Holland. Housing is primarily 1970s–2000s suburban construction with well-maintained neighborhoods.',
    waterRisk: 'Jenison\'s location in the Grand River watershed means spring flooding affects low-lying areas near Baldwin Street and 20th Avenue. Many homes built in the 1970s–1980s have original sump pumps and drain tile systems that are at or past their service life. The flat terrain means poor natural drainage during heavy rain events.',
    fireRisk: 'Jenison\'s suburban housing stock includes many homes with attached garages where improper storage of flammable materials creates fire risk. Homes built in the 1970s with original electrical panels (some Federal Pacific models) also face elevated risk.',
    moldRisk: 'Jenison\'s flat terrain and clay soil contribute to slow drainage and high water tables, making basements particularly susceptible to moisture. Many 1970s–1990s homes have finished basements with carpet over concrete—a prime environment for mold growth after any moisture event.',
    sewageRisk: 'Georgetown Township\'s sewer system serves Jenison, and aging infrastructure in older subdivisions along Baldwin Street and Cottonwood Drive creates periodic backup risks. Flat terrain means sewage relies more on pump stations, which can fail during power outages from storms.'
  },
  {
    slug: 'comstock-park-mi', name: 'Comstock Park', pop: '10,000+',
    county: 'Kent County', zip: '49321',
    distance: '5 miles', driveTime: '10 minutes',
    geo: { lat: 43.0392, lng: -85.6700 },
    localInfo: 'Comstock Park is an unincorporated community in Plainfield Township just north of Grand Rapids. Known for LMCU Ballpark and its convenient location along West River Drive, Comstock Park features affordable housing and easy access to downtown Grand Rapids.',
    waterRisk: 'Comstock Park\'s location along the Grand River puts portions of the community in FEMA flood zones. Homes along West River Drive and Mill Creek have experienced significant flood events. Areas near the river also have high water tables that stress sump pump systems year-round.',
    fireRisk: 'Comstock Park\'s mix of mid-century homes and mobile home communities creates diverse fire response needs. Older homes along West River Drive and Alpine Avenue have original heating systems and wiring that increase fire risk, while the commercial Alpine corridor sees occasional commercial fire events.',
    moldRisk: 'Comstock Park\'s Grand River valley location creates naturally high humidity. Low-lying homes near the river and Mill Creek experience chronic moisture issues. Many affordable homes in the area have deferred maintenance on ventilation and waterproofing systems, accelerating mold growth.',
    sewageRisk: 'Comstock Park relies on Plainfield Township sewer infrastructure. Homes near the Grand River and in older subdivisions along West River Drive face elevated backup risk during spring flooding and heavy rain events that overwhelm the system.'
  },
  {
    slug: 'byron-center-mi', name: 'Byron Center', pop: '7,000+',
    county: 'Kent County', zip: '49315',
    distance: '14 miles', driveTime: '22 minutes',
    geo: { lat: 42.8120, lng: -85.7231 },
    localInfo: 'Byron Center is a growing community in Byron Township known for its excellent school district, rural-suburban character, and family-oriented neighborhoods. New construction has boomed in recent years, with developments extending along 76th Street and Byron Center Avenue.',
    waterRisk: 'Byron Center\'s rapid new construction on formerly agricultural land means many newer homes face unexpected water challenges from high water tables and poor drainage on flat terrain. Sump pump systems in new developments work constantly during wet seasons. Older farmhouses in the area often have stone foundations with minimal waterproofing.',
    fireRisk: 'Byron Center\'s mix of new construction and older rural properties creates varied fire restoration needs. Agricultural outbuildings, older farmhouses, and newer suburban garages all present different fire scenarios requiring tailored restoration approaches.',
    moldRisk: 'Byron Center\'s agricultural heritage means many properties sit on poorly drained clay soil. New construction homes sometimes experience unexpected moisture problems as foundation soil settles. Older homes along Byron Center Avenue often have basement moisture issues from decades-old foundation cracks.',
    sewageRisk: 'Byron Center\'s expanding sewer infrastructure serves a growing population. Some older areas still rely on septic systems that can fail. Municipal sewer laterals in newer subdivisions are modern PVC, but connections at the main can experience issues during peak volume events.'
  }
];

// ── Services config ──
const SERVICES = [
  {
    slug: 'water-damage-restoration',
    label: 'Water Damage Restoration',
    shortLabel: 'Water Damage',
    icon: 'fa-house-flood-water',
    heroColor: '',
    processSteps: [
      { title: 'Emergency Water Extraction', desc: 'Truck-mounted extractors remove all standing water from carpets, subfloors, and structural cavities.' },
      { title: 'Structural Drying', desc: 'High-velocity Phoenix air movers create optimized airflow patterns to pull moisture from walls and framing.' },
      { title: 'Dehumidification', desc: 'Commercial LGR dehumidifiers control humidity and accelerate evaporation based on psychrometric calculations.' },
      { title: 'Daily Moisture Monitoring', desc: 'Calibrated Protimeter readings every day to document progress and meet IICRC S500 drying goals.' },
      { title: 'Reconstruction & Rebuild', desc: 'MI Builder\'s License #2101187907 — drywall, flooring, paint, trim. Same team, start to finish.' },
    ],
    photos: [
      { src: 'water-damage-restoration-living-room-equipment-grand-rapids.jpg', alt: 'Professional drying equipment deployed during water damage restoration' },
      { src: 'moisture-meter-999-water-damage-wall-inspection-grand-rapids.jpg', alt: 'Moisture meter documenting critical water saturation levels' },
      { src: 'phoenix-dehumidifier-water-damage-bathroom-grand-rapids.jpg', alt: 'Commercial dehumidifier in water-damaged bathroom' },
      { src: 'water-damage-containment-barrier-middleville-mi.jpg', alt: 'Professional containment barrier during water damage restoration' },
    ],
  },
  {
    slug: 'fire-damage-restoration',
    label: 'Fire Damage Restoration',
    shortLabel: 'Fire Damage',
    icon: 'fa-fire',
    processSteps: [
      { title: 'Emergency Board-Up & Tarping', desc: 'Secure your property immediately — board windows, seal roof breaches, prevent further exposure.' },
      { title: 'Fire Suppression Water Extraction', desc: 'Remove thousands of gallons left by firefighting and deploy structural drying equipment.' },
      { title: 'Soot & Char Removal', desc: 'Identify soot type and apply correct IICRC cleaning chemistry for each surface.' },
      { title: 'Smoke Odor Elimination', desc: 'Thermal fogging and hydroxyl generators eliminate smoke at the molecular level.' },
      { title: 'Full Reconstruction', desc: 'MI Builder\'s License #2101187907 — complete structural rebuild under one roof.' },
    ],
    photos: [
      { src: 'water-damage-containment-barrier-middleville-mi.jpg', alt: 'Professional containment during fire damage restoration' },
      { src: 'air-mover-structural-drying-living-room-grand-rapids-mi.jpg', alt: 'Drying equipment deployed after fire suppression water' },
      { src: 'iicrc-water-damage-structural-drying-grand-rapids-mi.jpg', alt: 'IICRC certified structural drying after fire event' },
      { src: 'water-damage-containment-hallway-middleville-mi.jpg', alt: 'Containment barrier during fire damage remediation' },
    ],
  },
  {
    slug: 'mold-remediation',
    label: 'Mold Remediation',
    shortLabel: 'Mold',
    icon: 'fa-biohazard',
    processSteps: [
      { title: 'Inspection & Moisture Source ID', desc: 'Thermal imaging and moisture meters identify all mold-affected areas and the root moisture source.' },
      { title: 'Negative Pressure Containment', desc: 'Sealed poly barriers with HEPA air scrubbers prevent spore spread to unaffected areas.' },
      { title: 'Material Removal & HEPA Treatment', desc: 'Contaminated porous materials removed; all surfaces HEPA vacuumed and treated with antimicrobials.' },
      { title: 'Moisture Source Correction', desc: 'Fix the root problem — plumbing leaks, ventilation issues, or foundation moisture intrusion.' },
      { title: 'Reconstruction', desc: 'MI Builder\'s License #2101187907 — replace drywall, insulation, flooring, and finishes.' },
    ],
    photos: [
      { src: 'water-damage-containment-barrier-middleville-mi.jpg', alt: 'Professional containment during mold remediation' },
      { src: 'moisture-meter-999-water-damage-wall-inspection-grand-rapids.jpg', alt: 'Moisture meter identifying hidden water causing mold' },
      { src: 'water-damage-containment-wall-middleville-mi.jpg', alt: 'Sealed containment wall during mold remediation' },
      { src: 'moisture-meter-ceiling-water-damage-detection-grand-rapids.jpg', alt: 'Detecting hidden moisture that leads to mold growth' },
    ],
  },
  {
    slug: 'sewage-cleanup',
    label: 'Sewage Cleanup',
    shortLabel: 'Sewage',
    icon: 'fa-pipe-circle-check',
    processSteps: [
      { title: 'Emergency Assessment in Full PPE', desc: 'Crew arrives in Tyvek suits, N95 respirators, and chemical-resistant PPE to assess contamination.' },
      { title: 'Containment & Extraction', desc: 'Sealed containment barriers isolate affected area; all sewage extracted with specialized equipment.' },
      { title: 'Contaminated Material Removal', desc: 'ALL porous materials removed 12"+ above water line per IICRC S500 — carpet, drywall, insulation.' },
      { title: 'Antimicrobial Disinfection', desc: 'Hospital-grade antimicrobial treatment on all exposed surfaces to eliminate pathogens.' },
      { title: 'Structural Drying & Reconstruction', desc: 'Commercial drying to IICRC goals, then full rebuild with MI Builder\'s License #2101187907.' },
    ],
    photos: [
      { src: 'water-damage-containment-barrier-middleville-mi.jpg', alt: 'Professional containment during sewage cleanup' },
      { src: 'water-damage-restoration-living-room-equipment-grand-rapids.jpg', alt: 'Commercial extraction equipment during biohazard remediation' },
      { src: 'water-damage-containment-wall-middleville-mi.jpg', alt: 'Sealed containment during Category 3 sewage remediation' },
      { src: 'phoenix-dehumidifier-water-damage-bathroom-grand-rapids.jpg', alt: 'Commercial dehumidifier during post-sewage structural drying' },
    ],
  }
];

// ── Helper: get risk text by service ──
function getCityRisk(city, svcSlug) {
  switch (svcSlug) {
    case 'water-damage-restoration': return city.waterRisk;
    case 'fire-damage-restoration': return city.fireRisk;
    case 'mold-remediation': return city.moldRisk;
    case 'sewage-cleanup': return city.sewageRisk;
    default: return city.waterRisk;
  }
}

// ── Build a city page ──
function buildCityPage(city, svc) {
  const depth = '../../';
  const title = `${svc.label} ${city.name} MI | 24/7 Emergency | Disaster Response by Ryan`;
  const desc = `${svc.label} in ${city.name}, MI. IICRC certified, family-owned since 1981. ${city.driveTime} from our Walker HQ. Direct insurance billing. Call ${PHONE} — Ryan answers 24/7.`;
  const canonical = `https://disaster911.net/${svc.slug}/${city.slug}/`;
  const riskText = getCityRisk(city, svc.slug);

  const otherServices = SERVICES.filter(s => s.slug !== svc.slug);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${desc}">
    <link rel="canonical" href="${canonical}">
    <meta name="robots" content="index, follow">
    <meta property="og:title" content="${svc.label} ${city.name} MI | Disaster Response by Ryan">
    <meta property="og:description" content="${desc}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:type" content="website">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="${depth}styles.css">
    <script src="https://link.msgsndr.com/js/traffic-source.js"></script>

    <script type="application/ld+json">
    [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "${svc.label}",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Disaster Response by Ryan",
        "telephone": "${PHONE}",
        "address": {"@type":"PostalAddress","streetAddress":"3707 Northridge Dr NW STE 10","addressLocality":"Walker","addressRegion":"MI","postalCode":"49544"},
        "geo": {"@type":"GeoCoordinates","latitude":43.0011,"longitude":-85.7335},
        "openingHours": "Mo-Su 00:00-24:00",
        "priceRange": "$$",
        "url": "https://disaster911.net/"
      },
      "areaServed": {"@type":"City","name":"${city.name}","containedInPlace":{"@type":"State","name":"Michigan"}},
      "description": "Professional ${svc.label.toLowerCase()} services in ${city.name}, MI. IICRC certified, family-owned since 1981. ${city.driveTime} response from our Walker headquarters."
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type":"ListItem","position":1,"name":"Home","item":"https://disaster911.net/"},
        {"@type":"ListItem","position":2,"name":"${svc.label}","item":"https://disaster911.net/${svc.slug}/"},
        {"@type":"ListItem","position":3,"name":"${city.name}, MI"}
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How fast can you respond to ${svc.label.toLowerCase()} in ${city.name}?",
          "acceptedAnswer": {"@type": "Answer", "text": "Our Walker, MI headquarters is ${city.distance} from ${city.name} — we typically arrive within ${city.driveTime}. We're on call 24/7/365 and Ryan answers personally. No call center, no dispatch delays."}
        },
        {
          "@type": "Question",
          "name": "How much does ${svc.label.toLowerCase()} cost in ${city.name}, MI?",
          "acceptedAnswer": {"@type": "Answer", "text": "Costs vary based on the scope and severity of the damage. Most homeowner insurance policies cover ${svc.label.toLowerCase()} when caused by a covered peril. We provide free on-site assessments with transparent pricing, and we bill your insurance carrier directly using industry-standard Xactimate estimates."}
        },
        {
          "@type": "Question",
          "name": "Does insurance cover ${svc.label.toLowerCase()} in Michigan?",
          "acceptedAnswer": {"@type": "Answer", "text": "${svc.slug === 'sewage-cleanup' ? 'Standard homeowner policies do NOT cover sewage backup by default — you need the sewer/drain endorsement. If you have it, we bill your carrier directly.' : 'Most homeowner insurance policies cover ' + svc.label.toLowerCase() + ' when caused by sudden and accidental events. We work with State Farm, Allstate, Farmers, and all major carriers. Ryan coordinates directly with your adjuster and handles all Xactimate documentation.'}"}
        }
      ]
    }
    ]
    </script>
</head>
<body>
    <div class="emergency-bar">
        <div class="container">
            <span><i class="fa-solid fa-triangle-exclamation"></i> 24/7/365 Emergency Response</span>
            <span><i class="fa-solid fa-truck-fast"></i> ${city.driveTime} response to ${city.name}</span>
        </div>
    </div>

    <header class="site-header">
        <div class="container header-inner">
            <div class="logo"><a href="${depth}"><img src="/images/logo.png" alt="Disaster Response by Ryan" width="220" height="60" style="object-fit:contain;"></a></div>
            <nav class="desktop-nav">
                <ul>
                    <li><a href="${depth}water-damage-restoration/">Water Damage</a></li>
                    <li><a href="${depth}fire-damage-restoration/">Fire & Smoke</a></li>
                    <li><a href="${depth}mold-remediation/">Mold</a></li>
                    <li><a href="${depth}sewage-cleanup/">Sewage</a></li>
                    <li><a href="${depth}about/">About Ryan</a></li>
                    <li><a href="${depth}insurance-claims/">Insurance</a></li>
                    <li><a href="${depth}blog/">Blog</a></li>
                </ul>
            </nav>
            <div class="header-cta">
                <a href="tel:${PHONE_RAW}" class="btn btn-primary btn-pulse"><i class="fa-solid fa-phone"></i> ${PHONE}<span class="btn-subtitle">Call or Text — 24/7</span></a>
            </div>
            <button class="mobile-menu-toggle" aria-label="Toggle menu"><i class="fa-solid fa-bars"></i></button>
        </div>
    </header>

    <nav class="mobile-nav">
        <ul>
            <li><a href="${depth}water-damage-restoration/">Water Damage</a></li>
            <li><a href="${depth}fire-damage-restoration/">Fire & Smoke</a></li>
            <li><a href="${depth}mold-remediation/">Mold Remediation</a></li>
            <li><a href="${depth}sewage-cleanup/">Sewage Cleanup</a></li>
            <li><a href="${depth}about/">About Ryan</a></li>
            <li><a href="${depth}insurance-claims/">Insurance Claims</a></li>
            <li><a href="${depth}blog/">Blog</a></li>
            <li><a href="${depth}contact/">Contact</a></li>
        </ul>
    </nav>

    <!-- Breadcrumb -->
    <div style="background:var(--bg-light);padding:.75rem 0;border-bottom:1px solid var(--bg-subtle);">
        <div class="container" style="font-size:.85rem;color:var(--text-muted);">
            <a href="${depth}" style="color:var(--text-muted);">Home</a>
            <span style="margin:0 .5rem;">›</span>
            <a href="${depth}${svc.slug}/" style="color:var(--text-muted);">${svc.label}</a>
            <span style="margin:0 .5rem;">›</span>
            <strong style="color:#000;">${city.name}, MI</strong>
        </div>
    </div>

    <!-- Hero -->
    <section class="hero" style="padding:4rem 0 6rem 0;">
        <div class="hero-overlay"></div>
        <div class="container hero-content" style="grid-template-columns:1fr;">
            <div class="hero-text center" style="margin:0 auto;">
                <div class="hero-badges" style="justify-content:center;">
                    <span class="badge"><i class="fa-solid fa-certificate"></i> IICRC Certified</span>
                    <span class="badge"><i class="fa-solid fa-clock"></i> ${city.driveTime} Response</span>
                    <span class="badge"><i class="fa-solid fa-house-chimney"></i> MI Builder's License</span>
                </div>
                <h1 style="font-size:2.5rem;">${svc.label} in ${city.name}, MI — <span class="highlight">Ryan Answers Personally</span></h1>
                <p class="subheadline" style="margin:0 auto 2rem;">Family-owned since 1981. Our Walker HQ is ${city.distance} from ${city.name}. Direct insurance billing. 24/7/365.</p>
                <div class="hero-actions" style="justify-content:center;">
                    <a href="tel:${PHONE_RAW}" class="btn btn-primary btn-large btn-pulse"><i class="fa-solid fa-phone"></i> Call ${PHONE} — Ryan Answers</a>
                    <a href="sms:${PHONE_RAW}" class="btn btn-secondary btn-large"><i class="fa-solid fa-comment-sms"></i> Text Us Now</a>
                </div>
            </div>
        </div>
    </section>

    <!-- Photo Strip -->
    <section style="padding:2.5rem 0;background:#fff;overflow:hidden;">
        <div class="container">
            <p style="text-align:center;font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-muted);margin-bottom:1.25rem;">Real Restoration Jobs — No Stock Photos</p>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.75rem;">
${svc.photos.map(p => `                <div style="border-radius:var(--radius-md);overflow:hidden;aspect-ratio:4/3;box-shadow:var(--shadow-md);">
                    <img src="/images/${p.src}" alt="${p.alt} — ${city.name}, MI" width="600" height="450" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
                </div>`).join('\n')}
            </div>
        </div>
    </section>

    <!-- Main Content -->
    <main class="page-content section-padding bg-light">
        <div class="container">
            <div style="display:grid;grid-template-columns:2fr 1fr;gap:3rem;align-items:start;">

                <!-- Main Column -->
                <div>
                    <div style="background:#fff;padding:3rem;border-radius:1rem;box-shadow:var(--shadow-md);border:1px solid var(--bg-subtle);margin-bottom:2.5rem;">
                        <p class="lead">Need ${svc.label.toLowerCase()} in ${city.name}? Call <a href="tel:${PHONE_RAW}" style="color:var(--accent);font-weight:700;">${PHONE}</a> — Ryan answers personally, 24/7. Or <a href="sms:${PHONE_RAW}" style="color:var(--accent);font-weight:700;">text us</a> if you can't talk right now.</p>

                        <h2 style="margin-top:2rem;">Why ${city.name} Homeowners Choose Disaster Response by Ryan</h2>
                        <p>${city.localInfo}</p>
                        <p>At <strong>Disaster Response by Ryan</strong>, our Walker, MI headquarters at 3707 Northridge Dr NW is just <strong>${city.distance} from ${city.name}</strong> — that means we're at your door in approximately <strong>${city.driveTime}</strong>. We've been restoring ${city.name} homes and businesses since 1981. Ryan, Steve, Shawn, and Rigoberto — the same crew, every job, from first response to final walkthrough.</p>

                        <h2>${svc.label} Risks Specific to ${city.name}</h2>
                        <p>${riskText}</p>

                        <!-- Inline Photo -->
                        <div style="margin:2rem 0;border-radius:var(--radius-md);overflow:hidden;box-shadow:var(--shadow-lg);">
                            <img src="/images/${svc.photos[0].src}" alt="${svc.photos[0].alt} — ${city.name}, MI" width="800" height="600" style="width:100%;height:auto;display:block;" loading="lazy">
                            <div style="padding:.75rem 1rem;background:#fff;color:#000;font-size:.8rem;">
                                <strong>Real job photo:</strong> ${svc.photos[0].alt} — serving ${city.name} and all of West Michigan
                            </div>
                        </div>

                        <h2>Our ${svc.shortLabel} Restoration Process in ${city.name}</h2>
                        <div style="display:grid;gap:1.25rem;margin:1.5rem 0;">
${svc.processSteps.map((s, i) => `                            <div style="display:flex;gap:1rem;align-items:flex-start;">
                                <div style="min-width:40px;height:40px;background:var(--accent);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#000;font-weight:800;flex-shrink:0;">${i + 1}</div>
                                <div>
                                    <h3 style="margin-bottom:.15rem;font-size:1.05rem;">${s.title}</h3>
                                    <p style="margin:0;font-size:.95rem;">${s.desc}</p>
                                </div>
                            </div>`).join('\n')}
                        </div>

                        <h2>Insurance & Billing for ${city.name} Residents</h2>
                        <p>We work with <strong>every major insurance carrier</strong> — State Farm, Allstate, Farmers, Liberty Mutual, USAA, Nationwide, Travelers, Progressive, and Auto-Owners. Ryan handles Xactimate documentation and coordinates directly with your adjuster. You focus on your family — we handle the paperwork.</p>
                        <p>For ${city.name} homeowners: your claim is documented with industry-standard Xactimate line items, timestamped photos from our job site, and daily moisture readings (for water/mold jobs). This level of documentation means faster approvals and fewer supplemental fights.</p>

                        <h2>${city.name}, MI — Service Details</h2>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin:1rem 0;">
                            <div style="padding:1rem;background:var(--bg-light);border-radius:var(--radius-md);">
                                <div style="font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);margin-bottom:.25rem;">Location</div>
                                <div style="font-weight:700;">${city.name}, ${city.county}</div>
                            </div>
                            <div style="padding:1rem;background:var(--bg-light);border-radius:var(--radius-md);">
                                <div style="font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);margin-bottom:.25rem;">Population</div>
                                <div style="font-weight:700;">${city.pop}</div>
                            </div>
                            <div style="padding:1rem;background:var(--bg-light);border-radius:var(--radius-md);">
                                <div style="font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);margin-bottom:.25rem;">ZIP Code(s)</div>
                                <div style="font-weight:700;">${city.zip}</div>
                            </div>
                            <div style="padding:1rem;background:var(--bg-light);border-radius:var(--radius-md);">
                                <div style="font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);margin-bottom:.25rem;">Response Time</div>
                                <div style="font-weight:700;">~${city.driveTime} from HQ</div>
                            </div>
                        </div>
                    </div>

                    <!-- FAQ -->
                    <div style="background:#fff;padding:2.5rem;border-radius:1rem;box-shadow:var(--shadow-md);border:1px solid var(--bg-subtle);margin-bottom:2.5rem;">
                        <h2 style="margin-bottom:1.5rem;"><i class="fa-solid fa-circle-question" style="color:var(--accent);margin-right:.5rem;"></i>${svc.label} FAQ — ${city.name}</h2>
                        <div class="faq-container">
                            <div class="faq-item"><button class="faq-question">How fast can you respond to ${svc.label.toLowerCase()} in ${city.name}? <i class="fa-solid fa-chevron-down"></i></button><div class="faq-answer"><div><p>Our Walker HQ is ${city.distance} from ${city.name}. We typically arrive in approximately ${city.driveTime}. Ryan answers the phone personally 24/7/365 — no call center.</p></div></div></div>
                            <div class="faq-item"><button class="faq-question">How much does ${svc.label.toLowerCase()} cost in ${city.name}? <i class="fa-solid fa-chevron-down"></i></button><div class="faq-answer"><div><p>Costs vary based on scope and severity. Most insurance policies cover ${svc.label.toLowerCase()} from covered perils. We provide free assessments with transparent pricing and bill your carrier directly.</p></div></div></div>
                            <div class="faq-item"><button class="faq-question">Does insurance cover ${svc.label.toLowerCase()} in ${city.name}, MI? <i class="fa-solid fa-chevron-down"></i></button><div class="faq-answer"><div><p>${svc.slug === 'sewage-cleanup' ? 'Sewage backup requires a separate sewer/drain endorsement on your homeowner policy. If you have it, we bill your carrier directly.' : 'Yes — most homeowner policies cover ' + svc.label.toLowerCase() + ' from sudden, accidental events. We work with all major carriers including State Farm, Allstate, and Farmers.'}</p></div></div></div>
                        </div>
                    </div>

                    <!-- Nearby Cities -->
                    <div style="background:#fff;padding:2.5rem;border-radius:1rem;box-shadow:var(--shadow-md);border:1px solid var(--bg-subtle);">
                        <h2 style="margin-bottom:1rem;"><i class="fa-solid fa-map-location-dot" style="color:var(--accent);margin-right:.5rem;"></i>Nearby ${svc.shortLabel} Service Areas</h2>
                        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:.5rem;margin-top:1rem;">
${CITIES.filter(c => c.slug !== city.slug).slice(0, 9).map(c => `                            <a href="${depth}${svc.slug}/${c.slug}/" style="padding:.5rem;border:1px solid #e2e8f0;border-radius:6px;text-align:center;font-weight:600;font-size:.85rem;">${c.name}</a>`).join('\n')}
                        </div>
                        <p style="margin-top:1rem;text-align:center;"><a href="${depth}${svc.slug}/" style="color:var(--accent);font-weight:700;">← Back to ${svc.label} Hub</a></p>
                    </div>
                </div>

                <!-- Sidebar -->
                <aside>
                    <div style="background:#fff;color:#000;padding:2rem;border-radius:1rem;margin-bottom:2rem;text-align:center;">
                        <i class="fa-solid fa-${svc.icon}" style="font-size:2rem;color:var(--accent);margin-bottom:1rem;display:block;"></i>
                        <h3 style="color:#000;font-size:1.2rem;margin-bottom:.5rem;">${city.name} Emergency?</h3>
                        <p style="color:rgba(255,255,255,.85);font-size:.9rem;margin-bottom:1.5rem;">We're ${city.distance} away. Ryan answers personally — 24/7.</p>
                        <a href="tel:${PHONE_RAW}" class="btn btn-primary btn-large" style="width:100%;justify-content:center;margin-bottom:.75rem;"><i class="fa-solid fa-phone"></i> ${PHONE}</a>
                        <a href="sms:${PHONE_RAW}" style="display:block;color:var(--accent);font-weight:700;font-size:.9rem;"><i class="fa-solid fa-comment-sms"></i> Or text us</a>
                    </div>

                    <div style="background:#fff;padding:2rem;border-radius:1rem;box-shadow:var(--shadow-md);border:1px solid var(--bg-subtle);margin-bottom:2rem;">
                        <h3 style="font-size:.9rem;margin-bottom:1rem;text-transform:uppercase;letter-spacing:.05em;">Credentials</h3>
                        <div style="display:flex;flex-direction:column;gap:.75rem;">
                            <div style="display:flex;align-items:center;gap:.75rem;"><img src="/images/iicrc-badge.svg" alt="IICRC Certified" width="40" height="40"><div><div style="font-weight:700;font-size:.8rem;">IICRC Certified Firm</div></div></div>
                            <div style="display:flex;align-items:center;gap:.75rem;"><img src="/images/mi-builder-badge.svg" alt="MI Builder License" width="40" height="40"><div><div style="font-weight:700;font-size:.8rem;">MI Builder's License</div><div style="font-size:.7rem;color:var(--text-muted);">#2101187907</div></div></div>
                            <div style="display:flex;align-items:center;gap:.75rem;"><div style="width:40px;height:40px;background:#005596;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="color:#000;font-weight:900;font-size:.9rem;">A+</span></div><div><div style="font-weight:700;font-size:.8rem;">BBB A+ Rating</div></div></div>
                        </div>
                    </div>

                    <div style="background:#fff;padding:2rem;border-radius:1rem;box-shadow:var(--shadow-md);border:1px solid var(--bg-subtle);margin-bottom:2rem;">
                        <h3 style="font-size:.9rem;margin-bottom:1rem;text-transform:uppercase;letter-spacing:.05em;">All Services in ${city.name}</h3>
                        <ul style="display:flex;flex-direction:column;gap:.75rem;">
${SERVICES.map(s => `                            <li><a href="${depth}${s.slug}/${city.slug}/" style="display:flex;align-items:center;gap:.5rem;font-weight:600;font-size:.85rem;color:${s.slug === svc.slug ? 'var(--accent)' : 'var(--text-main)'};"><i class="fa-solid ${s.icon}" style="color:var(--accent);width:18px;"></i>${s.label}</a></li>`).join('\n')}
                        </ul>
                    </div>

                    <div style="border-radius:var(--radius-md);overflow:hidden;box-shadow:var(--shadow-lg);">
                        <img src="/images/${svc.photos[1].src}" alt="${svc.photos[1].alt} — ${city.name}, MI" width="400" height="300" style="width:100%;height:auto;display:block;" loading="lazy">
                    </div>
                </aside>
            </div>
        </div>
    </main>

    <!-- CTA -->
    <section style="padding:3.5rem 0;background:#fff;color:#000;text-align:center;">
        <div class="container">
            <h2 style="color:#000;margin-bottom:.75rem;">${svc.shortLabel} Emergency in ${city.name}? Call Now.</h2>
            <p style="color:rgba(255,255,255,.85);font-size:1.05rem;margin-bottom:1.5rem;">We're ${city.distance} away. Ryan answers personally. At your door in ~${city.driveTime}.</p>
            <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
                <a href="tel:${PHONE_RAW}" class="btn btn-primary btn-large btn-pulse"><i class="fa-solid fa-phone"></i> Call ${PHONE}</a>
                <a href="sms:${PHONE_RAW}" class="btn btn-secondary btn-large"><i class="fa-solid fa-comment-sms"></i> Text Us</a>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="site-footer">
        <div class="container footer-inner">
            <div class="footer-col">
                <div class="footer-logo" style="margin-bottom:1.5rem;"><a href="${depth}"><img src="/images/logo.png" alt="Disaster Response by Ryan Logo" width="240" height="65" style="object-fit:contain;filter:brightness(0) invert(1);"></a></div>
                <p>Family-owned restoration company serving West Michigan since 1981.</p>
                <div class="footer-badges" style="display:flex;gap:1rem;margin-top:1rem;">
                    <a href="https://iicrc.org" target="_blank" rel="noopener"><img src="/images/iicrc-badge.svg" alt="IICRC Certified" width="50" height="50"></a>
                    <div style="display:flex;flex-direction:column;align-items:center;gap:0.2rem;"><img src="/images/mi-builder-badge.svg" alt="MI Builder's License" width="50" height="50"><span style="font-size:0.6rem;font-weight:700;color:var(--text-muted);">#2101187907</span></div>
                </div>
            </div>
            <div class="footer-col">
                <h3>Contact</h3>
                <address class="nap">Disaster Response by Ryan<br>3707 Northridge Dr NW STE 10<br>Walker, MI 49544<br><a href="tel:${PHONE_RAW}">${PHONE}</a><br><a href="mailto:rpenny@disaster911.net">rpenny@disaster911.net</a></address>
                <div class="mt-2 text-sm"><strong>24/7 Emergency Service</strong></div>
            </div>
            <div class="footer-col">
                <h3>Services</h3>
                <ul class="footer-links">
                    <li><a href="${depth}water-damage-restoration/">Water Damage Restoration</a></li>
                    <li><a href="${depth}fire-damage-restoration/">Fire & Smoke Damage</a></li>
                    <li><a href="${depth}mold-remediation/">Mold Remediation</a></li>
                    <li><a href="${depth}sewage-cleanup/">Sewage Cleanup</a></li>
                    <li><a href="${depth}insurance-claims/">Insurance Claims</a></li>
                </ul>
                <h3 style="margin-top:1.5rem;">Sister Company</h3>
                <ul class="footer-links"><li><a href="https://rentalexdumpstersgr.com" target="_blank" rel="noopener"><i class="fa-solid fa-dumpster" style="margin-right:.35rem;"></i>Rentalex Dumpster GR</a></li></ul>
            </div>
            <div class="footer-col">
                <h3>Top Service Areas</h3>
                <ul class="footer-links">
                    <li><a href="${depth}water-damage-restoration/grand-rapids-mi/">Grand Rapids, MI</a></li>
                    <li><a href="${depth}water-damage-restoration/rockford-mi/">Rockford, MI</a></li>
                    <li><a href="${depth}water-damage-restoration/kentwood-mi/">Kentwood, MI</a></li>
                    <li><a href="${depth}water-damage-restoration/holland-mi/">Holland, MI</a></li>
                    <li><a href="${depth}service-areas/">View All 51 Cities</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom"><div class="container footer-bottom-inner"><p>&copy; 2026 Disaster Response by Ryan. All Rights Reserved.</p><div class="legal-links"><a href="${depth}privacy-policy/">Privacy Policy</a><a href="${depth}terms/">Terms of Service</a></div></div></div>
    </footer>

    <div class="mobile-floating-cta"><a href="tel:${PHONE_RAW}" class="mfc-call"><i class="fa-solid fa-phone"></i> Call</a><a href="sms:${PHONE_RAW}" class="mfc-text"><i class="fa-solid fa-comment-sms"></i> Text</a></div>
    <script src="${depth}script.js"></script>
</body>
</html>`;
}

// ── Main: Generate all pages ──
let count = 0;
for (const svc of SERVICES) {
  for (const city of CITIES) {
    const dir = path.join(BASE, svc.slug, city.slug);
    fs.mkdirSync(dir, { recursive: true });
    const html = buildCityPage(city, svc);
    fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf-8');
    count++;
  }
}

console.log(`✅ Built ${count} city pages (${CITIES.length} cities × ${SERVICES.length} services)`);
console.log('Cities covered:', CITIES.map(c => c.name).join(', '));
