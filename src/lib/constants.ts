// ============================================================
// URSULINE STUDY CENTRE — SITE CONSTANTS
// Edit this file to update site-wide content
// ============================================================

export const SITE_CONFIG = {
  name: "Ursuline Study Centre",
  tagline: "Empowering Girls. Building Futures.",
  taglineHindi: "बेटियों का भविष्य, हमारी ज़िम्मेदारी",
  motto: "ज्ञान · अनुशासन · सफलता",
  phone: "+91 95075 89503",
  phone2: "+91 62025 78886",
  email: "ursulinestudycentre@gmail.com",
  whatsapp: "919507589503",
  address: "Ursuline Convent Campus, Dr. Camil Bulcke Path, Ranchi",
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3663.4!2d85.3296!3d23.3441!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDIwJzM4LjgiTiA4NcKwMTknNDYuNiJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin",
  playstoreLink: "https://play.google.com/store/apps/details?id=com.vefytech.academicorigin",
  poweredBy: "Academic Origin",
  designer: "Aayush",
  designerPhone: "+91 95086 39773",
  founded: "2026",
  guidedBy: "Sr. Dr. Mary Grace",
  youtubeChannel: "https://youtube.com/@academicorigin",
  establishedYear: "2026",
  sessionYear: "2026-27",
};

export const STATS: { value: string; label: string; }[] = [];

export const COURSES = [
  {
    category: "Academic Streams",
    icon: "stream",
    courses: [
      { name: "Science (PCM)", desc: "Physics, Chemistry, Mathematics for JEE aspirants" },
      { name: "Science (PCB)", desc: "Physics, Chemistry, Biology for NEET aspirants" },
      { name: "Commerce", desc: "Accountancy, Business Studies, Economics" },
      { name: "Humanities", desc: "History, Geography, Political Science, Sociology" },
    ],
  },
  {
    category: "Competitive Exams",
    icon: "exam",
    courses: [
      { name: "JEE Main & Advanced", desc: "Structured preparation for IIT & NIT entrance" },
      { name: "NEET UG", desc: "Medical entrance with expert biology faculty" },
      { name: "CLAT", desc: "Law entrance preparation with legal reasoning" },
    ],
  },
  {
    category: "Vocational Skills",
    icon: "skill",
    courses: [
      { name: "AI & Machine Learning", desc: "Basics to advanced AI concepts" },
      { name: "Programming", desc: "Python, web development fundamentals" },
      { name: "DCA", desc: "Diploma in Computer Applications" },
      { name: "Tally & Accounts", desc: "Professional accounting software" },
      { name: "Social Media Marketing", desc: "Digital marketing & content creation" },
    ],
  },
];

export const FACULTY = [
  {
    name: "Abhishek Pathak",
    subject: "Mathematics & JEE",
    qualification: "M.Sc Mathematics",
    experience: "10+ Years",
    role: "Founder & Director",
  },
  {
    name: "Sr. Dr. Mary Grace",
    subject: "Academic Guidance",
    qualification: "PhD, Education",
    experience: "20+ Years",
    role: "Visionary Principal",
  },
];

export const WHY_CHOOSE_US = [
  {
    icon: "shield",
    title: "Girls-Only Safe Campus",
    desc: "100% girls-only environment providing a secure, distraction-free learning space focused on academic excellence.",
  },
  {
    icon: "book",
    title: "JAC & CBSE Expertise",
    desc: "Comprehensive coverage of both JAC and CBSE curricula, ensuring complete board exam preparation.",
  },
  {
    icon: "users",
    title: "Expert Faculty",
    desc: "Highly qualified teachers with deep subject expertise, many with IIT/AIIMS alumni background.",
  },
  {
    icon: "languages",
    title: "Bilingual Teaching",
    desc: "Instruction in both English and Hindi, making complex concepts accessible to every student.",
  },
  {
    icon: "lightbulb",
    title: "Academic + Vocational",
    desc: "Unique combination of board prep with future-ready vocational skills like AI, coding, and digital marketing.",
  },
  {
    icon: "map",
    title: "Trusted Location",
    desc: "Conveniently located at Ursuline Convent Campus, Dr. Camil Bulcke Path, Ranchi.",
  },
];

export const TESTIMONIALS: { name: string; role: string; review: string; rating: number }[] = [];

export const YOUTUBE_VIDEOS: { id: string; title: string; thumbnail: string; }[] = [];

export const FAQS = [
  {
    q: "Is Ursuline Study Centre exclusively for girls?",
    a: "Yes, Ursuline Study Centre is a 100% girls-only premium educational institution. This ensures a safe, focused, and empowering academic environment for all our students.",
  },
  {
    q: "Which boards do you cover?",
    a: "We cover both JAC (Jharkhand Academic Council) and CBSE (Central Board of Secondary Education), providing complete curriculum support for Classes 9 to 12.",
  },
  {
    q: "Which competitive exams do you prepare for?",
    a: "We offer dedicated preparation for JEE Main & Advanced, NEET UG, and CLAT alongside regular board studies.",
  },
  {
    q: "What is the batch size?",
    a: "We maintain small, focused batches of 20–25 students to ensure personalized attention and effective learning for every student.",
  },
  {
    q: "Do you offer vocational courses alongside academics?",
    a: "Yes! We offer a unique combination of academic excellence with vocational skills including AI, Programming, DCA, Tally, and Social Media Marketing.",
  },
  {
    q: "What is the medium of instruction?",
    a: "We teach in both English and Hindi (bilingual) to ensure every student grasps concepts thoroughly, regardless of their primary language.",
  },
  {
    q: "How do I take admission?",
    a: "Simply fill the enquiry form, attend a free counselling session, submit your documents, and complete the fee payment. We guide you through every step.",
  },
  {
    q: "What is the fee structure?",
    a: "Our annual fee is ₹15,000 for all academic streams (PCM, PCB, Commerce, Humanities). Vocational courses have separate pricing. Please contact us for detailed fee breakdowns.",
  },
];

export const ADMISSION_STEPS = [
  { step: "01", title: "Enquiry", desc: "Fill the online form or call us", icon: "form" },
  { step: "02", title: "Counselling", desc: "Free one-on-one academic counselling session", icon: "chat" },
  { step: "03", title: "Documents", desc: "Submit mark sheets & identity proof", icon: "docs" },
  { step: "04", title: "Payment", desc: "Complete fee payment & receive your study kit", icon: "check" },
];

export const FEE_TABLE = [
  { stream: "Science (PCM)", annual: "₹15,000", monthly: "₹1,500", includes: "JEE Prep Included" },
  { stream: "Science (PCB)", annual: "₹15,000", monthly: "₹1,500", includes: "NEET Prep Included" },
  { stream: "Commerce", annual: "₹15,000", monthly: "₹1,500", includes: "Tally Basics Included" },
  { stream: "Humanities", annual: "₹15,000", monthly: "₹1,500", includes: "CLAT Basics Included" },
];

export const NAV_LINKS = [
  { label: "Home", href: "/#hero" },
  { label: "About", href: "/#about" },
  { label: "Courses", href: "/#courses" },
  { label: "Faculty", href: "/#faculty" },
  { label: "Admission", href: "/#admission" },
];

export const MORE_LINKS = [
  { label: "Results", href: "/#results" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "YouTube", href: "/#youtube" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/#contact" },
];
