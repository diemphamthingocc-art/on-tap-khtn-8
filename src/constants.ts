export interface MCQQuestion {
  q: string;
  a: string[];
  c: number;
}

export interface TFQuestion {
  q: string;
  i: string[];
  a: boolean[];
}

export interface ShortQuestion {
  q: string;
  ref: string;
}

export const mcqQuestions: MCQQuestion[] = [
  { q: "Tuyến nào được coi là 'tuyến chỉ huy' của hệ nội tiết?", a: ["Tuyến giáp", "Tuyến tụy", "Tuyến yên", "Tuyến trên thận"], c: 2 },
  { q: "Lớp nào của da có chức năng bài tiết mồ hôi và cảm giác?", a: ["Lớp biểu bì", "Lớp bì", "Lớp mỡ dưới da", "Lớp sừng"], c: 1 },
  { q: "Quá trình thụ tinh thường diễn ra ở đâu?", a: ["Tử cung", "Ống dẫn trứng", "Buồng trứng", "Âm đạo"], c: 1 },
  { q: "Loại hormone nào giúp làm giảm đường huyết sau khi ăn?", a: ["Glucagon", "Adrenalin", "Insulin", "Thyroxin"], c: 2 },
  { q: "Cơ quan nào có chức năng sản sinh tinh trùng?", a: ["Ống dẫn tinh", "Túi tinh", "Tinh hoàn", "Tuyến tiền liệt"], c: 2 },
  { q: "Khi trời nóng, mao mạch dưới da dãn ra có tác dụng gì?", a: ["Giữ nhiệt", "Tăng cường thoát nhiệt", "Giảm thoát nhiệt", "Sản sinh nhiệt"], c: 1 }
];

export const tfQuestions: TFQuestion[] = [
  { q: "Về hệ nội tiết và các bệnh liên quan:", i: ["Bệnh bướu cổ do thiếu hụt Iodine ảnh hưởng đến tuyến giáp", "Tuyến tụy chỉ đóng vai trò là tuyến nội tiết", "Bệnh tiểu đường là do rối loạn hormone insulin", "Tuyến trên thận giúp cơ thể phản ứng với các tình huống khẩn cấp"], a: [true, false, true, true] },
  { q: "Về cấu tạo da và điều hòa thân nhiệt:", i: ["Da là cơ quan lớn nhất bảo vệ cơ thể khỏi tác nhân vật lý", "Hệ thần kinh không tham gia vào quá trình điều hòa thân nhiệt", "Rét run là một phản ứng của cơ thể để sinh nhiệt", "Tắm đêm bằng nước lạnh giúp tăng cường sức khỏe của da"], a: [true, false, true, false] },
  { q: "Về sức khỏe sinh sản:", i: ["Kinh nguyệt là dấu hiệu trứng không được thụ tinh", "HIV/AIDS chỉ lây qua đường tình dục", "Sử dụng bao cao su giúp ngăn ngừa cả thụ thai và bệnh lây qua đường tình dục", "Thụ thai là quá trình hợp tử bám vào niêm mạc tử cung"], a: [true, false, true, true] }
];

export const shortQuestions: ShortQuestion[] = [
  { q: "Hãy nêu cấu tạo sơ lược và chức năng của lớp bì trong cấu tạo da?", ref: "Lớp bì gồm các sợi mô liên kết bền chặt, chứa thụ quan (cảm giác), mạch máu (nuôi dưỡng, điều nhiệt), tuyến mồ hôi, tuyến nhờn và chân lông." },
  { q: "Tại sao khi một người tập thể dục mạnh, da thường đỏ ửng và mồ hôi vã ra? Điều này chứng tỏ điều gì về mối quan hệ giữa các hệ cơ quan?", ref: "Khi vận động mạnh, cơ thể sinh nhiệt. Hệ thần kinh điều khiển mao mạch dưới da dãn (da đỏ) để thoát nhiệt và tuyến mồ hôi hoạt động mạnh để làm mát. Chứng tỏ sự phối hợp chặt chẽ giữa hệ vận động, hệ tuần hoàn, da và hệ thần kinh." },
  { q: "Hãy giải thích tại sao tuyến yên được gọi là tuyến nội tiết quan trọng nhất?", ref: "Vì hormone của tuyến yên không chỉ ảnh hưởng trực tiếp đến nhiều quá trình sinh lý mà còn kích thích hoạt động của hầu hết các tuyến nội tiết khác trong cơ thể." },
  { q: "Nêu các biện pháp chăm sóc và bảo vệ da đúng cách trong mùa hè nắng nóng?", ref: "Uống đủ nước, vệ sinh da sạch sẽ, sử dụng kem chống nắng, mặc quần áo bảo hộ khi ra ngoài trời, hạn chế tiếp xúc trực tiếp với ánh nắng cường độ cao." },
  { q: "Phân biệt khái niệm thụ tinh và thụ thai?", ref: "Thụ tinh là sự kết hợp giữa tinh trùng và trứng tạo thành hợp tử. Thụ thai là quá trình hợp tử di chuyển và bám vào lớp niêm mạc tử cung để phát triển thành phôi." },
  { q: "Làm thế nào để phòng tránh các bệnh lây truyền qua đường tình dục hiệu quả nhất ở lứa tuổi học sinh?", ref: "Xây dựng lối sống lành mạnh, trang bị kiến thức về sức khỏe sinh sản, không quan hệ tình dục sớm và sử dụng các biện pháp bảo vệ an toàn nếu cần thiết." }
];
