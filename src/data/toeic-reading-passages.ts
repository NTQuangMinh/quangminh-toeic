export interface AnnotatedWord {
  word: string;
  meaningVi: string;
  pronunciation: string;
  partOfSpeech: string;
}

export interface ReadingQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ReadingPassageItem {
  id: string;
  title: string;
  category: string;
  passageType: "Internal Memo" | "Business Email" | "Company Notice" | "Press Release";
  sender?: string;
  recipient?: string;
  date: string;
  subject?: string;
  paragraphs: string[];
  vocabularyList: AnnotatedWord[];
  questions: ReadingQuestion[];
}

export const TOEIC_READING_PASSAGES: ReadingPassageItem[] = [
  {
    id: "passage_01",
    title: "Kế hoạch nâng cấp văn phòng & Lịch làm việc linh hoạt",
    category: "Office & Facilities",
    passageType: "Internal Memo",
    date: "October 14, 2026",
    sender: "Facilities & HR Department",
    recipient: "All Staff Members, Quang Minh Corporation",
    subject: "Comprehensive Headquarters Renovation & Remote Schedule",
    paragraphs: [
      "Please be advised that our corporate headquarters will undergo a major renovation starting next Monday. The primary objective of this project is to expand our collaboration zones and upgrade our network infrastructure.",
      "During the construction period, certain conference rooms will be temporarily unoccupied and unavailable for client meetings. We urge all department heads to coordinate schedules in advance and utilize virtual meeting platforms whenever feasible.",
      "The administration has approved a flexible hybrid schedule to minimize disruption. Employees may work remotely up to three days per week with prior supervisor approval. We appreciate your cooperation and patience as we modernize our workplace environment."
    ],
    vocabularyList: [
      {
        word: "renovation",
        meaningVi: "sự cải tạo, tu sửa văn phòng",
        pronunciation: "/,renə'veɪʃn/",
        partOfSpeech: "noun"
      },
      {
        word: "objective",
        meaningVi: "mục tiêu, mục đích trọng tâm",
        pronunciation: "/əb'dʒektɪv/",
        partOfSpeech: "noun"
      },
      {
        word: "infrastructure",
        meaningVi: "cơ sở hạ tầng, mạng lưới kỹ thuật",
        pronunciation: "/'ɪnfrəstrʌktʃə/",
        partOfSpeech: "noun"
      },
      {
        word: "unoccupied",
        meaningVi: "trống, chưa có người sử dụng",
        pronunciation: "/,ʌn'ɒkjupaɪd/",
        partOfSpeech: "adjective"
      },
      {
        word: "feasible",
        meaningVi: "khả thi, có thể thực hiện được",
        pronunciation: "/'fi:zəbl/",
        partOfSpeech: "adjective"
      },
      {
        word: "disruption",
        meaningVi: "sự gián đoạn, cản trở công việc",
        pronunciation: "/dɪs'rʌpʃn/",
        partOfSpeech: "noun"
      }
    ],
    questions: [
      {
        id: "q1_1",
        questionText: "What is the primary purpose of the planned renovation project?",
        options: [
          "(A) To relocate corporate headquarters to another city",
          "(B) To expand collaboration spaces and upgrade network systems",
          "(C) To terminate remote work policies permanently",
          "(D) To interview prospective staff members"
        ],
        correctIndex: 1,
        explanation: "Đoạn 1 nêu rõ: 'The primary objective of this project is to expand our collaboration zones and upgrade our network infrastructure' ➜ Đáp án (B)."
      },
      {
        id: "q1_2",
        questionText: "What are department heads asked to do regarding client meetings?",
        options: [
          "(A) Cancel all client contracts immediately",
          "(B) Host meetings exclusively outside the country",
          "(C) Coordinate schedules in advance and use virtual meeting tools",
          "(D) Request budget approval for purchasing furniture"
        ],
        correctIndex: 2,
        explanation: "Đoạn 2 nêu rõ: 'We urge all department heads to coordinate schedules in advance and utilize virtual meeting platforms whenever feasible' ➜ Đáp án (C)."
      }
    ]
  },
  {
    id: "passage_02",
    title: "Đàm phán hợp đồng & Chiết khấu đơn hàng lớn",
    category: "Business & Contracts",
    passageType: "Business Email",
    date: "October 16, 2026",
    sender: "Marcus Vance <m.vance@vancetech.com>",
    recipient: "Nguyen Hoang Anh <anh.nguyen@qm-logistics.vn>",
    subject: "Contract Negotiation - Annual Software License Renewal",
    paragraphs: [
      "Dear Mr. Nguyen, Thank you for taking the time to discuss the upcoming renewal of your enterprise software licenses yesterday afternoon. We truly value our long-standing partnership with Quang Minh Logistics.",
      "Following our discussion, we have revised the commercial proposal. We are pleased to offer a 15% discount on the fixed subscription fee, provided that your organization commits to a two-year extension. Furthermore, our technical team will provide complimentary maintenance support throughout the contract duration.",
      "Please review the attached formal agreement. If the revised terms align with your budgetary constraints, kindly sign and return the document by Friday at 5:00 PM so we can finalize the implementation schedule."
    ],
    vocabularyList: [
      {
        word: "negotiation",
        meaningVi: "sự đàm phán, thương lượng hợp đồng",
        pronunciation: "/nɪ,ɡəʊʃi'eɪʃn/",
        partOfSpeech: "noun"
      },
      {
        word: "subscription",
        meaningVi: "gói thuê bao, phí dịch vụ định kỳ",
        pronunciation: "/səb'skrɪpʃn/",
        partOfSpeech: "noun"
      },
      {
        word: "complimentary",
        meaningVi: "miễn phí, tặng kèm dịch vụ",
        pronunciation: "/,kɒmplɪ'mentri/",
        partOfSpeech: "adjective"
      },
      {
        word: "constraints",
        meaningVi: "sự giới hạn, ràng buộc ngân sách",
        pronunciation: "/kən'streɪnts/",
        partOfSpeech: "noun"
      },
      {
        word: "finalize",
        meaningVi: "hoàn tất, chốt thỏa thuận cuối cùng",
        pronunciation: "/'faɪnəlaɪz/",
        partOfSpeech: "verb"
      }
    ],
    questions: [
      {
        id: "q2_1",
        questionText: "What condition is required to receive the 15% discount?",
        options: [
          "(A) Purchasing new hardware equipment",
          "(B) Committing to a two-year contract extension",
          "(C) Submitting payment within 24 hours",
          "(D) Hiring an external auditing agency"
        ],
        correctIndex: 1,
        explanation: "Đoạn 2 nêu: 'offer a 15% discount on the fixed subscription fee, provided that your organization commits to a two-year extension' ➜ Đáp án (B)."
      },
      {
        id: "q2_2",
        questionText: "The word 'complimentary' in paragraph 2 is closest in meaning to:",
        options: [
          "(A) expensive",
          "(B) free of charge",
          "(C) mandatory",
          "(D) highly recommended"
        ],
        correctIndex: 1,
        explanation: "Từ 'complimentary' trong ngữ cảnh dịch vụ văn phòng TOEIC có nghĩa là 'free of charge' (miễn phí, không tính thêm tiền) ➜ Đáp án (B)."
      }
    ]
  },
  {
    id: "passage_03",
    title: "Sáng kiến bảo tồn môi trường & Logistics xanh",
    category: "Environment & Logistics",
    passageType: "Press Release",
    date: "October 18, 2026",
    sender: "Corporate Sustainability Board",
    recipient: "Public Release",
    subject: "Launch of Eco-Friendly Packaging and Renewable Fleet Initiative",
    paragraphs: [
      "In response to rising global environmental concerns, Quang Minh Corporation has officially launched its comprehensive conservation initiative. The initiative aims to reduce carbon emissions across all distribution channels by 35% over the next three fiscal years.",
      "As part of this commitment, our logistics division will substitute petroleum-powered vans with electric delivery vehicles in all metropolitan areas. Additionally, all shipping warehouses will transition exclusively to recyclable and biodegradable packaging materials.",
      "The corporation believes that environmental responsibility and operational profitability can reinforce each other. Initial customer surveys indicate strong public endorsement for sustainable business practices."
    ],
    vocabularyList: [
      {
        word: "conservation",
        meaningVi: "sự bảo tồn tài nguyên & môi trường",
        pronunciation: "/,kɒnsə'veɪʃn/",
        partOfSpeech: "noun"
      },
      {
        word: "distribution",
        meaningVi: "sự phân phối, kênh vận chuyển hàng hóa",
        pronunciation: "/,dɪstrɪ'bju:ʃn/",
        partOfSpeech: "noun"
      },
      {
        word: "substitute",
        meaningVi: "thay thế, đổi cái này bằng cái khác",
        pronunciation: "/'sʌbstɪtju:t/",
        partOfSpeech: "verb"
      },
      {
        word: "metropolitan",
        meaningVi: "thuộc về đô thị, thành phố lớn",
        pronunciation: "/,metrə'pɒlɪtən/",
        partOfSpeech: "adjective"
      },
      {
        word: "endorsement",
        meaningVi: "sự ủng hộ, tán đồng nhiệt tình",
        pronunciation: "/ɪn'dɔ:smənt/",
        partOfSpeech: "noun"
      }
    ],
    questions: [
      {
        id: "q3_1",
        questionText: "What target has Quang Minh Corporation set for the next three fiscal years?",
        options: [
          "(A) Raising product prices across international stores",
          "(B) Reducing carbon emissions by 35% in distribution channels",
          "(C) Shutting down delivery warehouses in metropolitan cities",
          "(D) Doubling petroleum consumption"
        ],
        correctIndex: 1,
        explanation: "Đoạn 1 nêu rõ: 'reduce carbon emissions across all distribution channels by 35% over the next three fiscal years' ➜ Đáp án (B)."
      },
      {
        id: "q3_2",
        questionText: "What will the logistics division do in metropolitan areas?",
        options: [
          "(A) Replace petroleum-powered delivery vans with electric vehicles",
          "(B) Stop all weekend shipping operations",
          "(C) Introduce plastic non-recyclable bags",
          "(D) Charge additional fees for standard shipments"
        ],
        correctIndex: 0,
        explanation: "Đoạn 2 nêu rõ: 'our logistics division will substitute petroleum-powered vans with electric delivery vehicles in all metropolitan areas' ➜ Đáp án (A)."
      }
    ]
  }
];
