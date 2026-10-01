/**
 * Curated high-resolution illustration and photography library for TOEIC vocabulary.
 * Each topic and frequent TOEIC word maps to a professional, royalty-free contextual illustration.
 */

export interface WordVisual {
  imageUrl: string;
  badgeLabel: string;
  gradient: string;
  altText: string;
}

// Topic-level high resolution visual representations
const TOPIC_VISUALS: Record<string, WordVisual> = {
  Contracts: {
    imageUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Hợp đồng & Pháp lý",
    gradient: "from-blue-600/80 to-slate-900/80",
    altText: "Legal business contract and signing",
  },
  Marketing: {
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Marketing & Thị trường",
    gradient: "from-purple-600/80 to-indigo-900/80",
    altText: "Marketing analytics and strategy",
  },
  Warranties: {
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Bảo hành & Cam kết",
    gradient: "from-emerald-600/80 to-teal-900/80",
    altText: "Quality warranty assurance",
  },
  "Business Planning": {
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Kế hoạch kinh doanh",
    gradient: "from-sky-600/80 to-blue-900/80",
    altText: "Team business strategy meeting",
  },
  Conferences: {
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Hội nghị & Triển lãm",
    gradient: "from-indigo-600/80 to-slate-900/80",
    altText: "International conference keynote",
  },
  Computers: {
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Máy tính & Công nghệ",
    gradient: "from-cyan-600/80 to-blue-950/80",
    altText: "Modern laptop workplace",
  },
  "Office Technology": {
    imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Thiết bị văn phòng",
    gradient: "from-slate-700/80 to-slate-950/80",
    altText: "Office digital technology",
  },
  "Office Procedures": {
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Quy trình văn phòng",
    gradient: "from-blue-700/80 to-slate-900/80",
    altText: "Modern open office workflow",
  },
  Electronics: {
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Điện tử & Bán dẫn",
    gradient: "from-blue-800/80 to-indigo-950/80",
    altText: "Electronics circuit components",
  },
  Correspondence: {
    imageUrl: "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Thư tín & Email công sở",
    gradient: "from-amber-600/80 to-orange-950/80",
    altText: "Business correspondence and email",
  },
  "Job Advertising & Recruiting": {
    imageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Tuyển dụng nhân sự",
    gradient: "from-teal-600/80 to-slate-900/80",
    altText: "Candidate resumes and hiring",
  },
  "Apply & Interviewing": {
    imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Phỏng vấn xin việc",
    gradient: "from-blue-600/80 to-indigo-900/80",
    altText: "Job interview discussion",
  },
  "Hiring & Training": {
    imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Đào tạo nhân viên",
    gradient: "from-violet-600/80 to-purple-950/80",
    altText: "Corporate training workshop",
  },
  "Salaries & Benefits": {
    imageUrl: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Lương & Phúc lợi",
    gradient: "from-emerald-600/80 to-green-950/80",
    altText: "Compensation package and payroll",
  },
  "Promotions, Pensions & Awards": {
    imageUrl: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Thăng chức & Khen thưởng",
    gradient: "from-amber-500/80 to-orange-900/80",
    altText: "Golden trophy recognition award",
  },
  Shopping: {
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Mua sắm & Bán lẻ",
    gradient: "from-pink-600/80 to-rose-950/80",
    altText: "Retail shopping and commerce",
  },
  "Ordering Supplies": {
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Đặt hàng văn phòng phẩm",
    gradient: "from-amber-600/80 to-slate-900/80",
    altText: "Supplies warehouse boxes",
  },
  Shipping: {
    imageUrl: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Vận chuyển & Logistics",
    gradient: "from-sky-700/80 to-indigo-950/80",
    altText: "Shipping container logistics freight",
  },
  Invoices: {
    imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Hóa đơn & Thanh toán",
    gradient: "from-blue-700/80 to-slate-900/80",
    altText: "Financial invoice calculation",
  },
  Inventory: {
    imageUrl: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Quản lý kho hàng",
    gradient: "from-orange-600/80 to-stone-900/80",
    altText: "Warehouse stock inventory",
  },
  Banking: {
    imageUrl: "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Ngân hàng & Tiền tệ",
    gradient: "from-blue-800/80 to-slate-950/80",
    altText: "Modern banking institution",
  },
  Accounting: {
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Kế toán & Kiểm toán",
    gradient: "from-slate-700/80 to-blue-950/80",
    altText: "Accounting audit balance ledger",
  },
  Investments: {
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Đầu tư & Thị trường vốn",
    gradient: "from-emerald-700/80 to-slate-950/80",
    altText: "Investment stock growth charts",
  },
  Taxes: {
    imageUrl: "https://images.unsplash.com/photo-1586486855514-8c633cc6fd38?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Thuế & Kê khai",
    gradient: "from-rose-700/80 to-slate-900/80",
    altText: "Tax compliance filing forms",
  },
  "Financial Statements": {
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Báo cáo tài chính",
    gradient: "from-blue-900/80 to-slate-950/80",
    altText: "Corporate financial skyscraper headquarters",
  },
  "Property & Board Meetings": {
    imageUrl: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Bất động sản & Họp HĐQT",
    gradient: "from-slate-800/80 to-zinc-950/80",
    altText: "Executive boardroom glass table",
  },
  "Quality Control": {
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Kiểm soát chất lượng (QC)",
    gradient: "from-blue-600/80 to-teal-950/80",
    altText: "Precision quality assurance inspection",
  },
  "Product Development": {
    imageUrl: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Phát triển sản phẩm",
    gradient: "from-indigo-600/80 to-blue-950/80",
    altText: "Product engineering design blueprint",
  },
  "Renting & Leasing": {
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Thuê & Cho thuê mặt bằng",
    gradient: "from-cyan-700/80 to-slate-900/80",
    altText: "Property rental lease keys",
  },
  "Selecting a Restaurant": {
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Chọn nhà hàng tiếp khách",
    gradient: "from-amber-700/80 to-stone-950/80",
    altText: "Fine dining restaurant ambience",
  },
  "Eating Out": {
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Dùng bữa đối tác",
    gradient: "from-orange-600/80 to-red-950/80",
    altText: "Restaurant dining cuisine",
  },
  "Ordering Food": {
    imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Gọi món & Đặt tiệc",
    gradient: "from-amber-600/80 to-orange-950/80",
    altText: "Food menu order",
  },
  "Cooking as a Career": {
    imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Ẩm thực chuyên nghiệp",
    gradient: "from-stone-700/80 to-stone-950/80",
    altText: "Chef cooking in commercial kitchen",
  },
  "Events & Entertainment": {
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Sự kiện & Giải trí",
    gradient: "from-fuchsia-600/80 to-indigo-950/80",
    altText: "Corporate event gala stage",
  },
  Movies: {
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Điện ảnh & Phim ảnh",
    gradient: "from-red-700/80 to-zinc-950/80",
    altText: "Cinema movie theater screening",
  },
  Theater: {
    imageUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Kịch nghệ & Sân khấu",
    gradient: "from-rose-800/80 to-stone-950/80",
    altText: "Theater stage spotlight",
  },
  Music: {
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Âm nhạc & Hòa nhạc",
    gradient: "from-violet-700/80 to-slate-950/80",
    altText: "Music performance instruments",
  },
  Museums: {
    imageUrl: "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Bảo tàng & Văn hóa",
    gradient: "from-amber-700/80 to-slate-900/80",
    altText: "Art gallery museum exhibition",
  },
  Media: {
    imageUrl: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Truyền thông & Báo chí",
    gradient: "from-blue-700/80 to-slate-950/80",
    altText: "Broadcast media news reporting",
  },
  "Doctor's Office": {
    imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Phòng khám Bác sĩ",
    gradient: "from-emerald-700/80 to-teal-950/80",
    altText: "Doctor clinic consultation",
  },
  "Dentist's Office": {
    imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Phòng khám Nha khoa",
    gradient: "from-sky-600/80 to-cyan-950/80",
    altText: "Modern dental clinic",
  },
  "Health Insurance": {
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Bảo hiểm Y tế",
    gradient: "from-blue-600/80 to-indigo-950/80",
    altText: "Health insurance protection",
  },
  Hospitals: {
    imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Bệnh viện đa khoa",
    gradient: "from-cyan-700/80 to-slate-900/80",
    altText: "Hospital corridor clinic",
  },
  Pharmacy: {
    imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Nhà thuốc & Dược phẩm",
    gradient: "from-emerald-600/80 to-green-950/80",
    altText: "Pharmacy medication dispensary",
  },
  "Travel Planning": {
    imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Lên kế hoạch Du lịch",
    gradient: "from-teal-600/80 to-blue-950/80",
    altText: "Travel passport map planning",
  },
  Airlines: {
    imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Hàng không & Chuyến bay",
    gradient: "from-blue-600/80 to-sky-950/80",
    altText: "Airplane wing soaring above clouds",
  },
  Trains: {
    imageUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Tàu hỏa & Đường sắt",
    gradient: "from-indigo-600/80 to-slate-900/80",
    altText: "High-speed rail train station",
  },
  Hotels: {
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Khách sạn & Nghỉ dưỡng",
    gradient: "from-amber-600/80 to-stone-900/80",
    altText: "Luxury hotel reception lobby",
  },
  "Car Rentals": {
    imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Thuê xe du lịch",
    gradient: "from-slate-700/80 to-zinc-950/80",
    altText: "Rental car keys and journey",
  },
  Sightseeing: {
    imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Tham quan & Danh lam",
    gradient: "from-emerald-600/80 to-teal-950/80",
    altText: "Scenic sightseeing tour",
  },
};

// Specific prominent word-level visuals for extra visual precision
const WORD_SPECIFIC_VISUALS: Record<string, WordVisual> = {
  "abide by": {
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Tuân theo luật lệ",
    gradient: "from-amber-700/80 to-slate-900/80",
    altText: "Law gavel justice compliance",
  },
  agreement: {
    imageUrl: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Ký kết thỏa thuận",
    gradient: "from-blue-600/80 to-indigo-900/80",
    altText: "Professional business handshake agreement",
  },
  assurance: {
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Sự đảm bảo cam kết",
    gradient: "from-emerald-600/80 to-teal-950/80",
    altText: "Certified guarantee quality assurance",
  },
  cancellation: {
    imageUrl: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Hủy bỏ lịch trình",
    gradient: "from-rose-700/80 to-stone-900/80",
    altText: "Calendar schedule cancellation notice",
  },
  determine: {
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Xác định mục tiêu",
    gradient: "from-blue-700/80 to-indigo-950/80",
    altText: "Strategy analysis determining path",
  },
  engage: {
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Gắn kết & Hợp tác",
    gradient: "from-indigo-600/80 to-purple-900/80",
    altText: "Engaged collaborative team meeting",
  },
  establish: {
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Thành lập & Xây dựng",
    gradient: "from-sky-700/80 to-slate-900/80",
    altText: "Corporate skyscraper foundation",
  },
  obligate: {
    imageUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Nghĩa vụ bắt buộc",
    gradient: "from-amber-700/80 to-slate-950/80",
    altText: "Legal obligation contract clause",
  },
  party: {
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Các bên tham gia",
    gradient: "from-blue-600/80 to-slate-900/80",
    altText: "Parties negotiating at conference table",
  },
  provision: {
    imageUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Điều khoản hợp đồng",
    gradient: "from-purple-700/80 to-indigo-950/80",
    altText: "Contractual legal provision terms",
  },
  resolve: {
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Giải quyết khúc mắc",
    gradient: "from-emerald-600/80 to-slate-900/80",
    altText: "Problem resolution strategy",
  },
  specific: {
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Chi tiết cụ thể",
    gradient: "from-cyan-600/80 to-blue-950/80",
    altText: "Specific detailed criteria inspection",
  },
  attract: {
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Thu hút khách hàng",
    gradient: "from-pink-600/80 to-purple-950/80",
    altText: "Attracting audience marketing campaign",
  },
  compete: {
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Cạnh tranh trên thị trường",
    gradient: "from-orange-600/80 to-red-950/80",
    altText: "Competition sprint race",
  },
  convince: {
    imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Thuyết phục đối tác",
    gradient: "from-blue-600/80 to-indigo-900/80",
    altText: "Convincing presentation pitch",
  },
  inspire: {
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Truyền cảm hứng",
    gradient: "from-amber-500/80 to-orange-900/80",
    altText: "Creative inspiration lightbulb idea",
  },
  productive: {
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Năng suất cao",
    gradient: "from-emerald-600/80 to-teal-900/80",
    altText: "Productive working flow",
  },
  satisfaction: {
    imageUrl: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Sự hài lòng 5 sao",
    gradient: "from-yellow-500/80 to-amber-900/80",
    altText: "Customer satisfaction review rating",
  },
  accommodate: {
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=700&auto=format&fit=crop&q=80",
    badgeLabel: "Cung cấp chỗ nghỉ",
    gradient: "from-amber-600/80 to-slate-900/80",
    altText: "Hotel accommodating guest rooms",
  },
};

/**
 * Returns the best matching high-res illustration for any given TOEIC word and topic.
 */
export function getWordIllustration(word: string, topic?: string): WordVisual {
  const normalizedWord = word.trim().toLowerCase();

  // 1. Direct word match
  if (WORD_SPECIFIC_VISUALS[normalizedWord]) {
    return WORD_SPECIFIC_VISUALS[normalizedWord];
  }

  // 2. Direct topic match
  if (topic && TOPIC_VISUALS[topic]) {
    return TOPIC_VISUALS[topic];
  }

  // 3. Fallback matching by keyword in word/topic
  for (const [key, visual] of Object.entries(TOPIC_VISUALS)) {
    if (topic && topic.toLowerCase().includes(key.toLowerCase())) {
      return visual;
    }
  }

  // 4. Default high-end modern business illustration
  return {
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&auto=format&fit=crop&q=80",
    badgeLabel: topic || "Từ vựng TOEIC",
    gradient: "from-blue-600/80 to-slate-900/80",
    altText: "TOEIC business workplace environment",
  };
}
