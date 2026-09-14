import process from 'node:process';

const BASE_URL = process.env.API_URL || process.argv[2] || 'https://media-tracker-1hj2.onrender.com';

console.log(`🚀 Media Tracker Seeder`);
console.log(`Targeting backend API at: ${BASE_URL}\n`);

// 1. Seed Users Definition (one public demo account plus sample profiles)
const SEED_PASSWORD = 'SeedUserPass123!';
const DEMO_PASSWORD = 'DemoUserPass123!';

const SEED_USERS = [
  { displayName: 'Media Tracker Demo', email: 'demo@mediatracker.app', password: DEMO_PASSWORD, bio: 'A sample account for exploring Media Tracker.' },
  { displayName: 'Alex Rivera', email: 'alex.rivera.seed@example.com', bio: 'Cinephile & Sci-Fi enthusiast' },
  { displayName: 'Sarah Chen', email: 'sarah.chen.seed@example.com', bio: 'Avid reader, RPG gamer & TV binge-watcher' },
  { displayName: 'Marcus Vance', email: 'marcus.vance.seed@example.com', bio: 'Indie games, fantasy books & classic cinema' },
  { displayName: 'Elena Rostova', email: 'elena.rostova.seed@example.com', bio: 'Horror movies & mystery novels fan' },
  { displayName: 'David Kim', email: 'david.kim.seed@example.com', bio: 'Competitive gaming, anime & sci-fi books' },
  { displayName: 'Maya Lin', email: 'maya.lin.seed@example.com', bio: 'Documentaries, drama TV & non-fiction' },
  { displayName: 'James Thorne', email: 'james.thorne.seed@example.com', bio: 'Action cinema, thriller novels & AAA games' },
  { displayName: 'Chloe Bennett', email: 'chloe.bennett.seed@example.com', bio: 'Cozy games, romance books & animated movies' },
  { displayName: 'Liam O\'Connor', email: 'liam.oconnor.seed@example.com', bio: 'History books, prestige TV & strategy games' },
  { displayName: 'Sofia Martinez', email: 'sofia.martinez.seed@example.com', bio: 'Foreign films, indie books & platformers' },
  { displayName: 'Ethan Wright', email: 'ethan.wright.seed@example.com', bio: 'Comic books, superhero films & FPS games' },
  { displayName: 'Hannah Abbott', email: 'hannah.abbott.seed@example.com', bio: 'Classics, period dramas & narrative games' },
  { displayName: 'Noah Miller', email: 'noah.miller.seed@example.com', bio: 'Cyberpunk genre lover across all media' },
  { displayName: 'Zoe Dupont', email: 'zoe.dupont.seed@example.com', bio: 'French cinema, graphic novels & puzzle games' },
  { displayName: 'Oliver Jackson', email: 'oliver.jackson.seed@example.com', bio: 'Retro games, sci-fi classics & space opera' },
];

// 2. Media Catalog Items
const MEDIA_CATALOG = [
  // Movies
  {
    kind: 'MOVIE',
    externalId: '27205',
    title: 'Inception',
    year: 2010,
    posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    reviews: [
      { rating: 5.0, body: 'Mind-bending visual masterpiece. Christopher Nolan at his absolute peak!' },
      { rating: 4.5, body: 'Incredible score by Hans Zimmer and insane practical effects. Holds up on rewatch.' },
      { rating: 4.0, body: 'Complex plot that keeps you engaged from start to finish.' },
    ]
  },
  {
    kind: 'MOVIE',
    externalId: '157336',
    title: 'Interstellar',
    year: 2014,
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    reviews: [
      { rating: 5.0, body: 'An emotional roller coaster across time and space. The docking scene gives me chills every time.' },
      { rating: 4.5, body: 'Breathtaking visuals of black holes and relativity. Unforgettable experience.' },
      { rating: 5.0, body: 'One of the best sci-fi movies ever made. Emotional and scientifically ambitious.' }
    ]
  },
  {
    kind: 'MOVIE',
    externalId: '155',
    title: 'The Dark Knight',
    year: 2008,
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    reviews: [
      { rating: 5.0, body: 'Heath Ledger\'s Joker performance set the standard for comic book villains forever.' },
      { rating: 4.5, body: 'A thrilling crime drama disguised as a superhero movie. Outstanding pacing.' }
    ]
  },
  {
    kind: 'MOVIE',
    externalId: '693134',
    title: 'Dune: Part Two',
    year: 2024,
    posterUrl: 'https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg',
    reviews: [
      { rating: 5.0, body: 'Cinematic spectacle on an epic scale. Denis Villeneuve created a modern sci-fi legend.' },
      { rating: 4.5, body: 'Sound design and cinematography are out of this world. Must watch on a big screen!' }
    ]
  },

  // TV Shows
  {
    kind: 'SHOW',
    externalId: '1396',
    title: 'Breaking Bad',
    year: 2008,
    posterUrl: 'https://image.tmdb.org/t/p/w500/anFx9aTOOYqgS3v7x3R84Kz67ly.jpg',
    reviews: [
      { rating: 5.0, body: 'Flawless television writing. The character arc of Walter White is unparalleled.' },
      { rating: 5.0, body: 'Every single season builds the tension brilliantly. Ozymandias is 10/10 TV.' }
    ]
  },
  {
    kind: 'SHOW',
    externalId: '95396',
    title: 'Severance',
    year: 2022,
    posterUrl: 'https://image.tmdb.org/t/p/w500/pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg',
    reviews: [
      { rating: 4.5, body: 'Brilliantly dystopian concept and mystery box writing. Can\'t wait for the next season!' },
      { rating: 5.0, body: 'The finale episode was pure anxiety and excitement. Incredible set design and tone.' }
    ]
  },
  {
    kind: 'SHOW',
    externalId: '94605',
    title: 'Arcane',
    year: 2021,
    posterUrl: 'https://image.tmdb.org/t/p/w500/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg',
    reviews: [
      { rating: 5.0, body: 'Redefined what animated television can achieve. World-class art style and deep character relationships.' },
      { rating: 4.5, body: 'Even if you don\'t play League of Legends, this show is an absolute masterpiece.' }
    ]
  },

  // Games
  {
    kind: 'GAME',
    externalId: '326243',
    title: 'Elden Ring',
    year: 2022,
    posterUrl: 'https://media.rawg.io/media/games/b29/b294fdd866dcdb643e7bab370a552855.jpg',
    reviews: [
      { rating: 5.0, body: 'Unmatched sense of discovery and exploration. The Lands Between are full of secrets.' },
      { rating: 4.5, body: 'Challenging bosses, incredible build variety, and sublime world design.' }
    ]
  },
  {
    kind: 'GAME',
    externalId: '3328',
    title: 'The Witcher 3: Wild Hunt',
    year: 2015,
    posterUrl: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg',
    reviews: [
      { rating: 5.0, body: 'Side quests in this game have better stories than most full RPGs. Geralt\'s journey is unforgettable.' },
      { rating: 4.5, body: 'Blood and Wine DLC alone is better than most standalone games.' }
    ]
  },
  {
    kind: 'GAME',
    externalId: '9767',
    title: 'Hollow Knight',
    year: 2017,
    posterUrl: 'https://media.rawg.io/media/games/4cf/4cfc6b7f1850590a4634b08bfab308ab.jpg',
    reviews: [
      { rating: 5.0, body: 'Best metroidvania ever created. Beautiful hand-drawn art and haunting atmosphere.' },
      { rating: 4.5, body: 'Tight controls, intense boss fights, and rewarding exploration of Hallownest.' }
    ]
  },

  // Books
  {
    kind: 'BOOK',
    externalId: 'OL1028723W',
    title: 'Dune',
    year: 1965,
    posterUrl: 'https://covers.openlibrary.org/b/id/9251896-L.jpg',
    reviews: [
      { rating: 5.0, body: 'The pinnacle of sci-fi world-building. Politics, ecology, and religion woven seamlessly.' },
      { rating: 4.5, body: 'A dense but extraordinarily rewarding read. Paul Atreides is a fascinating protagonist.' }
    ]
  },
  {
    kind: 'BOOK',
    externalId: 'OL1168083W',
    title: '1984',
    year: 1949,
    posterUrl: 'https://covers.openlibrary.org/b/id/7222246-L.jpg',
    reviews: [
      { rating: 5.0, body: 'Hauntingly prophetic and deeply impactful. George Orwell\'s warning remains timeless.' },
      { rating: 4.0, body: 'A sobering look at surveillance and totalitarian control.' }
    ]
  },
  {
    kind: 'BOOK',
    externalId: 'OL21637762W',
    title: 'Project Hail Mary',
    year: 2021,
    posterUrl: 'https://covers.openlibrary.org/b/id/10523450-L.jpg',
    reviews: [
      { rating: 5.0, body: 'Andy Weir strikes gold again! Rocky and Ryland Grace\'s friendship is heart-warming sci-fi magic.' },
      { rating: 4.5, body: 'Fast-paced, scientifically clever, and incredibly funny.' }
    ]
  }
];

async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  
  try {
    const res = await fetch(url, { ...options, headers });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 500, error: err.message };
  }
}

function getUserIdFromToken(token) {
  try {
    const payloadBase64 = token.split('.')[1];
    const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
    const payload = JSON.parse(payloadJson);
    return payload.sub;
  } catch (e) {
    return null;
  }
}

async function registerOrLoginUser(userDef) {
  // 1. Try Registering
  let res = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      displayName: userDef.displayName,
      email: userDef.email,
      password: userDef.password || SEED_PASSWORD
    })
  });

  let token = res.ok ? res.data.accessToken : null;

  // 2. If already exists (400 / 409), try Login
  if (!token) {
    res = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: userDef.email,
        password: userDef.password || SEED_PASSWORD
      })
    });
    if (res.ok) {
      token = res.data.accessToken;
    }
  }

  if (!token) {
    console.error(`❌ Failed to register/login ${userDef.email}:`, res.data || res.error);
    return null;
  }

  // Get userId via JWT token sub or /api/me
  let userId = getUserIdFromToken(token);
  if (!userId) {
    const meRes = await apiRequest('/api/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (meRes.ok && meRes.data.userId) {
      userId = meRes.data.userId;
    }
  }

  return { token, userId };
}

async function main() {
  console.log(`--- STEP 1: Creating/Authenticating 15 Seed Users ---`);
  const activeUsers = [];

  for (const uDef of SEED_USERS) {
    const authData = await registerOrLoginUser(uDef);
    if (authData && authData.userId) {
      activeUsers.push({
        ...uDef,
        token: authData.token,
        id: authData.userId
      });
      console.log(`  ✓ Authenticated user: ${uDef.displayName} (${authData.userId})`);
    }
  }

  console.log(`\nSuccessfully ready with ${activeUsers.length} users.\n`);

  if (activeUsers.length < 2) {
    console.error('Not enough users to form friend connections.');
    return;
  }

  console.log(`--- STEP 2: Creating Interconnected Friend Network ---`);
  // Each user sends requests to 5 subsequent users, and the receivers accept!
  let friendCount = 0;
  for (let i = 0; i < activeUsers.length; i++) {
    const sender = activeUsers[i];
    
    // Connect to next 5 users in circular list
    for (let offset = 1; offset <= 5; offset++) {
      const receiverIndex = (i + offset) % activeUsers.length;
      const receiver = activeUsers[receiverIndex];

      // Sender sends request
      const sendRes = await apiRequest(`/api/friends/${receiver.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sender.token}` }
      });

      if (sendRes.ok) {
        // Receiver accepts request
        const acceptRes = await apiRequest(`/api/friends/${sender.id}/accept`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${receiver.token}` }
        });

        if (acceptRes.ok) {
          friendCount++;
        }
      }
    }
  }
  console.log(`  ✓ Created and accepted ${friendCount} friend connections.\n`);

  console.log(`--- STEP 3: Populating Media Libraries & Reviews ---`);
  let entryCount = 0;
  let reviewCount = 0;

  for (let i = 0; i < activeUsers.length; i++) {
    const user = activeUsers[i];
    // Keep the public demo broad and deterministic; vary sample profiles.
    const mediaPool = [...MEDIA_CATALOG].sort(() => 0.5 - Math.random());
    const userItems = i === 0 ? MEDIA_CATALOG : mediaPool.slice(0, 4 + (i % 3));

    for (let j = 0; j < userItems.length; j++) {
      const media = userItems[j];
      const reviewOption = media.reviews[j % media.reviews.length];
      
      const payload = {
        kind: media.kind,
        externalId: media.externalId,
        title: media.title,
        year: media.year,
        posterUrl: media.posterUrl,
        status: 'COMPLETED',
        progressCurrent: 1.0,
        progressTotal: 1.0,
        startedAt: '2024-02-01',
        completedAt: '2024-02-15',
        privateEntry: false,
        rating: reviewOption.rating,
        reviewBody: reviewOption.body
      };

      const res = await apiRequest('/api/library', {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        entryCount++;
        reviewCount++;
      } else {
        // Entry might already exist if re-running
      }
    }
  }

  console.log(`  ✓ Created ${entryCount} library entries and ${reviewCount} reviews across all users.\n`);

  console.log(`====================================================`);
  console.log(`🎉 SEEDING COMPLETE!`);
  console.log(`Summary:`);
  console.log(` - Deployed API: ${BASE_URL}`);
  console.log(` - Users Created: ${activeUsers.length}`);
  console.log(` - Demo login: demo@mediatracker.app / ${DEMO_PASSWORD}`);
  console.log(` - Password for other seed users: ${SEED_PASSWORD}`);
  console.log(` - Sample User Login: ${activeUsers[0].email}`);
  console.log(` - Friendhips Formed: ${friendCount}`);
  console.log(` - Reviews & Library Entries Created: ${entryCount}`);
  console.log(`====================================================`);
}

main().catch(err => {
  console.error('Fatal error during seeding:', err);
  process.exit(1);
});
