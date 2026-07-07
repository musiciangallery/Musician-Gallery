export type Occasion = "Weddings" | "Corporate Events" | "Private Functions" | "Lessons";

export type Musician = {
  slug: string;
  name: string;
  instrument: string;
  region: string;
  type: "Event Musician" | "Teacher" | "Teacher & Events";
  occasions: Occasion[];
  vetted: boolean;
  rateFrom: number;
  rateUnit: "per event" | "per lesson";
  bio: string;
  longBio: string;
  yearsExperience: number;
};

export const musicians: Musician[] = [
  {
    slug: "sarah-chen",
    name: "Sarah Chen",
    instrument: "Violin",
    region: "Auckland",
    type: "Event Musician",
    occasions: ["Weddings", "Corporate Events", "Private Functions"],
    vetted: true,
    rateFrom: 350,
    rateUnit: "per event",
    bio: "Classical and contemporary violinist with ten years performing at weddings and events across New Zealand.",
    longBio:
      "Sarah trained at the University of Auckland and has spent a decade performing solo and ensemble sets at weddings, corporate functions, and private events across the North Island. Her repertoire spans classical standards to contemporary arrangements, tailored to each occasion.",
    yearsExperience: 10,
  },
  {
    slug: "james-tuhoe",
    name: "James Tūhoe",
    instrument: "Piano",
    region: "Wellington",
    type: "Teacher & Events",
    occasions: ["Weddings", "Lessons", "Private Functions"],
    vetted: true,
    rateFrom: 60,
    rateUnit: "per lesson",
    bio: "Piano teacher and event pianist. Police vetted, available for lessons from beginner to advanced.",
    longBio:
      "James teaches piano from his Wellington studio to students of all ages and levels, and performs as an event pianist on weekends. Police vetted and DBS-checked, with a patient, structured teaching style suited to beginners through to advanced players preparing for exams.",
    yearsExperience: 14,
  },
  {
    slug: "aroha-williams",
    name: "Aroha Williams",
    instrument: "Guitar",
    region: "Christchurch",
    type: "Teacher",
    occasions: ["Lessons"],
    vetted: true,
    rateFrom: 55,
    rateUnit: "per lesson",
    bio: "Acoustic and fingerstyle guitar teacher welcoming students of all ages. Lessons in-home or online.",
    longBio:
      "Aroha specialises in acoustic and fingerstyle guitar, teaching students from age 7 through to adult beginners. Lessons are available in-home across Christchurch or online, with a focus on building strong fundamentals and a love of playing.",
    yearsExperience: 8,
  },
  {
    slug: "michael-osei",
    name: "Michael Osei",
    instrument: "Saxophone",
    region: "Auckland",
    type: "Event Musician",
    occasions: ["Weddings", "Corporate Events"],
    vetted: true,
    rateFrom: 400,
    rateUnit: "per event",
    bio: "Jazz and soul saxophonist bringing warmth to ceremonies, cocktail hours, and corporate functions.",
    longBio:
      "Michael has performed at over 200 weddings and corporate functions across Auckland, blending jazz standards with contemporary soul. Comfortable performing solo or with a backing trio for larger events.",
    yearsExperience: 12,
  },
  {
    slug: "grace-liu",
    name: "Grace Liu",
    instrument: "Cello",
    region: "Wellington",
    type: "Event Musician",
    occasions: ["Weddings", "Private Functions"],
    vetted: true,
    rateFrom: 380,
    rateUnit: "per event",
    bio: "Cellist specialising in ceremony and cocktail hour music, solo or as part of a string duo.",
    longBio:
      "Grace performs at ceremonies and cocktail hours across the Wellington region, available solo or paired with a violinist for a full string duo arrangement. Repertoire ranges from classical to modern film and pop arrangements.",
    yearsExperience: 9,
  },
  {
    slug: "tama-ngata",
    name: "Tama Ngata",
    instrument: "Vocals",
    region: "Christchurch",
    type: "Teacher & Events",
    occasions: ["Lessons", "Weddings", "Corporate Events"],
    vetted: true,
    rateFrom: 50,
    rateUnit: "per lesson",
    bio: "Vocal coach and event vocalist, teaching contemporary and musical theatre technique.",
    longBio:
      "Tama teaches contemporary and musical theatre vocal technique to students preparing for exams, auditions, or simply learning to sing with confidence, and performs as an event vocalist on weekends across Canterbury.",
    yearsExperience: 11,
  },
  {
    slug: "olivia-marsh",
    name: "Olivia Marsh",
    instrument: "Harp",
    region: "Auckland",
    type: "Event Musician",
    occasions: ["Weddings", "Private Functions"],
    vetted: true,
    rateFrom: 420,
    rateUnit: "per event",
    bio: "Concert harpist bringing a classic, elegant sound to ceremonies and receptions.",
    longBio:
      "Olivia trained at the New Zealand School of Music and performs at weddings and private functions across Auckland, offering a curated repertoire from classical arrangements to modern pop covers on harp.",
    yearsExperience: 7,
  },
  {
    slug: "daniel-kim",
    name: "Daniel Kim",
    instrument: "Drums",
    region: "Wellington",
    type: "Teacher",
    occasions: ["Lessons"],
    vetted: true,
    rateFrom: 55,
    rateUnit: "per lesson",
    bio: "Drum teacher for beginners through to intermediate players, in a relaxed, encouraging studio.",
    longBio:
      "Daniel teaches drums to students from age 8 through to adult beginners in his Wellington studio, with a focus on rhythm fundamentals, reading, and building the confidence to eventually play in a band setting.",
    yearsExperience: 6,
  },
  {
    slug: "priya-nair",
    name: "Priya Nair",
    instrument: "Flute",
    region: "Dunedin",
    type: "Teacher & Events",
    occasions: ["Lessons", "Weddings"],
    vetted: true,
    rateFrom: 45,
    rateUnit: "per lesson",
    bio: "Flute teacher and ceremony musician, welcoming students of all ages across Dunedin.",
    longBio:
      "Priya teaches flute to students of all ages across Dunedin and performs at wedding ceremonies on weekends, with a repertoire spanning classical, folk, and contemporary arrangements.",
    yearsExperience: 10,
  },
];

export const instruments = Array.from(new Set(musicians.map((m) => m.instrument))).sort();
export const regions = Array.from(new Set(musicians.map((m) => m.region))).sort();
export const occasionsList: Occasion[] = ["Weddings", "Corporate Events", "Private Functions", "Lessons"];

export function getMusicianBySlug(slug: string) {
  return musicians.find((m) => m.slug === slug);
}
