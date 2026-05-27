import { Student, Question } from './types';

export const AVAILABLE_CLASSES = [
  'VII Ibnu Abbas (Laki-laki)',
  'VII Asma (Perempuan)',
  'VIII Ubay (Laki-laki)',
  'VIII Sumayyah (Perempuan)',
  'IX Zubair (Laki-laki)',
  'IX Khaula (Perempuan)'
];

export const INITIAL_STUDENTS: Student[] = (() => {
  const rombelToClassMap: Record<string, string> = {
    'VII - Asma': 'VII Asma (Perempuan)',
    'VII - Ibnu Abbas': 'VII Ibnu Abbas (Laki-laki)',
    'VIII - Ubay': 'VIII Ubay (Laki-laki)',
    'VIII - Sumayyah': 'VIII Sumayyah (Perempuan)',
    'IX - Zubair': 'IX Zubair (Laki-laki)',
    'IX - Khaula': 'IX Khaula (Perempuan)',
  };

  const raw = [
    { no: 1, name: "Aafiya Zahra", rombel: "VII - Asma" },
    { no: 2, name: "Abdullah Taqi Hamami", rombel: "IX - Zubair" },
    { no: 3, name: "ABIZAR", rombel: "VIII - Ubay" },
    { no: 4, name: "Adifa Rahma Syabina", rombel: "VII - Asma" },
    { no: 5, name: "Ahmad Kaisan", rombel: "VII - Ibnu Abbas" },
    { no: 6, name: "Al-Amin Abdurrahim", rombel: "VIII - Ubay" },
    { no: 7, name: "Albiruni Rahmat Pinem", rombel: "IX - Zubair" },
    { no: 8, name: "ALIF AL-FATA", rombel: "VIII - Ubay" },
    { no: 9, name: "Alyatul Faizah", rombel: "IX - Khaula" },
    { no: 10, name: "ANANDRA ALWI HIDAYAT", rombel: "IX - Zubair" },
    { no: 11, name: "ANISA SAHIL", rombel: "VIII - Sumayyah" },
    { no: 12, name: "Asyifa Salsabila", rombel: "IX - Khaula" },
    { no: 13, name: "Aufa Furqan", rombel: "VIII - Ubay" },
    { no: 14, name: "Aufar Al Fatih", rombel: "VII - Ibnu Abbas" },
    { no: 15, name: "AULFITLAH MAYDAY USHALLI", rombel: "VII - Ibnu Abbas" },
    { no: 16, name: "Aulia Maulana", rombel: "VII - Ibnu Abbas" },
    { no: 17, name: "AULIFA LADHZU USHALLI", rombel: "VIII - Sumayyah" },
    { no: 18, name: "AZMIL RIZKY ZAIDAN", rombel: "VIII - Ubay" },
    { no: 19, name: "AZRA ZAHIRA", rombel: "VII - Asma" },
    { no: 20, name: "CHACHA ZAKIA RAMADHANI", rombel: "IX - Khaula" },
    { no: 21, name: "Chayra Aqyla Taqiyya", rombel: "VII - Asma" },
    { no: 22, name: "Chessa Atta Syahna", rombel: "IX - Khaula" },
    { no: 23, name: "DWI RAMADHANI", rombel: "IX - Khaula" },
    { no: 24, name: "Esha Naifa Ausi", rombel: "VII - Asma" },
    { no: 25, name: "Fabian Azkanul Arsyad", rombel: "VII - Ibnu Abbas" },
    { no: 26, name: "Faiqatunnisa Zulkarnain", rombel: "VIII - Sumayyah" },
    { no: 27, name: "Fairuz Zaharana Rania", rombel: "IX - Khaula" },
    { no: 28, name: "Faizatunnisa Zulkarnain", rombel: "VIII - Sumayyah" },
    { no: 29, name: "Falah Anandra Raza", rombel: "VIII - Ubay" },
    { no: 30, name: "Falisha Ufaira Yusuf", rombel: "VII - Asma" },
    { no: 31, name: "Farel Mohd Al Jundy", rombel: "IX - Zubair" },
    { no: 32, name: "Farez Mohd Al Jundy", rombel: "IX - Zubair" },
    { no: 33, name: "Faris Annaufal", rombel: "IX - Zubair" },
    { no: 34, name: "FARISA GHASSANY", rombel: "IX - Khaula" },
    { no: 35, name: "Farisha Nuha Assyaurah", rombel: "VII - Asma" },
    { no: 36, name: "FATHIMAH RAJWA", rombel: "IX - Khaula" },
    { no: 37, name: "FATIMAH AZ-ZAHRA HELMI", rombel: "VII - Asma" },
    { no: 38, name: "FATIMAH AZ ZUHRA", rombel: "IX - Khaula" },
    { no: 39, name: "Fayra Qanita", rombel: "IX - Khaula" },
    { no: 40, name: "Fazila Ahmad", rombel: "VIII - Sumayyah" },
    { no: 41, name: "FIKRI FERDIANTO", rombel: "IX - Zubair" },
    { no: 42, name: "Fitria Putroe Atifa", rombel: "IX - Khaula" },
    { no: 43, name: "Habibi Ath- Thaqif", rombel: "IX - Zubair" },
    { no: 44, name: "HAFIZATHUL ZAHRA", rombel: "VIII - Sumayyah" },
    { no: 45, name: "HAIFA TSURAYYA", rombel: "IX - Khaula" },
    { no: 46, name: "Hani Syakira", rombel: "VII - Asma" },
    { no: 47, name: "Irdina Ilmuna", rombel: "IX - Khaula" },
    { no: 48, name: "Jadid Aslam Durrani", rombel: "VIII - Ubay" },
    { no: 49, name: "JIHAN ZAHIRA TALITA", rombel: "VIII - Sumayyah" },
    { no: 50, name: "KAYLA NAFISA HANIF", rombel: "VIII - Sumayyah" },
    { no: 51, name: "Kaysa Authari", rombel: "VIII - Sumayyah" },
    { no: 52, name: "Khadziya Rafani Sakhi", rombel: "VII - Asma" },
    { no: 53, name: "Khalisha Salsabila Setiawan", rombel: "IX - Khaula" },
    { no: 54, name: "Kinara Letisya", rombel: "VII - Asma" },
    { no: 55, name: "Kiswa Nafisa Elzuarni", rombel: "VIII - Sumayyah" },
    { no: 56, name: "M. Rafa Mubarak", rombel: "VIII - Ubay" },
    { no: 57, name: "M. Zahwan Athaurrahman", rombel: "VII - Ibnu Abbas" },
    { no: 58, name: "Marwah Nazeera", rombel: "VIII - Sumayyah" },
    { no: 59, name: "Maulana Fazlurrahman", rombel: "VII - Ibnu Abbas" },
    { no: 60, name: "Maulana Pratama", rombel: "VII - Ibnu Abbas" },
    { no: 61, name: "MAYSARAH", rombel: "IX - Khaula" },
    { no: 62, name: "Mazaya Ramadhani", rombel: "IX - Khaula" },
    { no: 63, name: "Muazzam Alfatih", rombel: "VII - Ibnu Abbas" },
    { no: 64, name: "MUFIDATUL ADZKIA", rombel: "IX - Khaula" },
    { no: 65, name: "Muhammad Abidzar Alghifari", rombel: "VII - Ibnu Abbas" },
    { no: 66, name: "Muhammad Adrian Shamil", rombel: "VII - Ibnu Abbas" },
    { no: 67, name: "Muhammad Afif Al'abid", rombel: "VII - Ibnu Abbas" },
    { no: 68, name: "Muhammad Al-Ghifari", rombel: "IX - Zubair" },
    { no: 69, name: "MUHAMMAD ALFAN RISKAN", rombel: "IX - Zubair" },
    { no: 70, name: "Muhammad Alfaris", rombel: "VIII - Ubay" },
    { no: 71, name: "Muhammad Alfizaki", rombel: "IX - Zubair" },
    { no: 72, name: "Muhammad Arqan Syafiq", rombel: "VIII - Ubay" },
    { no: 73, name: "Muhammad Aufar Azizi", rombel: "VII - Ibnu Abbas" },
    { no: 74, name: "Muhammad Daffaizlamy", rombel: "VIII - Ubay" },
    { no: 75, name: "MUHAMMAD FAHEEM SHADIQ", rombel: "IX - Zubair" },
    { no: 76, name: "Muhammad Faris Al-Qadri", rombel: "VIII - Ubay" },
    { no: 77, name: "MUHAMMAD FARRAS AZKA", rombel: "VII - Ibnu Abbas" },
    { no: 78, name: "MUHAMMAD HAFIZ FURQAN", rombel: "IX - Zubair" },
    { no: 79, name: "MUHAMMAD IRHAM SYAUQIN", rombel: "IX - Zubair" },
    { no: 80, name: "Muhammad Izzan Al-Qarary", rombel: "VII - Ibnu Abbas" },
    { no: 81, name: "Muhammad Khalifatul Azka", rombel: "VII - Ibnu Abbas" },
    { no: 82, name: "MUHAMMAD NAFIS ALFATTAH", rombel: "VIII - Ubay" },
    { no: 83, name: "MUHAMMAD NAIL SALAFY", rombel: "VIII - Ubay" },
    { no: 84, name: "Muhammad Naufal", rombel: "VII - Ibnu Abbas" },
    { no: 85, name: "MUHAMMAD NAUFAL", rombel: "VIII - Ubay" },
    { no: 86, name: "Muhammad Rafa Wibowo", rombel: "VIII - Ubay" },
    { no: 87, name: "Muhammad Rafif Mirza", rombel: "VII - Ibnu Abbas" },
    { no: 88, name: "Muhammad Rafkal Alrizki", rombel: "VII - Ibnu Abbas" },
    { no: 89, name: "Muhammad Raihan Al Farisi", rombel: "VII - Ibnu Abbas" },
    { no: 90, name: "Muhammad Rayyan", rombel: "IX - Zubair" },
    { no: 91, name: "MUHAMMAD RINANDIKA WAHIDI", rombel: "IX - Zubair" },
    { no: 92, name: "MUHAMMAD RIZKA RAMADHAN", rombel: "VIII - Ubay" },
    { no: 93, name: "MUHAMMAD RIZKI AULIA", rombel: "IX - Zubair" },
    { no: 94, name: "Muhammad Sami", rombel: "IX - Zubair" },
    { no: 95, name: "MUHAMMAD SIDDIQ", rombel: "IX - Zubair" },
    { no: 96, name: "MUHAMMAD SULTHANY AR-RAZI", rombel: "IX - Zubair" },
    { no: 97, name: "MUHAMMAD SYAHYADI", rombel: "IX - Zubair" },
    { no: 98, name: "MUHAMMAD THAIFUR RAZA", rombel: "VIII - Ubay" },
    { no: 99, name: "Muhammad Willy", rombel: "VIII - Ubay" },
    { no: 100, name: "Muhammad Zaidan AR Razaaq", rombel: "VIII - Ubay" },
    { no: 101, name: "MUHAMMAD ZIYAD DHIYAUL HAQ", rombel: "IX - Zubair" },
    { no: 102, name: "MUSZAFAR HABIBI", rombel: "IX - Zubair" },
    { no: 103, name: "Nabila Anindita Azzahra", rombel: "VIII - Sumayyah" },
    { no: 104, name: "Nadhifa Syakira Nashar", rombel: "VII - Asma" },
    { no: 105, name: "Nadia Syifa", rombel: "IX - Khaula" },
    { no: 106, name: "NADIATUL FIRDA", rombel: "IX - Khaula" },
    { no: 107, name: "Nadiyatul Husna", rombel: "IX - Khaula" },
    { no: 108, name: "Naiya Khansa Azzahra", rombel: "VIII - Sumayyah" },
    { no: 109, name: "NAJLAA AISYARANI", rombel: "VIII - Sumayyah" },
    { no: 110, name: "Nasyila Atil Furry", rombel: "IX - Khaula" },
    { no: 111, name: "Nidaul Khaira", rombel: "VIII - Sumayyah" },
    { no: 112, name: "NIKITA ALZENA AZALEA", rombel: "IX - Khaula" },
    { no: 113, name: "Nikman Nashira Laiyina", rombel: "VIII - Sumayyah" },
    { no: 114, name: "Niswatur Azkia", rombel: "IX - Khaula" },
    { no: 115, name: "Nizam Zulvrianda", rombel: "IX - Zubair" },
    { no: 116, name: "QANITA NASHIHAH", rombel: "VIII - Sumayyah" },
    { no: 117, name: "QONITA TIMORA", rombel: "VII - Asma" },
    { no: 118, name: "QORY ILMI FASA", rombel: "VII - Asma" },
    { no: 119, name: "Quwwata Salsabila Ramadhani", rombel: "IX - Khaula" },
    { no: 120, name: "Rafif Hilmi", rombel: "IX - Zubair" },
    { no: 121, name: "Rafiq Assyauqie", rombel: "VII - Ibnu Abbas" },
    { no: 122, name: "RAYYAN FATHIR RAHMAN", rombel: "IX - Zubair" },
    { no: 123, name: "RAYYAN MAULANA", rombel: "VII - Ibnu Abbas" },
    { no: 124, name: "Rayyan Muhammad Ghofar", rombel: "IX - Zubair" },
    { no: 125, name: "Rayyan Rizkullah", rombel: "IX - Zubair" },
    { no: 126, name: "Razan Ibadil Kiram", rombel: "IX - Zubair" },
    { no: 127, name: "Rizky Ghalib", rombel: "IX - Zubair" },
    { no: 128, name: "Safa Nafeeza", rombel: "VIII - Sumayyah" },
    { no: 129, name: "Salwa Athaya", rombel: "VII - Asma" },
    { no: 130, name: "SAMIH GOZI NASUTION", rombel: "VII - Ibnu Abbas" },
    { no: 131, name: "Shafa Qatrunada", rombel: "IX - Khaula" },
    { no: 132, name: "Shakira Althafunnisa", rombel: "IX - Khaula" },
    { no: 133, name: "SHOFIE SALSABILA", rombel: "VII - Asma" },
    { no: 134, name: "Sitti Fatima Khairunnisa", rombel: "VIII - Sumayyah" },
    { no: 135, name: "Syamila Fatima Allathifa", rombel: "VIII - Sumayyah" },
    { no: 136, name: "SYIFA IZZATUNNISA", rombel: "VIII - Sumayyah" },
    { no: 137, name: "Syuja Al-Awhad Nasution", rombel: "VIII - Ubay" },
    { no: 138, name: "T. GHAIZAN AKHTAR", rombel: "VII - Ibnu Abbas" },
    { no: 139, name: "TEUKU ARIF FATHAN", rombel: "VIII - Ubay" },
    { no: 140, name: "Teuku Muhammad Arkan Kanza", rombel: "IX - Zubair" },
    { no: 141, name: "Teuku Rafi Aulia", rombel: "VIII - Ubay" },
    { no: 142, name: "THURFAH ULAYYA", rombel: "IX - Khaula" },
    { no: 143, name: "Umar Sabiq", rombel: "VII - Ibnu Abbas" },
    { no: 144, name: "ZAHWA SYAFIA NAIRA", rombel: "VII - Asma" },
    { no: 145, name: "Zalfa Afiqah Rahman", rombel: "VII - Asma" },
    { no: 146, name: "ZASKIA ASRA", rombel: "IX - Khaula" },
    { no: 147, name: "Zayan Al-Quwaisi", rombel: "VIII - Ubay" },
    { no: 148, name: "Ziyad Syathir Shah Zulwi", rombel: "VII - Ibnu Abbas" }
  ];

  return raw.map((rawItem): Student => {
    const kelas = rombelToClassMap[rawItem.rombel] || 'VII Ibnu Abbas (Laki-laki)';
    const gender = kelas.includes('Perempuan') ? 'Perempuan' : 'Laki-laki';
    
    // Deterministic style assignments to render a diverse classroom
    const idx = rawItem.no;
    const isTested = idx % 6 !== 0; // 1 in 6 is untested
    
    let visualScore = 0;
    let auditoryScore = 0;
    let kinestheticScore = 0;
    let dominantStyle: 'Visual' | 'Auditory' | 'Kinesthetic' | 'Seimbang' = 'Seimbang';

    if (isTested) {
      if (idx % 3 === 1) {
        visualScore = 10 + (idx % 4);
        auditoryScore = 4 + (idx % 3);
        kinestheticScore = 3 + (idx % 2);
        dominantStyle = 'Visual';
      } else if (idx % 3 === 2) {
        visualScore = 3 + (idx % 3);
        auditoryScore = 10 + (idx % 4);
        kinestheticScore = 4 + (idx % 2);
        dominantStyle = 'Auditory';
      } else {
        visualScore = 4 + (idx % 2);
        auditoryScore = 3 + (idx % 3);
        kinestheticScore = 11 + (idx % 4);
        dominantStyle = 'Kinesthetic';
      }
    }

    return {
      id: `S${rawItem.no.toString().padStart(3, '0')}`,
      name: rawItem.name,
      gender,
      visualScore,
      auditoryScore,
      kinestheticScore,
      dominantStyle,
      isTested,
      kelas
    };
  });
})();

export const VAK_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Ketika merakit sebuah perabot baru (misalnya lemari kecil), hal yang paling membantu Anda adalah...",
    options: [
      { text: "Melihat gambar diagram petunjuk visual di buku panduan.", type: "V" },
      { text: "Mendengarkan seseorang menjelaskan atau membimbing langkah demi langkah.", type: "A" },
      { text: "Langsung mencocokkan suku-suku perabot dan memasangnya secara praktis.", type: "K" }
    ]
  },
  {
    id: 2,
    text: "Ketika Anda harus mengingat suatu nomor telepon dari teman, Anda biasanya...",
    options: [
      { text: "Membayangkannya tertulis di atas kertas atau layar HP.", type: "V" },
      { text: "Mengucapkannya berulang-ulang dengan bersuara atau di dalam hati.", type: "A" },
      { text: "Mengetikkannya langsung dengan jari di keypad beberapa kali agar terbiasa.", type: "K" }
    ]
  },
  {
    id: 3,
    text: "Ketika membaca buku cerita atau novel, Anda paling menikmati bagian...",
    options: [
      { text: "Deskripsi pemandangan, latar suasana, dan detail fisik tokoh yang digambarkan dengan indah.", type: "V" },
      { text: "Dialog menarik, pergulatan verbal, dan ungkapan-ungkapan percakapan antartokoh.", type: "A" },
      { text: "Aksi mendebarkan, pertempuran, perjalanan fisik, dan ketegangan situasi.", type: "K" }
    ]
  },
  {
    id: 4,
    text: "Saat sedang belajar untuk ujian sekolah, Anda lebih suka metode...",
    options: [
      { text: "Membaca ringkasan berpewarna (stabilo), bagan alur, atau mind map.", type: "V" },
      { text: "Mendiskusikan materi pelajaran bersama kelompok belajar atau merekam penjelasan guru.", type: "A" },
      { text: "Menjelaskan materi sambil berjalan-jalan, menulis coretan di papan tulis, atau latihan soal.", type: "K" }
    ]
  },
  {
    id: 5,
    text: "Jika seseorang ingin mengajarkan suatu aplikasi baru di komputer, Anda ingin mereka...",
    options: [
      { text: "Menunjukkan cara kerjanya terlebih dahulu di layar komputer mereka (demonstrasi).", type: "V" },
      { text: "Menjelaskan fungsi menu-menu penting secara detail lewat instruksi suara.", type: "A" },
      { text: "Membiarkan Anda langsung memegang mouse, menekan tombol, dan mengeksplorasi sendiri.", type: "K" }
    ]
  },
  {
    id: 6,
    text: "Dalam waktu senggang, aktivitas rekreasi yang paling menarik minat Anda adalah...",
    options: [
      { text: "Menonton film bioskop, pameran seni, atau membaca majalah visual bergambar.", type: "V" },
      { text: "Mendengarkan album musik favorit, siaran radio, podcast, atau berbincang.", type: "A" },
      { text: "Berolahraga, berkebun, membuat kerajinan tangan, atau beraktivitas fisik di luar.", type: "K" }
    ]
  },
  {
    id: 7,
    text: "Ketika Anda merasa marah atau terganggu pada sesuatu, Anda cenderung...",
    options: [
      { text: "Mengekspresikannya lewat raut wajah masam atau menghindari kontak mata.", type: "V" },
      { text: "Mengeluarkan keluhan verbal secara spontan, berteriak, atau mengomel panjang.", type: "A" },
      { text: "Membanting barang, berjalan cepat meninggalkan ruangan, atau mengepalkan tangan.", type: "K" }
    ]
  },
  {
    id: 8,
    text: "Saat mencoba fokus mendengarkan presentasi presentator, apa yang paling mengalihkan perhatian Anda?",
    options: [
      { text: "Visual slide yang berantakan, terlalu banyak teks pusing, atau dekorasi mengkilap.", type: "V" },
      { text: "Suara bising dari luar jendela, bisikan rekan kerja, atau intonasi presenter yang monoton.", type: "A" },
      { text: "Suhu ruangan yang terlalu dingin/panas, kursi yang keras mendorong ingin bergerak.", type: "K" }
    ]
  },
  {
    id: 9,
    text: "Ketika Anda mengingat kenangan liburan masa lalu, hal pertama yang terlintas adalah...",
    options: [
      { text: "Pemandangan pantai, warna langit, indahnya panorama, atau foto-foto tempat itu.", type: "V" },
      { text: "Bunyi deburan ombak, musik pengiring di cafe lokal, tawa canda kerabat.", type: "A" },
      { text: "Sensasi kehangatan sinar matahari, pasir lembut di kaki, atau kesegaran berenang.", type: "K" }
    ]
  },
  {
    id: 10,
    text: "Cara terbaik yang Anda lakukan untuk mengeja kata asing yang cukup sulit adalah...",
    options: [
      { text: "Menuliskan kata tersebut untuk memeriksa apakah ejaannya terlihat benar secara visual.", type: "V" },
      { text: "Mengejanya perlahan dengan keras untuk menguji keselarasan bunyi yang tersengar.", type: "A" },
      { text: "Menuliskan kata tersebut menggunakan jari di udara agar otot menghafal ketukannya.", type: "K" }
    ]
  },
  {
    id: 11,
    text: "Ketika memilih pakaian di pusat perbelanjaan, pertimbangan utama Anda adalah...",
    options: [
      { text: "Model, kombinasi warna, dan keserasian penampilan saat dipakai bercermin.", type: "V" },
      { text: "Pendapat langsung dari pramuniaga atau saran verbal teman yang menyertai Anda.", type: "A" },
      { text: "Tekstur bahan yang lembut di kulit, kelenturan ruang gerak, dan tingkat kenyamanan fisik.", type: "K" }
    ]
  },
  {
    id: 12,
    text: "Ketika Anda berbicara dengan orang lain, Anda cenderung...",
    options: [
      { text: "Memperhatikan gerak tubuh, ekspresi wajah, dan menatap mata lawan bicara.", type: "V" },
      { text: "Fokus sepenuhnya pada kata-kata, nada suara, dan perubahan intonasi verbal.", type: "A" },
      { text: "Mengikuti pembicaraan sambil ikut banyak menggunakan isyarat tangan dan sentuhan bahu.", type: "K" }
    ]
  },
  {
    id: 13,
    text: "Saat guru mempresentasikan materi di kelas, apa yang membuat Anda cepat bosan?",
    options: [
      { text: "Guru yang terus menerus bicara tanpa menuliskan intisari materi di papan tulis atau slide.", type: "V" },
      { text: "Penjelasan yang terlalu sunyi tanpa ada interaksi diskusi, cerita, atau variasi suara.", type: "A" },
      { text: "Hanya diminta duduk tegang mencatat selama berjam-jam tanpa aktivitas kelompok sama sekali.", type: "K" }
    ]
  },
  {
    id: 14,
    text: "Jika Anda ingin mengajarkan sesuatu kepada anak kecil, Anda biasanya memilih untuk...",
    options: [
      { text: "Menggambar sketsa di kertas, menunjukkan buku cerita bergambar, atau video edukasi.", type: "V" },
      { text: "Bernyanyi secara interaktif, berdialog, mendongengkan dengan dinamika suara.", type: "A" },
      { text: "Memandu fisik anak itu, mengajaknya menirukan langsung, atau bermain simulasi aktif.", type: "K" }
    ]
  },
  {
    id: 15,
    text: "Bagaimana tanggapan Anda terhadap musik dalam sebuah video presentasi?",
    options: [
      { text: "Sangat menyenangkan jika musik diiringi klip video bergambar selaras estetik.", type: "V" },
      { text: "Sangat penting, karena volume musik yang pas membantu konsentrasi isi suara naratif.", type: "A" },
      { text: "Asyik bila musik tersebut memiliki ketukan (beat) konstan yang memacu ritme kerja fisik.", type: "K" }
    ]
  },
  {
    id: 16,
    text: "Ketika masuk ke ruangan baru yang ramai, hal pertama yang Anda sadari adalah...",
    options: [
      { text: "Betapa indahnya pencahayaan, dekorasi ruangan, serta susunan furnitur di sana.", type: "V" },
      { text: "Kerasnya obrolan, deru AC, nada musik latar belakang, atau suara ketawa santai.", type: "A" },
      { text: "Aliran sirkulasi udara di ruangan, rasa padatnya ruang, serta keempukan lantai kayu.", type: "K" }
    ]
  },
  {
    id: 17,
    text: "Dalam ujian lisan atau tanya jawab langsung dengan guru, Anda lebih mudah...",
    options: [
      { text: "Membayangkan lembar jawaban tertulis saat berusaha mencari ingatan kata.", type: "V" },
      { text: "Menjawab dengan lancar secara verbal karena terlatih menyusun kalimat secara lisan.", type: "A" },
      { text: "Mengekspresikan maksud presentasi Anda dengan gestur tubuh yang antusias.", type: "K" }
    ]
  },
  {
    id: 18,
    text: "Untuk mengisi liburan akhir pekan dengan mempelajari kerajinan kuliner, Anda ingin...",
    options: [
      { text: "Menonton video panduan memasak dari koki profesional di YouTube secara teliti.", type: "V" },
      { text: "Mendengarkan instruksi resep langkah-demi-langkah via panduan lisan ayah/ibu.", type: "A" },
      { text: "Ikut memotong bahan, menakar bumbu, dan memegang wajan panas langsung.", type: "K" }
    ]
  },
  {
    id: 19,
    text: "Saat berbelanja secara daring (online shopping), hal yang mendorong transaksi Anda adalah...",
    options: [
      { text: "Foto produk dari segala sudut, video unboxing yang terang, dan keserasian warna visual.", type: "V" },
      { text: "Ulasan suara review pengguna lain di deskripsi, atau saran lisan dari kenalan dekat.", type: "A" },
      { text: "Deskripsi material bahan detail, dimensi pas, dan garansi penukaran ukuran fisik.", type: "K" }
    ]
  },
  {
    id: 20,
    text: "Apabila Anda dipaksa menghafal pidato pendek di depan umum, teknik terbaik Anda adalah...",
    options: [
      { text: "Membaca teks berkali-kali dan menandai kata kunci penting dengan coretan spidol.", type: "V" },
      { text: "Mendeklarasikan baris-baris kalimat tersebut keras-keras berulang kali di kaca.", type: "A" },
      { text: "Mengulangi naskah sambil mondar-mandir santai di dalam kamar tidur.", type: "K" }
    ]
  }
];
