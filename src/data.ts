import { ServiceItem, Project, Testimonial, FAQItem } from './types';

export const WEBSITE_SERVICES: ServiceItem[] = [
  {
    id: 'web-basic',
    name: 'Basic Website Package',
    category: 'web',
    description: 'Perfect for small businesses or personal brands wanting to establish their initial online presence.',
    price: '499',
    deliveryTime: '2-3 Days',
    iconName: 'Globe',
    features: [
      '2–3 Fully Responsive Pages',
      'Futuristic Glassmorphic Layout',
      'Functional Contact Form',
      'Social Media Integration',
      'Basic SEO Optimization',
      '1 Week Post-Delivery Support'
    ]
  },
  {
    id: 'web-business',
    name: 'Business Growth Website',
    category: 'web',
    description: 'A professional-grade website tailored for scaling businesses, agencies, and high-quality portfolios.',
    price: '999',
    deliveryTime: '4-5 Days',
    iconName: 'Briefcase',
    features: [
      'Up to 6 Highly Responsive Pages',
      'Advanced Modern UI / UX Design',
      'Smooth Entrance & Layout Animations',
      'Contact & Inquiry Forms',
      'Advanced SEO & Speed Optimization',
      'Interactive Testimonial & FAQ Sections',
      '2 Weeks Post-Delivery Support'
    ]
  },
  {
    id: 'web-premium',
    name: 'Elite Premium Experience',
    category: 'web',
    description: 'Our flagship full-scale digital product featuring top-tier custom animations, illustrations, and maximum conversion layout.',
    price: '1299',
    deliveryTime: '5-7 Days',
    iconName: 'Crown',
    features: [
      'Unlimited Pages / Full-Scale SPA',
      'Top-Tier Animations (Framer Motion)',
      'Custom Isometric/Glass Graphics',
      'Spam-Protected Dynamic Forms',
      'Elite Page Speed & Core Web Vitals',
      'Complete Mobile & Tablet Adaptability',
      '1 Month Premium Maintenance & Support'
    ]
  }
];

export const EXCEL_SERVICES: ServiceItem[] = [
  {
    id: 'excel-formulas',
    name: 'Formulas & Data Architecture',
    category: 'excel',
    description: 'Fix, optimize, or build advanced formulas to organize, lookup, and compute your raw data automatically.',
    price: '349',
    deliveryTime: '24 Hours',
    iconName: 'Binary',
    features: [
      'Advanced Formulas: IF, SUMIF, COUNTIF',
      'Precision Lookup: VLOOKUP, XLOOKUP, INDEX+MATCH',
      'Dynamically Linked Data Ranges',
      'Automated Spreadsheet Formatting',
      'Error Resolution & Debugging',
      'Optimized Computation Speeds'
    ]
  },
  {
    id: 'excel-dashboards',
    name: 'Executive KPI Dashboards & MIS',
    category: 'excel',
    description: 'Transform cluttered raw sheets into high-end interactive visual dashboards with dynamic pivot charts and reporting systems.',
    price: '699',
    deliveryTime: '1-2 Days',
    iconName: 'TrendingUp',
    features: [
      'Interactive Dashboard Canvas',
      'Executive MIS Reports',
      'Custom Pivot Tables & Slicers',
      'Dynamic Charts, Gauges & Graphs',
      'Financial, Sales & Inventory Visualizers',
      'One-Click Sheet Updates'
    ]
  },
  {
    id: 'excel-automation',
    name: 'Workflow Automation & Tools',
    category: 'excel',
    description: 'Custom automated spreadsheet tools like attendance checkers, smart invoices, salary trackers, and advanced sheets.',
    price: '999',
    deliveryTime: '2-3 Days',
    iconName: 'Zap',
    features: [
      'Automated Invoices & PDF Generators',
      'Smart Attendance & Roster Sheets',
      'Comprehensive Salary & Payroll Systems',
      'Database-to-Excel Automations',
      'Macro & VBA Integrations (if required)',
      'Step-by-Step Client Video Guides'
    ]
  }
];

// All requested individual capabilities listed in the prompt
export const EXCEL_CAPABILITIES = [
  { name: 'Data Cleaning', category: 'Analysis' },
  { name: 'IF, SUMIF, COUNTIF', category: 'Formulas' },
  { name: 'VLOOKUP', category: 'Formulas' },
  { name: 'XLOOKUP', category: 'Formulas' },
  { name: 'INDEX + MATCH', category: 'Formulas' },
  { name: 'Pivot Tables', category: 'Visualization' },
  { name: 'Charts & Graphs', category: 'Visualization' },
  { name: 'Interactive Dashboards', category: 'Visualization' },
  { name: 'MIS Reports', category: 'Reporting' },
  { name: 'Excel Automation', category: 'Automation' },
  { name: 'Data Formatting', category: 'Analysis' },
  { name: 'Attendance Sheets', category: 'Templates' },
  { name: 'Invoice Templates', category: 'Templates' },
  { name: 'Salary Sheets', category: 'Templates' },
  { name: 'Sales Reports', category: 'Reporting' },
  { name: 'Inventory Reports', category: 'Reporting' },
  { name: 'Data Analysis', category: 'Analysis' }
];

export const PORTFOLIO_PROJECTS: Project[] = [
  {
    id: 'port-1',
    title: 'Apex Global Logistics Portal',
    category: 'Business Websites',
    description: 'A dark, futuristic shipping and freight tracking portal featuring high-performance vector graphics and dynamic client portals.',
    tags: ['React', 'Express', 'Tailwind CSS', 'Framer Motion'],
    mockupType: 'website',
    stats: [
      { label: 'Speed Score', value: '99%' },
      { label: 'Bounce Rate', value: '-22%' }
    ]
  },
  {
    id: 'port-2',
    title: 'Zenith Premium Properties',
    category: 'Landing Pages',
    description: 'An elegant real estate single-page showcase. Implemented fully glassmorphic overlays, responsive fluid sections, and dynamic filters.',
    tags: ['Vite SPA', 'CSS Gradients', 'Motion'],
    mockupType: 'website',
    stats: [
      { label: 'Conversion', value: '+4.8%' },
      { label: 'Inquiries/Mo', value: '450+' }
    ]
  },
  {
    id: 'port-3',
    title: 'Dr. Sarah Miller Medical Hub',
    category: 'Portfolio Websites',
    description: 'A clinical yet warm professional portfolio for a private pediatric surgeon, complete with appointment inquiry pipelines.',
    tags: ['React', 'Responsive Design', 'SEO Optimized'],
    mockupType: 'website',
    stats: [
      { label: 'Load Time', value: '0.6s' },
      { label: 'SEO Rank', value: '#1 Local' }
    ]
  },
  {
    id: 'port-4',
    title: 'Enterprise Q4 Sales Tracker',
    category: 'Excel Dashboards',
    description: 'A fully responsive corporate sales tracking dashboard compiling regional parameters into automated dashboard visualizers.',
    tags: ['KPI Dashboard', 'Pivot Charts', 'Data Analysis'],
    mockupType: 'dashboard',
    stats: [
      { label: 'Data Points', value: '25,000+' },
      { label: 'Time Saved', value: '18h/Wk' }
    ]
  },
  {
    id: 'port-5',
    title: 'Automated HR Salary & Payroll Sheet',
    category: 'MIS Reports',
    description: 'Interactive MIS Reporting tool syncing attendance check-ins with salary distribution matrices, complete with PDF invoice templates.',
    tags: ['Salary Sheets', 'MIS Reporting', 'Excel formulas'],
    mockupType: 'spreadsheet',
    stats: [
      { label: 'Accuracy', value: '100.0%' },
      { label: 'Manual Effort', value: 'Zeroed' }
    ]
  },
  {
    id: 'port-6',
    title: 'E-commerce Raw Inventory Cleaner',
    category: 'Data Cleaning Projects',
    description: 'Sanitization of over 50,000 active SKU entries. Fixed encoding issues, resolved duplicates, and formatted structural sheets.',
    tags: ['Data Cleaning', 'Data Formatting', 'VLOOKUP / XLOOKUP'],
    mockupType: 'spreadsheet',
    stats: [
      { label: 'Entries Cleaned', value: '52,400' },
      { label: 'File Reduction', value: '45%' }
    ]
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Rajesh Sharma',
    role: 'CEO',
    company: 'Sharma Logistics Solutions',
    content: 'U B Web Developer built our tracking portal under 5 days! The dark futuristic theme perfectly aligns with our brand, and our clients love the modern tracking look. Exceptional quality for the price.',
    rating: 5
  },
  {
    id: 'test-2',
    name: 'Anjali Verma',
    role: 'Operations Director',
    company: 'Innovate Retail',
    content: 'Our inventory was a total mess with duplicates and broken formulas. Utkarsh cleaned over 30,000 SKU lines and created an interactive Pivot Dashboard. It saves us hours of manual reporting every single week.',
    rating: 5
  },
  {
    id: 'test-3',
    name: 'David K.',
    role: 'Founder',
    company: 'Skyline Marketing',
    content: 'The custom landing page built for our SaaS launch looks absolutely brilliant. The Framer Motion transitions, responsive layout, and clean form submission are top-tier. Highly recommended!',
    rating: 5
  }
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How do I place an order for a website or Excel sheet?',
    answer: 'It is simple! Browse our packages, click "Buy Now" or navigate to our custom Order Form. Fill in your project details, upload any reference files (such as sample spreadsheets, mockup drafts, or requirements), and click submit. You can also make a secure payment using our UPI details to start immediately!'
  },
  {
    id: 'faq-2',
    question: 'What is your delivery timeline for projects?',
    answer: 'Basic spreadsheets and simple websites are delivered within 24 to 72 hours. Comprehensive Business websites and complex MIS Automated Dashboards take around 3 to 7 days. If you have an urgent deadline, specify it in the order form, and we will accommodate it.'
  },
  {
    id: 'faq-3',
    question: 'How do we process payments securely?',
    answer: 'We accept instant secure payments via UPI using the UPI ID 7706929484@axl or our scannable QR code. After making the payment, insert your transaction Reference ID in our Payment Confirmation form on this website. Our system automatically confirms submissions with Utkarsh.'
  },
  {
    id: 'faq-4',
    question: 'Do you provide revisions if I need changes?',
    answer: 'Absolutely! We offer flexible revisions to guarantee your 100% satisfaction. For premium packages, we offer lifetime support to ensure your Excel macros or website elements always function optimally.'
  },
  {
    id: 'faq-5',
    question: 'Can you help with complex formulas (XLOOKUP, Nested IFs, Pivot Tables)?',
    answer: 'Yes! We specialize in advanced Excel formulas (INDEX+MATCH, XLOOKUP, dynamic arrays, SUMIFS) as well as data cleaning, reporting templates, MIS report formats, and professional formatting.'
  },
  {
    id: 'faq-6',
    question: 'How is our data protected during file upload?',
    answer: 'Your project files are processed on our secure Express server and kept strictly confidential. We do not share client files, spreadsheets, or proprietary business data with any third parties.'
  }
];
