import React, { useState } from 'react';
import { Copy, Check, Database, FileCode, CheckCircle2, Info, Lock } from 'lucide-react';

export default function PhpMySqlExport() {
  const [activeTab, setActiveTab] = useState<'sql' | 'koneksi' | 'proses' | 'login' | 'auth' | 'm_kelas' | 'm_wali' | 'super_dash' | 'dashboard'>('sql');
  const [copied, setCopied] = useState(false);

  const sqlSchema = `-- ==========================================================
-- SKEMA DATABASE: smart_seating_vak (Edisi RBAC & CRUD Master)
-- Pembaruan: Multi-User (Super Admin & Wali Kelas)
-- Normalisasi Relational Database: Kelas & Akun Wali Kelas
-- ==========================================================

CREATE DATABASE IF NOT EXISTS smart_seating_vak;
USE smart_seating_vak;

-- 1. TABEL KELAS (Master Daftar Kelas di Sekolah)
CREATE TABLE IF NOT EXISTS kelas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_kelas VARCHAR(100) NOT NULL UNIQUE,
    jenis_kelamin ENUM('Laki-laki', 'Perempuan', 'Campuran') NOT NULL DEFAULT 'Campuran',
    num_rows INT NOT NULL DEFAULT 5, -- Default baris denah
    num_cols INT NOT NULL DEFAULT 6  -- Default saf denah
);

-- 2. TABEL USERS / WALI KELAS (Relasi One-to-One / One-to-Many terikat)
-- Menggunakan ON DELETE RESTRICT guna mencegah penghapusan kelas berstatus aktif yang dapat merusak data akun.
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Hasil password_hash BCRYPT
    role ENUM('super_admin', 'wali_kelas') NOT NULL DEFAULT 'wali_kelas',
    nama_wali VARCHAR(100) NOT NULL,
    kelas_id INT NULL UNIQUE, -- Wali kelas hanya memegang 1 kelas, Super Admin bernilai NULL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE RESTRICT
);

-- 3. TABEL SISWA (Pendaftaran instan terfokus rombongan kelas)
CREATE TABLE IF NOT EXISTS siswa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    gender ENUM('Laki-laki', 'Perempuan') NOT NULL,
    kelas_id INT NOT NULL, -- Hubungan Relasional ke Tabel Kelas
    visual_score INT DEFAULT 0,
    auditory_score INT DEFAULT 0,
    kinesthetic_score INT DEFAULT 0,
    dominant_style VARCHAR(20) DEFAULT 'Seimbang',
    is_tested TINYINT(1) DEFAULT 0, -- Status tes kuesioner
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_siswa_name_kelas_id (name, kelas_id), -- Mengunci penyerahan duplikat di tingkat mesin DB
    FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE
);

-- 4. TABEL SEATING_CHART (Multi-Kelas, grid baris & kolom adaptif)
CREATE TABLE IF NOT EXISTS seating_chart (
    kelas_id INT NOT NULL,
    row_num INT NOT NULL,
    col_num INT NOT NULL,
    student_id INT NULL,
    PRIMARY KEY (kelas_id, row_num, col_num),
    FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES siswa(id) ON DELETE SET NULL
);

-- INDEKS UNTUK OPTIMALISASI KINERJA Kueri JOIN & FILTER KELAS
CREATE INDEX idx_siswa_kelas_id ON siswa(kelas_id);
CREATE INDEX idx_seating_kelas_student ON seating_chart(kelas_id, student_id);

-- SEED DATA AWAL: DAFTAR KELAS BELAJAR
INSERT INTO kelas (id, nama_kelas, jenis_kelamin, num_rows, num_cols) VALUES
(1, 'VII Ibnu Abbas (Laki-laki)', 'Laki-laki', 5, 6),
(2, 'VII Asma (Perempuan)', 'Perempuan', 5, 6),
(3, 'VIII Ubay (Laki-laki)', 'Laki-laki', 5, 6),
(4, 'VIII Sumayyah (Perempuan)', 'Perempuan', 5, 6),
(5, 'IX Zubair (Laki-laki)', 'Laki-laki', 5, 6),
(6, 'IX Khaula (Perempuan)', 'Perempuan', 5, 6)
ON DUPLICATE KEY UPDATE nama_kelas=VALUES(nama_kelas);

-- SEED AKUN SUPER ADMIN (Username: khairul, Password: password123)
-- DAN AKUN WALI KELAS (Password: password123)
-- Password disandikan memadukan BCRYPT hasil password_hash("password123", PASSWORD_BCRYPT)
INSERT INTO users (username, password, role, nama_wali, kelas_id) VALUES
('khairul', '$2y$10$7Z2v7f4Sg8wFveZgU.G8gOxSSeRoxAco/8L4jveP/ApxE9.f2uASe', 'super_admin', 'M. Khairul A.', NULL),
('nofrizal', '$2y$10$7Z2v7f4Sg8wFveZgU.G8gOxSSeRoxAco/8L4jveP/ApxE9.f2uASe', 'wali_kelas', 'Nofrizal', 1),
('cutnisa', '$2y$10$7Z2v7f4Sg8wFveZgU.G8gOxSSeRoxAco/8L4jveP/ApxE9.f2uASe', 'wali_kelas', 'Cut Nisa', 2),
('riswanda', '$2y$10$7Z2v7f4Sg8wFveZgU.G8gOxSSeRoxAco/8L4jveP/ApxE9.f2uASe', 'wali_kelas', 'Riswanda', 3),
('aisyah', '$2y$10$7Z2v7f4Sg8wFveZgU.G8gOxSSeRoxAco/8L4jveP/ApxE9.f2uASe', 'wali_kelas', 'Aisyah', 4),
('mahmuddin', '$2y$10$7Z2v7f4Sg8wFveZgU.G8gOxSSeRoxAco/8L4jveP/ApxE9.f2uASe', 'wali_kelas', 'Mahmuddin', 5),
('saumiana', '$2y$10$7Z2v7f4Sg8wFveZgU.G8gOxSSeRoxAco/8L4jveP/ApxE9.f2uASe', 'wali_kelas', 'Saumiana', 6)
ON DUPLICATE KEY UPDATE username=VALUES(username);

-- SEED SEATING_CHART AWAL YANG KOSONG UNTUK KELAS 1 SAMPAI 6
-- Loop inisialisasi default baris & saf untuk data awal
-- Biasanya diproses pendaftaran oleh guru, namun dipersiapkan demi keutuhan skema
INSERT INTO seating_chart (kelas_id, row_num, col_num, student_id)
SELECT k.id, r, c, NULL
FROM kelas k
CROSS JOIN (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) r_num(r)
CROSS JOIN (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) c_num(c)
WHERE r_num.r <= k.num_rows AND c_num.c <= k.num_cols
ON DUPLICATE KEY UPDATE student_id=student_id;
`;

  const phpKoneksi = `<?php
/**
 * koneksi.php
 * Koneksi ke database MySQL menggunakan metode PDO (PHP Data Objects)
 * yang aman, anti SQL-injection secara global, dan andal untuk produksi.
 */

$host = 'localhost';
$db   = 'smart_seating_vak';
$user = 'root';
$pass = ''; // Masukkan password MySQL XAMPP/WAMP Anda
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\\PDOException $e) {
     die("Koneksi gagal: " . $e->getMessage());
}
?>`;

  const phpProses = `<?php
/**
 * proses.php
 * Memproses penyimpanan Kuesioner Gaya Belajar otomatis secara mandiri
 * tanpa harus login terlebih dahulu (Akses Blind Test Siswa).
 * Mencegah SQLi mutlak menggunakan Prepared Statement PDO.
 */

require_once 'koneksi.php';
header('Content-Type: application/json');

// Membaca payload request berformat JSON
$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($data['name'], $data['kelas'])) {
    
    // Sanitasi dan validasi field
    $name = htmlspecialchars(strip_tags(trim($data['name'])));
    $kelas = htmlspecialchars(strip_tags(trim($data['kelas'])));
    $gender = $data['gender'] === 'Perempuan' ? 'Perempuan' : 'Laki-laki';
    $answers = $data['answers'] ?? []; // Array dari jawaban ('V', 'A', 'K')
    
    if (!$name || !$kelas) {
        echo json_encode(['status' => 'error', 'message' => 'Lengkapi nama dan pilihan kelas Anda dengan valid!']);
        exit;
    }

    if (count($answers) < 20) {
        echo json_encode(['status' => 'error', 'message' => 'Silakan lengkapi semua (20) butir pertanyaan!']);
        exit;
    }

    // 1. Hitung skor Gaya Belajar VAK
    $visual_score = 0;
    $auditory_score = 0;
    $kinesthetic_score = 0;

    foreach ($answers as $ans) {
        if ($ans === 'V') $visual_score++;
        elseif ($ans === 'A') $auditory_score++;
        elseif ($ans === 'K') $kinesthetic_score++;
    }

    // Tentukan gaya belajar dominan
    $dominant_style = 'Seimbang';
    $max_score = max($visual_score, $auditory_score, $kinesthetic_score);
    if ($max_score > 0) {
        $ties = 0;
        if ($visual_score === $max_score) $ties++;
        if ($auditory_score === $max_score) $ties++;
        if ($kinesthetic_score === $max_score) $ties++;

        if ($ties === 1) {
            if ($visual_score === $max_score) $dominant_style = 'Visual';
            elseif ($auditory_score === $max_score) $dominant_style = 'Auditory';
            elseif ($kinesthetic_score === $max_score) $dominant_style = 'Kinesthetic';
        }
    }

    try {
        $pdo->beginTransaction();

        // 2. Periksa apakah siswa sudah terdaftar sebelumnya di kelas yang sama dengan kunci transaksi (FOR UPDATE)
        $stmt_check = $pdo->prepare("SELECT id FROM siswa WHERE name = ? AND kelas = ? FOR UPDATE");
        $stmt_check->execute([$name, $kelas]);
        $existing_id = $stmt_check->fetchColumn();

        if ($existing_id) {
            // Update data yang telah ada
            $stmt_update = $pdo->prepare("
                UPDATE siswa 
                SET gender = ?, visual_score = ?, auditory_score = ?, kinesthetic_score = ?, dominant_style = ?, is_tested = 1 
                WHERE id = ?
            ");
            $stmt_update->execute([$gender, $visual_score, $auditory_score, $kinesthetic_score, $dominant_style, $existing_id]);
            $student_db_id = $existing_id;
        } else {
            // Daftarkan siswa baru
            $stmt_insert = $pdo->prepare("
                INSERT INTO siswa (name, gender, kelas, visual_score, auditory_score, kinesthetic_score, dominant_style, is_tested) 
                VALUES (?, ?, ?, ?, ?, ?, ?, 1)
            ");
            $stmt_insert->execute([$name, $gender, $kelas, $visual_score, $auditory_score, $kinesthetic_score, $dominant_style]);
            $student_db_id = $pdo->lastInsertId();
        }

        // 3. Jalankan Algoritma Seating Symmetrical VAK secara otomatis untuk kelas terkait
        $stmt_all = $pdo->prepare("SELECT * FROM siswa WHERE kelas = ?");
        $stmt_all->execute([$kelas]);
        $all_students = $stmt_all->fetchAll();

        // Ambil konfigurasi layout dinamis per kelas
        $stmt_settings = $pdo->prepare("SELECT num_rows, num_cols FROM kelas_settings WHERE kelas = ?");
        $stmt_settings->execute([$kelas]);
        $settings = $stmt_settings->fetch();
        $num_rows = $settings ? (int)$settings['num_rows'] : 5;
        $num_cols = $settings ? (int)$settings['num_cols'] : 6;
        $capacity = $num_rows * $num_cols;

        // Kosongkan semua kursi sementara untuk kelas terkait
        $stmt_clear = $pdo->prepare("UPDATE seating_chart SET student_id = NULL WHERE kelas = ?");
        $stmt_clear->execute([$kelas]);

        // Pastikan tabel seating_chart terisi sesuai slot konfigurasi kelas ini
        $stmt_grid_count = $pdo->prepare("SELECT COUNT(*) FROM seating_chart WHERE kelas = ?");
        $stmt_grid_count->execute([$kelas]);
        if ($stmt_grid_count->fetchColumn() < $capacity) {
            // Bersihkan jika ada tersisa
            $stmt_del = $pdo->prepare("DELETE FROM seating_chart WHERE kelas = ?");
            $stmt_del->execute([$kelas]);
            
            $stmt_insert_seat = $pdo->prepare("INSERT INTO seating_chart (kelas, row_num, col_num) VALUES (?, ?, ?)");
            for ($r = 1; $r <= $num_rows; $r++) {
                for ($c = 1; $c <= $num_cols; $c++) {
                    $stmt_insert_seat->execute([$kelas, $r, $c]);
                }
            }
        }

        // Urutkan siswa dengan prioritas tinggi
        usort($all_students, function($a, $b) {
            if (!$a['is_tested']) return 1;
            if (!$b['is_tested']) return -1;
            
            $margin_a = max($a['visual_score'], $a['auditory_score'], $a['kinesthetic_score']) - min($a['visual_score'], $a['auditory_score'], $a['kinesthetic_score']);
            $margin_b = max($b['visual_score'], $b['auditory_score'], $b['kinesthetic_score']) - min($b['visual_score'], $b['auditory_score'], $b['kinesthetic_score']);
            return $margin_b - $margin_a; // Descending
        });

        // Alokasikan kursi ideal
        foreach ($all_students as $student) {
            $best_row = -1;
            $best_col = -1;
            $max_fit_score = -1;

            for ($r = 1; $r <= $num_rows; $r++) {
                for ($c = 1; $c <= $num_cols; $c++) {
                    // Cek ketersediaan kursi di kelas bersangkutan
                    $stmt_seat_check = $pdo->prepare("SELECT student_id FROM seating_chart WHERE kelas = ? AND row_num = ? AND col_num = ?");
                    $stmt_seat_check->execute([$kelas, $r, $c]);
                    $curr_occupant = $stmt_seat_check->fetchColumn();

                    if ($curr_occupant === false || $curr_occupant === null) {
                        $fit_score = 50;
                        $is_edge = ($c === 1 || $c === $num_cols);
                        $is_center = ($num_cols === 5) ? ($c === 3) : ($c === 3 || $c === 4);

                        if ($student['is_tested']) {
                            if ($student['dominant_style'] === 'Visual') {
                                $fit_score = ($num_rows + 1 - $r) * 15;
                                $fit_score += $is_center ? 15 : ($is_edge ? -10 : 5);
                            } elseif ($student['dominant_style'] === 'Auditory') {
                                if ($num_rows === 6) {
                                    if ($r === 3 || $r === 4) $fit_score = 90;
                                    elseif ($r === 2 || $r === 5) $fit_score = 75;
                                    else $fit_score = 50;
                                } else {
                                    if ($r === 3 || $r === 2) $fit_score = 85;
                                    elseif ($r === 4) $fit_score = 70;
                                    else $fit_score = 50;
                                }
                                $fit_score += $is_center ? 10 : 0;
                            } elseif ($student['dominant_style'] === 'Kinesthetic') {
                                $fit_score = $r * 15;
                                if ($is_edge) $fit_score += 25;
                            }
                        }

                        if ($fit_score > $max_fit_score) {
                            $max_fit_score = $fit_score;
                            $best_row = $r;
                            $best_col = $c;
                        }
                    }
                }
            }

            if ($best_row !== -1 && $best_col !== -1) {
                $stmt_occupy = $pdo->prepare("UPDATE seating_chart SET student_id = ? WHERE kelas = ? AND row_num = ? AND col_num = ?");
                $stmt_occupy->execute([$student['id'], $kelas, $best_row, $best_col]);
            }
        }

        $pdo->commit();
        echo json_encode([
            'status' => 'success',
            'message' => 'Terima kasih, kuesioner Anda berhasil disimpan!',
            'data' => [
                'dominant' => $dominant_style,
                'v' => $visual_score,
                'a' => $auditory_score,
                'k' => $kinesthetic_score
            ]
        ]);

    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => 'Gagal: ' . $e->getMessage()]);
    }

} else {
    echo json_encode(['status' => 'error', 'message' => 'Metode dilarang!']);
}
?>`;

  const phpLogin = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Sistem Smart Seating - Log Masuk Otentikasi Terenkripsi</title>
    <!-- Bootstrap 5 CDN (Light Blue Theme) -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background: radial-gradient(circle at top, #f0fdf4, #e0f2fe);
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #334155;
        }
        .login-card {
            border: 1px solid rgba(14, 165, 233, 0.15);
            border-radius: 1.5rem;
            box-shadow: 0 15px 40px rgba(14, 165, 233, 0.1);
            background-color: white;
        }
        .btn-primary {
            background-color: #0ea5e9;
            border-color: #0ea5e9;
        }
        .btn-primary:hover {
            background-color: #0284c7;
            border-color: #0284c7;
        }
        .form-control:focus {
            border-color: #0ea5e9;
            box-shadow: 0 0 0 0.25rem rgba(14, 165, 233, 0.25);
        }
    </style>
</head>
<body>

<div class="container" style="max-width: 440px;">
    <div class="card login-card p-4">
        <div class="card-body text-center">
            <div class="mb-3">
                <span class="fs-1">💎</span>
            </div>
            <h4 class="fw-extrabold text-slate-800">Smart Seating Chart</h4>
            <span class="badge bg-info text-white mb-4 px-2.5 py-1.5" style="font-size: 0.75rem;">Sistem Proteksi Multi-User (RBAC)</span>

            <?php
            session_start();
            if (isset($_SESSION['error_message'])) {
                echo '<div class="alert alert-danger py-2 text-start" style="font-size: 0.85rem;">⚠️ ' . htmlspecialchars($_SESSION['error_message']) . '</div>';
                unset($_SESSION['error_message']);
            }
            ?>

            <!-- Form Otentikasi POST ke auth.php -->
            <form action="auth.php" method="POST">
                <div class="form-floating mb-3 text-start">
                    <input type="text" name="username" class="form-control" id="uInput" placeholder="Username" required autocomplete="off">
                    <label for="uInput">Username Admin</label>
                </div>
                <div class="form-floating mb-4 text-start">
                    <input type="password" name="password" class="form-control" id="pInput" placeholder="Password" required>
                    <label for="pInput">Password</label>
                </div>
                
                <button type="submit" class="btn btn-primary w-100 py-2.5 rounded-3 fw-bold shadow-sm">
                    Masuk Ke Sistem ➔
                </button>
            </form>
            
            <div class="mt-4 p-3 bg-light rounded text-start" style="font-size: 0.75rem;">
                <span class="fw-bold d-block text-dark mb-1">Kredensial Pengujian:</span>
                <ul class="list-unstyled mb-0 text-muted col-12">
                    <li>🔑 <strong>Super Admin:</strong> <code>khairul</code> / <code>password123</code></li>
                    <li>🔑 <strong>Wali VII Abbas:</strong> <code>nofrizal</code> / <code>password123</code></li>
                    <li>🔑 <strong>Wali VII Asma:</strong> <code>cutnisa</code> / <code>password123</code></li>
                    <li>🔑 <strong>Wali VIII Ubay:</strong> <code>riswanda</code> / <code>password123</code></li>
                    <li>🔑 <strong>Wali VIII Sumay:</strong> <code>aisyah</code> / <code>password123</code></li>
                    <li>🔑 <strong>Wali IX Zubair:</strong> <code>mahmuddin</code> / <code>password123</code></li>
                    <li>🔑 <strong>Wali IX Khaula:</strong> <code>saumiana</code> / <code>password123</code></li>
                </ul>
            </div>
        </div>
    </div>
</div>

</body>
</html>`;

  const phpAuth = `<?php
/**
 * auth.php
 * Skenario otentikasi login multi-user (RBAC) aman.
 * Melakukan verifikasi hash password (password_verify) dan menyimpan data sesi role & kelas pendamping.
 */
session_start();
require_once 'koneksi.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        $_SESSION['error_message'] = 'Harap isi semua kolom formulir!';
        header('Location: login.php');
        exit;
    }

    try {
        // Amankan kueri dengan parametrik prepared statement
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            session_regenerate_id(true);
            $_SESSION['user_logged_in'] = true;
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['kelas'] = $user['kelas']; // NULL untuk super_admin, nama kelas untuk wali_kelas

            if ($user['role'] === 'super_admin') {
                header('Location: super_admin_dashboard.php');
            } else {
                header('Location: wali_kelas_dashboard.php');
            }
            exit;
        } else {
            $_SESSION['error_message'] = 'Username atau Password salah!';
            header('Location: login.php');
            exit;
        }
    } catch (Exception $e) {
        $_SESSION['error_message'] = 'Terjadi malafungsi sistem: ' . $e->getMessage();
        header('Location: login.php');
        exit;
    }
} else {
    header('Location: login.php');
    exit;
}
?>`;

  const phpDashboard = `<?php
/**
 * wali_kelas_dashboard.php
 * Halaman khusus untuk Wali Kelas (Admin Kecil) dengan pembatasan hak akses yang ketat.
 * 
 * Sesuai Kebijakan Keamanan RBAC:
 * 1. Hanya dapat mengakses dan melihat visualisasi denah kelas dampingannya sendiri.
 * 2. Dapat menukarkan posisi duduk siswa di kelas dampingannya secara manual (Kelola Kelas).
 * 3. DILARANG KERAS mengubah, mengedit, atau memanipulasi data skor dan persentase VAK asli milik siswa (Read-Only).
 */

session_start();
if (!isset($_SESSION['user_logged_in']) || $_SESSION['role'] !== 'wali_kelas') {
    header('Location: login.php');
    exit;
}

// Pencegahan Kekurangan Serangan CSRF (Cross-Site Request Forgery)
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Validasi Token Keamanan Token CSRF secara global untuk setiap permintaan POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
        http_response_code(403);
        die("Validasi token keamanan (CSRF) gagal! Permintaan ditolak demi keamanan data siber sekolah.");
    }
}

require_once 'koneksi.php';

$kelas_dampingan = $_SESSION['kelas']; // Diperoleh otomatis dari sesi login user
$message = '';
$message_type = 'success';

// Aksi AJAX Drag & Drop Swapping Engine (IDOR-safe & CSRF-valid)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'ajax_swap') {
    header('Content-Type: application/json');
    $row1 = filter_input(INPUT_POST, 'row1', FILTER_VALIDATE_INT);
    $col1 = filter_input(INPUT_POST, 'col1', FILTER_VALIDATE_INT);
    $row2 = filter_input(INPUT_POST, 'row2', FILTER_VALIDATE_INT);
    $col2 = filter_input(INPUT_POST, 'col2', FILTER_VALIDATE_INT);

    if ($row1 && $col1 && $row2 && $col2) {
        try {
            $pdo->beginTransaction();

            // IDOR Protection: Query current occupants strictly bound by the logged-in Wali Kelas session classroom
            $stmt1 = $pdo->prepare("SELECT student_id FROM seating_chart WHERE kelas = ? AND row_num = ? AND col_num = ? FOR UPDATE");
            $stmt1->execute([$kelas_dampingan, $row1, $col1]);
            $student1 = $stmt1->fetchColumn();

            $stmt2 = $pdo->prepare("SELECT student_id FROM seating_chart WHERE kelas = ? AND row_num = ? AND col_num = ? FOR UPDATE");
            $stmt2->execute([$kelas_dampingan, $row2, $col2]);
            $student2 = $stmt2->fetchColumn();

            // Swap them securely
            $stmt_upd1 = $pdo->prepare("UPDATE seating_chart SET student_id = ? WHERE kelas = ? AND row_num = ? AND col_num = ?");
            $stmt_upd1->execute([$student2, $kelas_dampingan, $row1, $col1]);

            $stmt_upd2 = $pdo->prepare("UPDATE seating_chart SET student_id = ? WHERE kelas = ? AND row_num = ? AND col_num = ?");
            $stmt_upd2->execute([$student1, $kelas_dampingan, $row2, $col2]);

            $pdo->commit();
            echo json_encode(['status' => 'success', 'message' => 'Posisi duduk disinkronisasi otomatis via Drag & Drop!']);
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Format koordinat tidak valid!']);
    }
    exit; // Stop HTML generation for AJAX responses
}

// Ambil konfigurasi layout dinamis per kelas
$stmt_settings = $pdo->prepare("SELECT num_rows, num_cols FROM kelas_settings WHERE kelas = ?");
$stmt_settings->execute([$kelas_dampingan]);
$settings = $stmt_settings->fetch();
$num_rows = $settings ? (int)$settings['num_rows'] : 5;
$num_cols = $settings ? (int)$settings['num_cols'] : 6;

// Aksi Override Tukar Posisi Kursi (Dibatasi hanya untuk kelas dampingan sendiri)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'swap') {
    $row1 = filter_input(INPUT_POST, 'row1', FILTER_VALIDATE_INT);
    $col1 = filter_input(INPUT_POST, 'col1', FILTER_VALIDATE_INT);
    $row2 = filter_input(INPUT_POST, 'row2', FILTER_VALIDATE_INT);
    $col2 = filter_input(INPUT_POST, 'col2', FILTER_VALIDATE_INT);

    if ($row1 && $col1 && $row2 && $col2) {
        try {
            $pdo->beginTransaction();

            // Ambil ID siswa di kursi pertama (Pastikan sesuai kelas dampingan)
            $stmt1 = $pdo->prepare("SELECT student_id FROM seating_chart WHERE kelas = ? AND row_num = ? AND col_num = ?");
            $stmt1->execute([$kelas_dampingan, $row1, $col1]);
            $student1 = $stmt1->fetchColumn();

            // Ambil ID siswa di kursi kedua (Pastikan sesuai kelas dampingan)
            $stmt2 = $pdo->prepare("SELECT student_id FROM seating_chart WHERE kelas = ? AND row_num = ? AND col_num = ?");
            $stmt2->execute([$kelas_dampingan, $row2, $col2]);
            $student2 = $stmt2->fetchColumn();

            // Lakukan swap update
            $update1 = $pdo->prepare("UPDATE seating_chart SET student_id = ? WHERE kelas = ? AND row_num = ? AND col_num = ?");
            $update1->execute([$student2, $kelas_dampingan, $row1, $col1]);

            $update2 = $pdo->prepare("UPDATE seating_chart SET student_id = ? WHERE kelas = ? AND row_num = ? AND col_num = ?");
            $update2->execute([$student1, $kelas_dampingan, $row2, $col2]);

            $pdo->commit();
            $message = "Sukses! Posisi kursi [Baris $row1, Kolom $col1] ditukar dengan [Baris $row2, Kolom $col2] untuk kelas $kelas_dampingan.";
        } catch (Exception $e) {
            $pdo->rollBack();
            $message = "Gagal memproses override kursi: " . $e->getMessage();
            $message_type = 'danger';
        }
    } else {
        $message = "Harap entri koordinat baris/kolom dengan lengkap!";
        $message_type = 'danger';
    }
}

// Aksi Mengubah Dimensi Kelas (Preservasi Manual & Penanganan Out-of-Bounds Tanpa Overlap)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'update_dimensions') {
    $new_rows = filter_input(INPUT_POST, 'rows', FILTER_VALIDATE_INT);
    $new_cols = filter_input(INPUT_POST, 'cols', FILTER_VALIDATE_INT);
    
    if (($new_rows === 5 && $new_cols === 6) || ($new_rows === 6 && $new_cols === 5)) {
        try {
            $pdo->beginTransaction();
            
            // 1. Dapatkan relokasi siswa pasca-sebelum rotasi denah kustom
            $stmt_current_seats = $pdo->prepare("SELECT row_num, col_num, student_id FROM seating_chart WHERE kelas = ? AND student_id IS NOT NULL");
            $stmt_current_seats->execute([$kelas_dampingan]);
            $current_allocated_seats = $stmt_current_seats->fetchAll();
            
            // 2. Simpan konfigurasi baru pada table kelas_settings
            $upd_set = $pdo->prepare("UPDATE kelas_settings SET num_rows = ?, num_cols = ? WHERE kelas = ?");
            $upd_set->execute([$new_rows, $new_cols, $kelas_dampingan]);
            
            // 3. Hapus sementara records seating_chart kelas ini untuk merekonstruksi grid
            $stmt_clear = $pdo->prepare("DELETE FROM seating_chart WHERE kelas = ?");
            $stmt_clear->execute([$kelas_dampingan]);

            // Re-inisialisasi semua koordinat baris & saf kosong di grid baru
            $stmt_insert_seat = $pdo->prepare("INSERT INTO seating_chart (kelas, row_num, col_num, student_id) VALUES (?, ?, ?, NULL)");
            for ($r = 1; $r <= $new_rows; $r++) {
                for ($c = 1; $c <= $new_cols; $c++) {
                    $stmt_insert_seat->execute([$kelas_dampingan, $r, $c]);
                }
            }

            // 4. Proses Algoritma Preservasi Koordinat
            // - Jika koordinat asal masih berada dalam batas grid baru, murid diletakkan kembali ke posisinya semula.
            // - Jika di luar batas grid baru, diletakkan di queue overflow untuk direlokasi ke kursi kosong yang tersisa.
            $out_of_bounds_students = [];
            foreach ($current_allocated_seats as $seat) {
                $r = (int)$seat['row_num'];
                $c = (int)$seat['col_num'];
                $sid = $seat['student_id'];
                
                if ($r <= $new_rows && $c <= $new_cols) {
                    $stmt_reoccupy = $pdo->prepare("UPDATE seating_chart SET student_id = ? WHERE kelas = ? AND row_num = ? AND col_num = ?");
                    $stmt_reoccupy->execute([$sid, $kelas_dampingan, $r, $c]);
                } else {
                    $out_of_bounds_students[] = $sid;
                }
            }

            // Alokasikan siswa yang terkena out-of-bounds ke kursi kosong mana pun secara acak aman
            if (!empty($out_of_bounds_students)) {
                $stmt_empty_seats = $pdo->prepare("SELECT row_num, col_num FROM seating_chart WHERE kelas = ? AND student_id IS NULL");
                $stmt_empty_seats->execute([$kelas_dampingan]);
                $empty_seats = $stmt_empty_seats->fetchAll();
                
                $seat_idx = 0;
                foreach ($out_of_bounds_students as $sid) {
                    if (isset($empty_seats[$seat_idx])) {
                        $empty_r = (int)$empty_seats[$seat_idx]['row_num'];
                        $empty_c = (int)$empty_seats[$seat_idx]['col_num'];
                        
                        $stmt_fill_empty = $pdo->prepare("UPDATE seating_chart SET student_id = ? WHERE kelas = ? AND row_num = ? AND col_num = ?");
                        $stmt_fill_empty->execute([$sid, $kelas_dampingan, $empty_r, $empty_c]);
                        $seat_idx++;
                    }
                }
            }

            $pdo->commit();
            
            // Perbarui PHP state variable agar view rendering pas
            $num_rows = $new_rows;
            $num_cols = $new_cols;
            
            $message = "Sukses mengubah rotasi formasi kelas dampingan menjadi $new_rows Baris x $new_cols Saf (30 Kursi). Posisi kustom guru dipertahankan secara utuh, dan posisi siswa di luar koordinat dipindahkan otomatis tanpa resiko data tumpah tindih!";
        } catch (Exception $e) {
            $pdo->rollBack();
            $message = "Gagal memproses perubahan formasi denah kelas: " . $e->getMessage();
            $message_type = 'danger';
        }
    }
}

// Mengambil data siswa HANYA untuk kelas dampingan
$stmt_stu = $pdo->prepare("SELECT * FROM siswa WHERE kelas = ? ORDER BY name ASC");
$stmt_stu->execute([$kelas_dampingan]);
$students = $stmt_stu->fetchAll();

// Mengambil struktur denah tempat duduk aktif HANYA untuk kelas dampingan
$stmt_seats = $pdo->prepare("
    SELECT s.row_num, s.col_num, s.student_id, m.name as student_name, m.dominant_style 
    FROM seating_chart s 
    LEFT JOIN siswa m ON s.student_id = m.id
    WHERE s.kelas = ?
    ORDER BY s.row_num ASC, s.col_num ASC
");
$stmt_seats->execute([$kelas_dampingan]);
$seats_raw = $stmt_seats->fetchAll();

// Mengelompokkan denah ke array 2 dimensi [row][col]
$classroom_grid = [];
for ($r = 1; $r <= $num_rows; $r++) {
    for ($c = 1; $c <= $num_cols; $c++) {
        $classroom_grid[$r][$c] = [
            'student_id' => null,
            'name' => 'Kosong',
            'style' => 'Seimbang'
        ];
    }
}

foreach ($seats_raw as $seat) {
    $classroom_grid[$seat['row_num']][$seat['col_num']] = [
        'student_id' => $seat['student_id'],
        'name' => $seat['student_name'] ?? 'Kosong',
        'style' => $seat['dominant_style'] ?? 'Seimbang'
    ];
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Dashboard Wali Kelas - Smart Seating</title>
    <!-- Bootstrap 5 Tema Biru Muda -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background-color: #f0f9ff; color: #1e293b; }
        .seat-card {
            border-radius: 0.75rem;
            border: 2px solid #e2e8f0;
            padding: 0.65rem;
            text-align: center;
            font-size: 0.75rem;
            min-height: 85px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            transition: all 0.2s;
        }
        .seat-visual { background-color: #e0f2fe; border-color: #38bdf8; color: #0369a1; }
        .seat-auditory { background-color: #ccfbf1; border-color: #2dd4bf; color: #0f766e; }
        .seat-kinesthetic { background-color: #f3e8ff; border-color: #c084fc; color: #6b21a8; }
        .seat-kosong { background-color: #f8fafc; color: #94a3b8; }
        .navbar-custom { background-color: #0284c7; }
    </style>
</head>
<body>

<nav class="navbar navbar-expand-lg navbar-dark navbar-custom shadow-sm">
    <div class="container">
        <a class="navbar-brand fw-bold" href="#">🏫 Smart Seating VAK - Wali Kelas</a>
        <span class="navbar-text text-white me-3">
            Wali Kelas: <strong><?php echo htmlspecialchars($_SESSION['username']); ?></strong> | Kelas: <span class="badge bg-white text-info"><?php echo htmlspecialchars($kelas_dampingan); ?></span>
        </span>
        <a href="logout.php" class="btn btn-sm btn-outline-light">Keluar Sesi</a>
    </div>
</nav>

<div class="container my-5">
    <!-- Keamanan Notifikasi -->
    <div class="alert alert-info py-3 d-flex align-items-center mb-4 border-0 rounded-3 shadow-xs">
        <span class="fs-4 me-2">🔒</span>
        <div>
            <strong>Mode Keamanan Wali Kelas Aktif:</strong> Anda hanya berwenang memantau & menukar posisi dapar kelas <strong><?php echo htmlspecialchars($kelas_dampingan); ?></strong>. Data skor inteligensi aseli VAK siswa terkunci total (Read-Only) demi menjamin objektivitas hasil angket.
        </div>
    </div>

    <?php if ($message): ?>
        <div class="alert alert-<?php echo $message_type; ?> alert-dismissible fade show" role="alert">
            <?php echo htmlspecialchars($message); ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <div class="row g-4">
        <!-- Grid Denah (Kiri) -->
        <div class="col-lg-8">
            <div class="card p-4 shadow-sm border-0 rounded-4 bg-white mb-4">
                <h5 class="fw-bold mb-4 text-primary">Denah Tata Letak Kursi (<?php echo $num_rows; ?>x<?php echo $num_cols; ?> Grid)</h5>
                
                <div class="p-2 bg-dark text-white text-center rounded-3 fw-bold mb-4" style="font-size: 0.8rem;">
                    🖥️ PAPAN TULIS & MEJA GURU (DEPAN)
                </div>

                <!-- Grid Kursi -->
                <?php for ($r = 1; $r <= $num_rows; $r++): ?>
                    <div class="row g-2 mb-2">
                        <?php for ($c = 1; $c <= $num_cols; $c++): 
                            $cell = $classroom_grid[$r][$c];
                            $class_theme = 'seat-kosong';
                            
                            if ($cell['student_id'] !== null) {
                                if ($cell['style'] === 'Visual') $class_theme = 'seat-visual';
                                elseif ($cell['style'] === 'Auditory') $class_theme = 'seat-auditory';
                                elseif ($cell['style'] === 'Kinesthetic') $class_theme = 'seat-kinesthetic';
                            }
                        ?>
                            <div class="col">
                                <div class="seat-card <?php echo $class_theme; ?>" 
                                     draggable="true" 
                                     ondragstart="drag(event, <?php echo $r; ?>, <?php echo $c; ?>)" 
                                     ondragover="allowDrop(event)" 
                                     ondrop="drop(event, <?php echo $r; ?>, <?php echo $c; ?>)"
                                     style="cursor: grab;">
                                    <div class="fw-bold mb-1" style="font-size: 0.6rem; opacity: 0.65;">
                                        B<?php echo $r; ?> K<?php echo $c; ?>
                                    </div>
                                    <div class="text-truncate fw-semibold">
                                        <?php echo htmlspecialchars($cell['name']); ?>
                                    </div>
                                    <?php if ($cell['student_id']): ?>
                                        <div class="badge rounded-pill bg-white mt-1 text-dark" style="font-size: 0.55rem;">
                                            <?php echo $cell['style']; ?>
                                        </div>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php endfor; ?>
                    </div>
                <?php endfor; ?>
            </div>
        </div>

        <!-- Kelola Kelas / Tukar Kursi (Kanan) -->
        <div class="col-lg-4">
            <!-- Form Mengubah Formasi Denah Fisik (5x6 <-> 6x5) -->
            <div class="card p-4 shadow-sm border-0 rounded-4 bg-white mb-4">
                <h5 class="fw-bold mb-3 text-info">Ubah Formasi Grid</h5>
                <p class="text-muted" style="font-size: 0.78rem;">Pilih kombinasi sebaran baris dan kolom yang disesuaikan dengan struktur kelas fisik (Kapasitas tetap 30):</p>
                <form action="" method="POST" class="d-inline">
                    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                    <input type="hidden" name="action" value="update_dimensions">
                    <input type="hidden" name="rows" value="5">
                    <input type="hidden" name="cols" value="6">
                    <button type="submit" class="btn btn-sm <?php echo $num_rows === 5 ? 'btn-primary' : 'btn-outline-secondary'; ?> w-100 py-2 mb-2 fw-semibold">
                        5 Baris x 6 Saf (30 Kursi)
                    </button>
                </form>
                <form action="" method="POST" class="d-inline">
                    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                    <input type="hidden" name="action" value="update_dimensions">
                    <input type="hidden" name="rows" value="6">
                    <input type="hidden" name="cols" value="5">
                    <button type="submit" class="btn btn-sm <?php echo $num_rows === 6 ? 'btn-primary' : 'btn-outline-secondary'; ?> w-100 py-2 fw-semibold">
                        6 Baris x 5 Saf (30 Kursi)
                    </button>
                </form>
            </div>

            <div class="card p-4 shadow-sm border-0 rounded-4 bg-white mb-4">
                <h5 class="fw-bold mb-3 text-secondary">Aksi Kelola Seat</h5>
                <p class="text-muted" style="font-size: 0.78rem;">Lakukan penukaran tempat duduk siswa secara visual jika ada situasi darurat kelas:</p>
                <form action="" method="POST">
                    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                    <input type="hidden" name="action" value="swap">
                    
                    <div class="row mb-3">
                        <div class="col-12"><small class="text-muted fw-bold">KURSI KESATU</small></div>
                        <div class="col-6">
                            <input type="number" name="row1" class="form-control" placeholder="Baris" min="1" max="<?php echo $num_rows; ?>" required>
                        </div>
                        <div class="col-6">
                            <input type="number" name="col1" class="form-control" placeholder="Kolom" min="1" max="<?php echo $num_cols; ?>" required>
                        </div>
                    </div>

                    <div class="row mb-4">
                        <div class="col-12"><small class="text-muted fw-bold">KURSI KEDUA</small></div>
                        <div class="col-6">
                            <input type="number" name="row2" class="form-control" placeholder="Baris" min="1" max="<?php echo $num_rows; ?>" required>
                        </div>
                        <div class="col-6">
                            <input type="number" name="col2" class="form-control" placeholder="Kolom" min="1" max="<?php echo $num_cols; ?>" required>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary w-100 fw-bold">
                        Proses Tukar Kursi ➔
                    </button>
                </form>
            </div>

            <!-- Daftar Siswa (VAK Read-only) -->
            <div class="card p-4 shadow-sm border-0 rounded-4 bg-white" style="max-height: 380px; overflow-y: auto;">
                <h5 class="fw-bold mb-3 text-secondary">Roster Murid & Dominasi VAK</h5>
                <div class="list-group list-group-flush">
                    <?php foreach ($students as $stu): ?>
                        <div class="list-group-item d-flex justify-content-between align-items-center py-2 px-0" style="font-size: 0.8rem;">
                            <div>
                                <?php echo htmlspecialchars($stu['name']); ?>
                            </div>
                            <span class="badge <?php 
                                if($stu['dominant_style'] == 'Visual') echo 'bg-primary';
                                elseif($stu['dominant_style'] == 'Auditory') echo 'bg-info';
                                elseif($stu['dominant_style'] == 'Kinesthetic') echo 'bg-warning text-dark';
                                else echo 'bg-secondary';
                            ?> p-1 px-2">
                                <?php echo $stu['dominant_style']; ?> (Terkunci)
                            </span>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// State management untuk Drag & Drop dan Token CSRF
const CSRF_TOKEN = "<?php echo $_SESSION['csrf_token']; ?>";

function allowDrop(ev) {
    ev.preventDefault();
    const card = ev.target.closest('.seat-card');
    if (card) {
        card.style.border = "2px dashed #0284c7";
        card.style.transform = "scale(1.02)";
    }
}

function drag(ev, row, col) {
    ev.dataTransfer.setData("row", row);
    ev.dataTransfer.setData("col", col);
    const card = ev.target.closest('.seat-card');
    if (card) {
        card.style.opacity = "0.4";
    }
}

document.addEventListener("dragover", function(ev) {
    ev.preventDefault();
});

document.addEventListener("dragleave", function(ev) {
    const card = ev.target.closest('.seat-card');
    if (card) {
        card.style.border = "";
        card.style.transform = "";
    }
});

document.addEventListener("dragend", function(ev) {
    const card = ev.target.closest('.seat-card');
    if (card) {
        card.style.opacity = "1";
    }
});

// Sync State AJAX dengan penanganan kegagalan jaringan (Internet Disconnection Resilience)
function drop(ev, targetRow, targetCol) {
    ev.preventDefault();
    const card = ev.target.closest('.seat-card');
    if (card) {
        card.style.border = "";
        card.style.transform = "";
    }
    
    const sourceRow = ev.dataTransfer.getData("row");
    const sourceCol = ev.dataTransfer.getData("col");
    
    if (!sourceRow || !sourceCol || (sourceRow == targetRow && sourceCol == targetCol)) return;

    // Buat banner status sinkronisasi mengambang
    showStatusAlert("Sedang menyinkronkan penataan denah Anda...", "info");

    const formData = new FormData();
    formData.append("action", "ajax_swap");
    formData.append("row1", sourceRow);
    formData.append("col1", sourceCol);
    formData.append("row2", targetRow);
    formData.append("col2", targetCol);
    formData.append("csrf_token", CSRF_TOKEN);

    // Jalankan AJAX secara tangguh dengan algoritma Retry Exponential Backoff
    sendAjaxWithRetry("", formData, 3, 1000);
}

function sendAjaxWithRetry(url, formData, retriesLeft, delay) {
    fetch(url, {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (!response.ok) throw new Error("Server Error HTTP " + response.status);
        return response.json();
    })
    .then(data => {
        if (data.status === "success") {
            showStatusAlert("✓ Posisi duduk berhasil disimpan secara aman di cloud database!", "success");
            // Reload halaman setelah jeda halus untuk merefleksikan perubahan visual penuh
            setTimeout(() => window.location.reload(), 1200);
        } else {
            showStatusAlert("Gagal ditukar: " + data.message, "danger");
        }
    })
    .catch(error => {
        console.warn("Koneksi gagal. Sisa percobaan: " + retriesLeft, error);
        
        if (retriesLeft > 0) {
            showStatusAlert("📡 Sambungan Wi-Fi kelas terputus! Pengiriman dihentikan sementara. Mencoba menyimpan ulang otomatis (Percobaan sisa: " + retriesLeft + ")...", "warning");
            setTimeout(function() {
                sendAjaxWithRetry(url, formData, retriesLeft - 1, delay * 1.5);
            }, delay);
        } else {
            showStatusAlert("❌ Gagal menyinkronkan denah tempat duduk ke database. Periksa sambungan router internet sekolah Anda!", "danger");
        }
    });
}

function showStatusAlert(message, type) {
    let alertContainer = document.getElementById("ajax-seating-alert-status");
    if (!alertContainer) {
        alertContainer = document.createElement("div");
        alertContainer.id = "ajax-seating-alert-status";
        alertContainer.style.position = "fixed";
        alertContainer.style.bottom = "24px";
        alertContainer.style.right = "24px";
        alertContainer.style.zIndex = "9999";
        alertContainer.style.minWidth = "320px";
        document.body.appendChild(alertContainer);
    }
    
    let emoji = "🔄";
    if (type === "success") emoji = "🚀";
    else if (type === "warning") emoji = "⚡";
    else if (type === "danger") emoji = "❌";

    alertContainer.innerHTML = 
        '<div class="alert alert-' + type + ' shadow border-0 fade show d-flex align-items-center mb-0 p-3" role="alert" style="border-radius: 0.75rem;">' +
            '<span class="fs-5 me-2">' + emoji + '</span>' +
            '<div style="font-size: 0.85rem; font-weight: 500;">' + message + '</div>' +
        '</div>';
}
</script>

</body>
</html>`;

  const phpManageKelas = `<?php
/**
 * manage_kelas.php
 * Endpoint fungsional CRUD Kelas khusus untuk Super Admin (Wali Kelas Level Atas).
 * Melakukan validasi hak akses, perlindungan Token CSRF, dan SQL Injection.
 */
session_start();
if (!isset($_SESSION['user_logged_in']) || $_SESSION['role'] !== 'super_admin') {
    http_response_code(403);
    die("Akses ditolak! Halaman ini rahasia dan hanya untuk Super Admin.");
}

// Token CSRF Validation
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
        $_SESSION['error'] = "Validasi keamanan CSRF gagal!";
        header("Location: super_admin_dashboard.php?tab=kelas");
        exit;
    }
}

require_once 'koneksi.php';

$action = $_POST['action'] ?? $_GET['action'] ?? '';

if ($action === 'create') {
    $nama_kelas = htmlspecialchars(strip_tags(trim($_POST['nama_kelas'] ?? '')));
    $jenis_kelamin = $_POST['jenis_kelamin'] ?? 'Campuran';
    $layout = $_POST['default_layout'] ?? '5x6';
    $num_rows = ($layout === '6x5') ? 6 : 5;
    $num_cols = ($layout === '6x5') ? 5 : 6;

    if (empty($nama_kelas)) {
        $_SESSION['error'] = "Nama kelas tidak boleh kosong!";
        header("Location: super_admin_dashboard.php?tab=kelas");
        exit;
    }

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("INSERT INTO kelas (nama_kelas, jenis_kelamin, num_rows, num_cols) VALUES (?, ?, ?, ?)");
        $stmt->execute([$nama_kelas, $jenis_kelamin, $num_rows, $num_cols]);
        $kelas_id = $pdo->lastInsertId();

        // Inisialisasi grid seating_chart kosong otomatis
        $stmt_seat = $pdo->prepare("INSERT INTO seating_chart (kelas_id, row_num, col_num, student_id) VALUES (?, ?, ?, NULL)");
        for ($r = 1; $r <= $num_rows; $r++) {
            for ($c = 1; $c <= $num_cols; $c++) {
                $stmt_seat->execute([$kelas_id, $r, $c]);
            }
        }

        $pdo->commit();
        $_SESSION['success'] = "Kelas baru [{$nama_kelas}] berhasil ditambahkan beserta formasi denah!";
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        $_SESSION['error'] = "Gagal membuat kelas baru: " . $e->getMessage();
    }
    header("Location: super_admin_dashboard.php?tab=kelas");
    exit;
}

if ($action === 'update') {
    $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
    $nama_kelas = htmlspecialchars(strip_tags(trim($_POST['nama_kelas'] ?? '')));
    $jenis_kelamin = $_POST['jenis_kelamin'] ?? 'Campuran';
    $layout = $_POST['default_layout'] ?? '5x6';
    $num_rows = ($layout === '6x5') ? 6 : 5;
    $num_cols = ($layout === '6x5') ? 5 : 6;

    if (!$id || empty($nama_kelas)) {
        $_SESSION['error'] = "Input data edit kelas tidak valid!";
        header("Location: super_admin_dashboard.php?tab=kelas");
        exit;
    }

    try {
        $pdo->beginTransaction();

        // Update detail kelas
        $stmt = $pdo->prepare("UPDATE kelas SET nama_kelas = ?, jenis_kelamin = ?, num_rows = ?, num_cols = ? WHERE id = ?");
        $stmt->execute([$nama_kelas, $jenis_kelamin, $num_rows, $num_cols, $id]);

        // Rekonstruksi ulang denah serta amankan pencatatan koordinat siswa
        $stmt_current_seats = $pdo->prepare("SELECT row_num, col_num, student_id FROM seating_chart WHERE kelas_id = ? AND student_id IS NOT NULL");
        $stmt_current_seats->execute([$id]);
        $current_allocated_seats = $stmt_current_seats->fetchAll();

        $stmt_clear = $pdo->prepare("DELETE FROM seating_chart WHERE kelas_id = ?");
        $stmt_clear->execute([$id]);

        $stmt_insert_seat = $pdo->prepare("INSERT INTO seating_chart (kelas_id, row_num, col_num, student_id) VALUES (?, ?, ?, NULL)");
        for ($r = 1; $r <= $num_rows; $r++) {
            for ($c = 1; $c <= $num_cols; $c++) {
                $stmt_insert_seat->execute([$id, $r, $c]);
            }
        }

        // Kembalikan siswa yang posisinya masih muat dalam grid baru
        $out_of_bounds_students = [];
        foreach ($current_allocated_seats as $seat) {
            $r = (int)$seat['row_num'];
            $c = (int)$seat['col_num'];
            $sid = $seat['student_id'];
            
            if ($r <= $num_rows && $c <= $num_cols) {
                $stmt_reoccupy = $pdo->prepare("UPDATE seating_chart SET student_id = ? WHERE kelas_id = ? AND row_num = ? AND col_num = ?");
                $stmt_reoccupy->execute([$sid, $id, $r, $c]);
            } else {
                $out_of_bounds_students[] = $sid;
            }
        }

        // Ambil sisa kursi kosong di grid baru jika ada siswa yang terlempar (out of bounds)
        if (!empty($out_of_bounds_students)) {
            $stmt_empty_seats = $pdo->prepare("SELECT row_num, col_num FROM seating_chart WHERE kelas_id = ? AND student_id IS NULL");
            $stmt_empty_seats->execute([$id]);
            $empty_seats = $stmt_empty_seats->fetchAll();
            
            $seat_idx = 0;
            foreach ($out_of_bounds_students as $sid) {
                if (isset($empty_seats[$seat_idx])) {
                    $empty_r = (int)$empty_seats[$seat_idx]['row_num'];
                    $empty_c = (int)$empty_seats[$seat_idx]['col_num'];
                    $stmt_fill_empty = $pdo->prepare("UPDATE seating_chart SET student_id = ? WHERE kelas_id = ? AND row_num = ? AND col_num = ?");
                    $stmt_fill_empty->execute([$sid, $id, $empty_r, $empty_c]);
                    $seat_idx++;
                }
            }
        }

        $pdo->commit();
        $_SESSION['success'] = "Informasi & Layout Kelas [{$nama_kelas}] berhasil diubah!";
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        $_SESSION['error'] = "Gagal memperbarui kelas: " . $e->getMessage();
    }
    header("Location: super_admin_dashboard.php?tab=kelas");
    exit;
}

if ($action === 'delete') {
    $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
    if (!$id) {
        $_SESSION['error'] = "ID Kelas tidak ditemukan!";
        header("Location: super_admin_dashboard.php?tab=kelas");
        exit;
    }

    try {
        // AMANKAN REFERENSI (RESTRICT CONSTRAINT POLICIES)
        // Cek jika kelas masih digunakan oleh Akun Wali Kelas (mencegah akun wali kelas yatim/orphan error)
        $stmt_check = $pdo->prepare("SELECT COUNT(*) FROM users WHERE kelas_id = ?");
        $stmt_check->execute([$id]);
        $has_wali = $stmt_check->fetchColumn();

        if ($has_wali > 0) {
            throw new Exception("Kelas masih digunakan oleh akun Wali Kelas aktif! Sesuai aturan restriksi basis data (RESTRICT), mohon ubah atau hapus akun Wali Kelas terkait terlebih dahulu.");
        }

        $pdo->beginTransaction();

        // Hapus denah seating chart (secara relasi terhapus otomatis CASCADE)
        $stmt_del_seats = $pdo->prepare("DELETE FROM seating_chart WHERE kelas_id = ?");
        $stmt_del_seats->execute([$id]);

        // Hapus kelas
        $stmt_del_kelas = $pdo->prepare("DELETE FROM kelas WHERE id = ?");
        $stmt_del_kelas->execute([$id]);

        $pdo->commit();
        $_SESSION['success'] = "Kelas berhasil dihapus secara permanen dari sistem!";
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        $_SESSION['error'] = "Dilarang Hapus Kelas: " . $e->getMessage();
    }
    header("Location: super_admin_dashboard.php?tab=kelas");
    exit;
}
?>`;

  const phpManageWali = `<?php
/**
 * manage_wali.php
 * Endpoint fungsional CRUD Wali Kelas (Admin Kecil) khusus untuk Super Admin.
 * Menggunakan enkripsi algoritma BCRYPT (password_hash) andal dan SQL Injection-safe.
 */
session_start();
if (!isset($_SESSION['user_logged_in']) || $_SESSION['role'] !== 'super_admin') {
    http_response_code(403);
    die("Akses ditolak! Endpoint khusus Super Admin.");
}

// Token CSRF Validation
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
        $_SESSION['error'] = "Validasi token CSRF gagal!";
        header("Location: super_admin_dashboard.php?tab=wali");
        exit;
    }
}

require_once 'koneksi.php';

$action = $_POST['action'] ?? $_GET['action'] ?? '';

if ($action === 'create') {
    $nama_wali = htmlspecialchars(strip_tags(trim($_POST['nama_wali'] ?? '')));
    $username = htmlspecialchars(strip_tags(trim($_POST['username'] ?? '')));
    $password_raw = $_POST['password'] ?? '';
    $kelas_id = filter_input(INPUT_POST, 'kelas_id', FILTER_VALIDATE_INT) ?: null;

    if (empty($nama_wali) || empty($username) || empty($password_raw)) {
        $_SESSION['error'] = "Semua kolom formulir wajib diisi!";
        header("Location: super_admin_dashboard.php?tab=wali");
        exit;
    }

    try {
        $pdo->beginTransaction();

        // Cek duplikasi username
        $stmt_user_check = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
        $stmt_user_check->execute([$username]);
        if ($stmt_user_check->fetchColumn() > 0) {
            throw new Exception("Username '{$username}' sudah terdaftar, silakan gunakan username lain!");
        }

        // Cek apakah kelas_id sudah diisi wali kelas lain (Aturan: 1 Wali memegang 1 kelas)
        if ($kelas_id !== null) {
            $stmt_kelas_check = $pdo->prepare("SELECT nama_wali FROM users WHERE kelas_id = ?");
            $stmt_kelas_check->execute([$kelas_id]);
            $existing_wali = $stmt_kelas_check->fetchColumn();
            if ($existing_wali) {
                throw new Exception("Kelas yang Anda pilih sudah terikat dengan Wali Kelas lain ({$existing_wali})!");
            }
        }

        // Enkripsi BCRYPT Aman
        $password_hashed = password_hash($password_raw, PASSWORD_BCRYPT);

        $stmt = $pdo->prepare("INSERT INTO users (username, password, role, nama_wali, kelas_id) VALUES (?, ?, 'wali_kelas', ?, ?)");
        $stmt->execute([$username, $password_hashed, $nama_wali, $kelas_id]);

        $pdo->commit();
        $_SESSION['success'] = "Akun login Wali Kelas [{$nama_wali}] berhasil dibuat!";
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        $_SESSION['error'] = "Gagal mendaftarkan Wali Kelas: " . $e->getMessage();
    }
    header("Location: super_admin_dashboard.php?tab=wali");
    exit;
}

if ($action === 'update') {
    $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
    $nama_wali = htmlspecialchars(strip_tags(trim($_POST['nama_wali'] ?? '')));
    $username = htmlspecialchars(strip_tags(trim($_POST['username'] ?? '')));
    $password_raw = $_POST['password'] ?? '';
    $kelas_id = filter_input(INPUT_POST, 'kelas_id', FILTER_VALIDATE_INT) ?: null;

    if (!$id || empty($nama_wali) || empty($username)) {
        $_SESSION['error'] = "Formulir edit Wali Kelas tidak valid!";
        header("Location: super_admin_dashboard.php?tab=wali");
        exit;
    }

    try {
        $pdo->beginTransaction();

        // Cek username unik pada record lain
        $stmt_user_check = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ? AND id != ?");
        $stmt_user_check->execute([$username, $id]);
        if ($stmt_user_check->fetchColumn() > 0) {
            throw new Exception("Username '{$username}' telah digunakan pengguna lain!");
        }

        // Cek pengikatan ganda kelas
        if ($kelas_id !== null) {
            $stmt_kelas_check = $pdo->prepare("SELECT nama_wali FROM users WHERE kelas_id = ? AND id != ?");
            $stmt_kelas_check->execute([$kelas_id, $id]);
            $existing_wali = $stmt_kelas_check->fetchColumn();
            if ($existing_wali) {
                throw new Exception("Kelas tersebut sudah dipegang oleh Wali Kelas [{$existing_wali}]!");
            }
        }

        if (!empty($password_raw)) {
            // Update beserta Password baru terenkripsi
            $password_hashed = password_hash($password_raw, PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("UPDATE users SET nama_wali = ?, username = ?, password = ?, kelas_id = ? WHERE id = ?");
            $stmt->execute([$nama_wali, $username, $password_hashed, $kelas_id, $id]);
        } else {
            // Update tanpa me-resandikan password lama
            $stmt = $pdo->prepare("UPDATE users SET nama_wali = ?, username = ?, kelas_id = ? WHERE id = ?");
            $stmt->execute([$nama_wali, $username, $kelas_id, $id]);
        }

        $pdo->commit();
        $_SESSION['success'] = "Data akun Wali Kelas [{$nama_wali}] berhasil diperbarui secara aman!";
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        $_SESSION['error'] = "Gagal memperbarui data wali kelas: " . $e->getMessage();
    }
    header("Location: super_admin_dashboard.php?tab=wali");
    exit;
}

if ($action === 'delete') {
    $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
    if (!$id) {
         $_SESSION['error'] = "ID Wali Kelas tidak valid!";
         header("Location: super_admin_dashboard.php?tab=wali");
         exit;
    }

    try {
        // Super Admin dilarang menghapus akunnya sendiri
        $stmt_check = $pdo->prepare("SELECT role FROM users WHERE id = ?");
        $stmt_check->execute([$id]);
        $user_role = $stmt_check->fetchColumn();
        
        if ($user_role === 'super_admin') {
            throw new Exception("Tindakan berbahaya! Dilarang menghapus akun Super Admin inti.");
        }

        $pdo->beginTransaction();
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);

        $pdo->commit();
        $_SESSION['success'] = "Akun login Wali Kelas berhasil dihapus dari sistem.";
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        $_SESSION['error'] = "Gagal menghapus akun: " . $e->getMessage();
    }
    header("Location: super_admin_dashboard.php?tab=wali");
    exit;
}
?>`;

  const phpSuperDashboard = `<?php
/**
 * super_admin_dashboard.php
 * Halaman Utama Control Panel Super Admin (M. Khairul A.)
 * Dilengkapi dengan DataTables CDN, Pop-up Form Modals Bootstrap 5, dan Desain Bertema Biru Muda Ringan.
 */
session_start();
if (!isset($_SESSION['user_logged_in']) || $_SESSION['role'] !== 'super_admin') {
    header('Location: login.php');
    exit;
}

// Token Keamanan CSRF
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

require_once 'koneksi.php';

// Ambil Statistik Ringkas
$tot_kelas = $pdo->query("SELECT COUNT(*) FROM kelas")->fetchColumn() ?: 0;
$tot_wali = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'wali_kelas'")->fetchColumn() ?: 0;
$tot_siswa = $pdo->query("SELECT COUNT(*) FROM siswa")->fetchColumn() ?: 0;

// Data Kelas
$stmt_kelas = $pdo->query("SELECT * FROM kelas ORDER BY nama_kelas ASC");
$daftar_kelas = $stmt_kelas->fetchAll();

// Data Wali Kelas beserta Relasi Kelas
$stmt_wali = $pdo->query("
    SELECT u.*, k.nama_kelas 
    FROM users u 
    LEFT JOIN kelas k ON u.kelas_id = k.id 
    WHERE u.role = 'wali_kelas' 
    ORDER BY u.nama_wali ASC
");
$daftar_wali = $stmt_wali->fetchAll();

$active_tab = $_GET['tab'] ?? 'kelas';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Super Admin Control Panel - Smart Seating Chart</title>
    <!-- Bootstrap 5 Light Blue Theme -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- DataTables Bootstrap 5 CSS -->
    <link href="https://cdn.datatables.net/1.13.5/css/dataTables.bootstrap5.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f0f9ff;
            color: #334155;
            font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .header-bg {
            background: linear-gradient(135deg, #0284c7, #38bdf8);
            border-bottom: 2px solid rgba(14, 165, 233, 0.1);
        }
        .bento-card {
            border: none;
            border-radius: 1rem;
            transition: all 0.3s ease;
        }
        .bento-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 30px rgba(14, 165, 233, 0.12) !important;
        }
        .nav-pills .nav-link {
            border-radius: 0.75rem;
            color: #0284c7;
            font-weight: 600;
        }
        .nav-pills .nav-link.active {
            background-color: #0284c7;
            color: #ffffff;
        }
        .table-card {
            border: none;
            border-radius: 1.25rem;
            box-shadow: 0 8px 24px rgba(14, 165, 233, 0.05);
        }
    </style>
</head>
<body>

<!-- Header Banner -->
<div class="header-bg text-white py-4 mb-5 shadow-sm">
    <div class="container d-flex justify-content-between align-items-center">
        <div>
            <span class="badge bg-white text-info text-uppercase fw-bold mb-1" style="letter-spacing: 1px;">🔐 Super Admin Area</span>
            <h1 class="h3 mb-0 fw-extrabold text-white">Smart Seating Chart Control Panel</h1>
            <p class="mb-0 text-white-50" style="font-size: 0.85rem;">Halo, <strong>M. Khairul A.</strong> - Server Database Terkendali Penuh</p>
        </div>
        <div>
            <a href="wali_kelas_dashboard.php" class="btn btn-outline-light btn-sm rounded-pill px-3 me-2">Wali Kelas View ➔</a>
            <a href="login.php?action=logout" class="btn btn-danger btn-sm rounded-pill px-3" onclick="return confirm('Keluar dari panel admin rahasia?')">Keluar</a>
        </div>
    </div>
</div>

<div class="container mb-5">
    
    <!-- Sesi Notifikasi / Flash Alert Dashboard -->
    <?php if (isset($_SESSION['success'])): ?>
        <div class="alert alert-success alert-dismissible fade show border-0 shadow-sm rounded-3 p-3 mb-4" role="alert">
            🚀 <strong>Berhasil:</strong> <?php echo $_SESSION['success']; ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        <?php unset($_SESSION['success']); ?>
    <?php endif; ?>

    <?php if (isset($_SESSION['error'])): ?>
        <div class="alert alert-danger alert-dismissible fade show border-0 shadow-sm rounded-3 p-3 mb-4" role="alert">
            ⚠️ <strong>Perhatian:</strong> <?php echo $_SESSION['error']; ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        <?php unset($_SESSION['error']); ?>
    <?php endif; ?>

    <!-- Bento Grid Ringkasan Siswa -->
    <div class="row g-4 mb-5">
        <div class="col-md-4">
            <div class="card bento-card shadow-sm p-4 text-center bg-white">
                <div class="fs-1 mb-2">🏫</div>
                <div class="text-muted text-uppercase fw-bold" style="font-size: 0.75rem; letter-spacing: 0.5px;">Master Kelas</div>
                <h2 class="fw-extrabold mb-0 text-dark"><?php echo $tot_kelas; ?> Kelas</h2>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card bento-card shadow-sm p-4 text-center bg-white">
                <div class="fs-1 mb-2">👤</div>
                <div class="text-muted text-uppercase fw-bold" style="font-size: 0.75rem; letter-spacing: 0.5px;">Wali Kelas Aktif</div>
                <h2 class="fw-extrabold mb-0 text-dark"><?php echo $tot_wali; ?> Guru</h2>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card bento-card shadow-sm p-4 text-center bg-white">
                <div class="fs-1 mb-2">📝</div>
                <div class="text-muted text-uppercase fw-bold" style="font-size: 0.75rem; letter-spacing: 0.5px;">Siswa Terdaftar</div>
                <h2 class="fw-extrabold mb-0 text-dark"><?php echo $tot_siswa; ?> Murid</h2>
            </div>
        </div>
    </div>

    <!-- Tab Navigasi Master CRUD -->
    <div class="card table-card bg-white p-4">
        <ul class="nav nav-pills gap-2 mb-4" id="crudTab" role="tablist">
            <li class="nav-item">
                <a class="nav-link <?php echo $active_tab === 'kelas' ? 'active' : ''; ?>" href="?tab=kelas">🗂️ Manajemen Nama Kelas</a>
            </li>
            <li class="nav-item">
                <a class="nav-link <?php echo $active_tab === 'wali' ? 'active' : ''; ?>" href="?tab=wali">🔑 Akun Login Wali Kelas</a>
            </li>
        </ul>

        <div class="tab-content" id="crudTabContent">
            
            <!-- TARJET TAB 1: MANAJEMEN KELAS -->
            <?php if ($active_tab === 'kelas'): ?>
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h5 class="fw-bold text-dark mb-0">Daftar Seluruh Kelas Sekolah</h5>
                    <button class="btn btn-primary rounded-pill px-4" data-bs-toggle="modal" data-bs-target="#modalTambahKelas">
                        + Tambah Kelas Baru
                    </button>
                </div>
                
                <div class="table-responsive">
                    <table class="table table-hover align-middle col-12" id="tabelKelas">
                        <thead class="table-light text-secondary">
                            <tr>
                                <th>ID Kelas</th>
                                <th>Nama Rombel Kelas</th>
                                <th>Jenis Kelamin</th>
                                <th>Ukuran Denah (Baris x Saf)</th>
                                <th class="text-center" style="width: 150px;">Aksi Kontrol</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($daftar_kelas as $kls): ?>
                            <tr>
                                <td class="fw-bold text-slate-400">#<?php echo $kls['id']; ?></td>
                                <td class="fw-bold text-dark"><?php echo htmlspecialchars($kls['nama_kelas']); ?></td>
                                <td>
                                    <?php if ($kls['jenis_kelamin'] === 'Laki-laki'): ?>
                                        <span class="badge bg-sky-100 text-sky-800 badge-gender">♂️ Laki-laki</span>
                                    <?php elseif ($kls['jenis_kelamin'] === 'Perempuan'): ?>
                                        <span class="badge bg-danger-subtle text-danger badge-gender">♀️ Perempuan</span>
                                    <?php else: ?>
                                        <span class="badge bg-warning-subtle text-warning-emphasis badge-gender">⚖️ Campuran</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <span class="badge bg-secondary"><?php echo $kls['num_rows']; ?> Baris x <?php echo $kls['num_cols']; ?> Saf</span>
                                    <span class="text-muted ms-1" style="font-size: 0.75rem;">(<?php echo $kls['num_rows'] * $kls['num_cols']; ?> Kursi)</span>
                                </td>
                                <td class="text-center">
                                    <div class="d-flex gap-1.5 justify-content-center">
                                        <button class="btn btn-outline-info btn-sm rounded-pill btn-edit-kelas px-3"
                                            data-id="<?php echo $kls['id']; ?>"
                                            data-nama="<?php echo htmlspecialchars($kls['nama_kelas']); ?>"
                                            data-gender="<?php echo $kls['jenis_kelamin']; ?>"
                                            data-rows="<?php echo $kls['num_rows']; ?>"
                                            data-cols="<?php echo $kls['num_cols']; ?>"
                                            data-bs-toggle="modal" data-bs-target="#modalEditKelas">
                                            Ubah
                                        </button>
                                        <form action="manage_kelas.php" method="POST" class="d-inline" onsubmit="return confirm('PERINGATAN SIS-DB: Menghapus kelas akan mencegah orphan data (RESTRICT). Klik OK jika Anda yakin.')">
                                            <input type="hidden" name="action" value="delete">
                                            <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                                            <input type="hidden" name="id" value="<?php echo $kls['id']; ?>">
                                            <button type="submit" class="btn btn-outline-danger btn-sm rounded-pill px-3">Hapus</button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>

            <!-- TARJET TAB 2: MANAJEMEN WALI KELAS -->
            <?php else: ?>
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h5 class="fw-bold text-dark mb-0">Manajemen Akun Login Wali Kelas (Admin Kecil)</h5>
                    <button class="btn btn-primary rounded-pill px-4" data-bs-toggle="modal" data-bs-target="#modalTambahWali">
                        + Tambah Wali Kelas
                    </button>
                </div>
                
                <div class="table-responsive">
                    <table class="table table-hover align-middle col-12" id="tabelWali">
                        <thead class="table-light text-secondary">
                            <tr>
                                <th>ID Admin</th>
                                <th>Nama Lengkap Wali Kelas</th>
                                <th>Username Akun</th>
                                <th>Kelas Dampingan</th>
                                <th class="text-center" style="width: 150px;">Aksi Kontrol</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($daftar_wali as $wali): ?>
                            <tr>
                                <td class="fw-bold text-slate-400">#<?php echo $wali['id']; ?></td>
                                <td class="fw-bold text-dark"><?php echo htmlspecialchars($wali['nama_wali']); ?></td>
                                <td><code class="bg-light px-2 py-1 rounded text-primary fs-6"><?php echo htmlspecialchars($wali['username']); ?></code></td>
                                <td>
                                    <?php if ($wali['kelas_id']): ?>
                                        <span class="badge bg-info text-white rounded-pill px-2.5 py-1.5"><?php echo htmlspecialchars($wali['nama_kelas']); ?></span>
                                    <?php else: ?>
                                        <span class="badge bg-light text-dark border rounded-pill px-2.5 py-1.5">Tidak Memegang Kelas</span>
                                    <?php endif; ?>
                                </td>
                                <td class="text-center">
                                    <div class="d-flex gap-1.5 justify-content-center">
                                        <button class="btn btn-outline-info btn-sm rounded-pill btn-edit-wali px-3"
                                            data-id="<?php echo $wali['id']; ?>"
                                            data-nama="<?php echo htmlspecialchars($wali['nama_wali']); ?>"
                                            data-username="<?php echo htmlspecialchars($wali['username']); ?>"
                                            data-kelas_id="<?php echo $wali['kelas_id'] ?: ''; ?>"
                                            data-bs-toggle="modal" data-bs-target="#modalEditWali">
                                            Ubah
                                        </button>
                                        <form action="manage_wali.php" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus permanen akses login wali kelas ini?')">
                                            <input type="hidden" name="action" value="delete">
                                            <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                                            <input type="hidden" name="id" value="<?php echo $wali['id']; ?>">
                                            <button type="submit" class="btn btn-outline-danger btn-sm rounded-pill px-3">Hapus</button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>

        </div>
    </div>
</div>

<!-- ==========================================
     MODALS MODUL FORMULA CRUD (BOOTSTRAP 5)
     ========================================== -->

<!-- Modals Tambah Kelas -->
<div class="modal fade" id="modalTambahKelas" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <form action="manage_kelas.php" method="POST" class="modal-content text-start border-0 shadow" style="border-radius: 1rem;">
            <input type="hidden" name="action" value="create">
            <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
            
            <div class="modal-header border-0 pb-0">
                <h5 class="fw-bold text-dark mt-2">Buat Kelas Baru</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body py-4">
                <div class="mb-3">
                    <label class="form-label text-secondary fw-semibold">Nama Kelas Rombongan</label>
                    <input type="text" name="nama_kelas" class="form-control p-2.5" placeholder="Contoh: IX Khaula (Perempuan)" required autocomplete="off">
                </div>
                <div class="mb-3">
                    <label class="form-label text-secondary fw-semibold">Spesifikasi Jenis Kelamin Kelas</label>
                    <select name="jenis_kelamin" class="form-select p-2.5">
                        <option value="Campuran">Campuran (Laki/Perempuan)</option>
                        <option value="Laki-laki">Khusus Laki-laki (Ikhwan)</option>
                        <option value="Perempuan">Khusus Perempuan (Akhwat)</option>
                    </select>
                </div>
                <div class="mb-0">
                    <label class="form-label text-secondary fw-semibold">Konfigurasi Denah Standard</label>
                    <select name="default_layout" class="form-select p-2.5">
                        <option value="5x6">5 Baris x 6 Kolom (30 Kursi)</option>
                        <option value="6x5">6 Baris x 5 Kolom (30 Kursi)</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer border-0 pt-0">
                <button type="button" class="btn btn-light rounded-pill px-3" data-bs-submit="modal">Batal</button>
                <button type="submit" class="btn btn-primary rounded-pill px-4">Simpan Kelas</button>
            </div>
        </form>
    </div>
</div>

<!-- Modals Edit Kelas -->
<div class="modal fade" id="modalEditKelas" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <form action="manage_kelas.php" method="POST" class="modal-content text-start border-0 shadow" style="border-radius: 1rem;">
            <input type="hidden" name="action" value="update">
            <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
            <input type="hidden" name="id" id="editKlsId">
            
            <div class="modal-header border-0 pb-0">
                <h5 class="fw-bold text-dark mt-2">Ubah Data Kelas</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body py-4">
                <div class="mb-3">
                    <label class="form-label text-secondary fw-semibold">Nama Kelas Rombongan</label>
                    <input type="text" name="nama_kelas" id="editKlsNama" class="form-control p-2.5" required autocomplete="off">
                </div>
                <div class="mb-3">
                    <label class="form-label text-secondary fw-semibold">Spesifikasi Jenis Kelamin</label>
                    <select name="jenis_kelamin" id="editKlsGender" class="form-select p-2.5">
                        <option value="Campuran">Campuran</option>
                        <option value="Laki-laki">Khusus Laki-laki</option>
                        <option value="Perempuan">Khusus Perempuan</option>
                    </select>
                </div>
                <div class="mb-0">
                    <label class="form-label text-secondary fw-semibold">Layout Formasi</label>
                    <select name="default_layout" id="editKlsLayout" class="form-select p-2.5">
                        <option value="5x6">5 Baris x 6 Kolom (30 Kursi)</option>
                        <option value="6x5">6 Baris x 5 Kolom (30 Kursi)</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer border-0 pt-0">
                <button type="button" class="btn btn-light rounded-pill px-3" data-bs-dismiss="modal">Batal</button>
                <button type="submit" class="btn btn-primary rounded-pill px-4">Update Kelas</button>
            </div>
        </form>
    </div>
</div>

<!-- Modals Tambah Wali Kelas -->
<div class="modal fade" id="modalTambahWali" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <form action="manage_wali.php" method="POST" class="modal-content text-start border-0 shadow" style="border-radius: 1rem;">
            <input type="hidden" name="action" value="create">
            <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
            
            <div class="modal-header border-0 pb-0">
                <h5 class="fw-bold text-dark mt-2">Daftarkan Akun Wali Kelas</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body py-4">
                <div class="mb-3">
                    <label class="form-label text-secondary fw-semibold">Nama Lengkap Wali Kelas</label>
                    <input type="text" name="nama_wali" class="form-control p-2.5" placeholder="Contoh: Nofrizal, S.Pd" required autocomplete="off">
                </div>
                <div class="mb-3">
                    <label class="form-label text-secondary fw-semibold">Username Login</label>
                    <input type="text" name="username" class="form-control p-2.5" placeholder="Contoh: nofrizal" required autocomplete="off">
                </div>
                <div class="mb-3">
                    <label class="form-label text-secondary fw-semibold">Password Akun (Akan dienkripsi)</label>
                    <input type="password" name="password" class="form-control p-2.5" placeholder="Sandi rahasia" required>
                </div>
                <div class="mb-0">
                    <label class="form-label text-secondary fw-semibold">Relasikan dengan Kelas Binaan</label>
                    <!-- Menampilkan Dropdown Dinamis dari tabel kelas -->
                    <select name="kelas_id" class="form-select p-2.5">
                        <option value="">-- Tanpa Kelas Dampingan (Internal) --</option>
                        <?php foreach ($daftar_kelas as $kls): ?>
                            <option value="<?php echo $kls['id']; ?>"><?php echo htmlspecialchars($kls['nama_kelas']); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>
            <div class="modal-footer border-0 pt-0">
                <button type="button" class="btn btn-light rounded-pill px-3" data-bs-dismiss="modal">Close</button>
                <button type="submit" class="btn btn-primary rounded-pill px-4">Simpan Akun</button>
            </div>
        </form>
    </div>
</div>

<!-- Modals Edit Wali Kelas -->
<div class="modal fade" id="modalEditWali" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <form action="manage_wali.php" method="POST" class="modal-content text-start border-0 shadow" style="border-radius: 1rem;">
            <input type="hidden" name="action" value="update">
            <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
            <input type="hidden" name="id" id="editWaliId">
            
            <div class="modal-header border-0 pb-0">
                <h5 class="fw-bold text-dark mt-2">Daftarkan Akun Wali Kelas</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body py-4">
                <div class="mb-3">
                    <label class="form-label text-secondary fw-semibold">Nama Lengkap Wali Kelas</label>
                    <input type="text" name="nama_wali" id="editWaliNama" class="form-control p-2.5" required autocomplete="off">
                </div>
                <div class="mb-3">
                    <label class="form-label text-secondary fw-semibold">Username Login</label>
                    <input type="text" name="username" id="editWaliUsername" class="form-control p-2.5" required autocomplete="off">
                </div>
                <div class="mb-3">
                    <label class="form-label text-secondary fw-semibold">Ganti Password (Kosongkan jika tidak diubah)</label>
                    <input type="password" name="password" class="form-control p-2.5" placeholder="Sandi baru (opsional)">
                </div>
                <div class="mb-0">
                    <label class="form-label text-secondary fw-semibold">Ubah Relasi Kelas Binaan</label>
                    <select name="kelas_id" id="editWaliKelasId" class="form-select p-2.5">
                        <option value="">-- Tanpa Kelas Dampingan (Internal) --</option>
                        <?php foreach ($daftar_kelas as $kls): ?>
                            <option value="<?php echo $kls['id']; ?>"><?php echo htmlspecialchars($kls['nama_kelas']); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>
            <div class="modal-footer border-0 pt-0">
                <button type="button" class="btn btn-light rounded-pill px-3" data-bs-dismiss="modal">Close</button>
                <button type="submit" class="btn btn-primary rounded-pill px-4">Simpan Akun</button>
            </div>
        </form>
    </div>
</div>

<!-- SCRIPTS CDN DAN PENYEMATAN LOGIKA MODAL DATA-ATTRIBUTES -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.datatables.net/1.13.5/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/1.13.5/js/dataTables.bootstrap5.min.js"></script>
<script>
    $(document).ready(function() {
        // Inisialisasi DataTables Indonesia instan
        if($('#tabelKelas').length) {
            $('#tabelKelas').DataTable({
                "language": { "search": "Cari Kelas:", "lengthMenu": "Tampilkan _MENU_ data per halaman" }
            });
        }
        if($('#tabelWali').length) {
            $('#tabelWali').DataTable({
                "language": { "search": "Cari Wali Kelas:", "lengthMenu": "Tampilkan _MENU_ data per halaman" }
            });
        }

        // Event trigger modal edit kelas
        $(document).on('click', '.btn-edit-kelas', function() {
            var id = $(this).attr('data-id');
            var nama = $(this).attr('data-nama');
            var gender = $(this).attr('data-gender');
            var rows = $(this).attr('data-rows');
            var cols = $(this).attr('data-cols');
            var layout = (rows == 6 && cols == 5) ? '6x5' : '5x6';

            $('#editKlsId').val(id);
            $('#editKlsNama').val(nama);
            $('#editKlsGender').val(gender);
            $('#editKlsLayout').val(layout);
        });

        // Event trigger modal edit wali kelas
        $(document).on('click', '.btn-edit-wali', function() {
            var id = $(this).attr('data-id');
            var nama = $(this).attr('data-nama');
            var username = $(this).attr('data-username');
            var kelas_id = $(this).attr('data-kelas_id');

            $('#editWaliId').val(id);
            $('#editWaliNama').val(nama);
            $('#editWaliUsername').val(username);
            $('#editWaliKelasId').val(kelas_id);
        });
    });
</script>
</body>
</html>`;

  const copyToClipboard = (text: string) => {

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCodeContent = () => {
    switch (activeTab) {
      case 'sql': return sqlSchema;
      case 'koneksi': return phpKoneksi;
      case 'proses': return phpProses;
      case 'login': return phpLogin;
      case 'auth': return phpAuth;
      case 'm_kelas': return phpManageKelas;
      case 'm_wali': return phpManageWali;
      case 'super_dash': return phpSuperDashboard;
      case 'dashboard': return phpDashboard;
    }
  };

  const getFileName = () => {
    switch (activeTab) {
      case 'sql': return 'skema_database.sql';
      case 'koneksi': return 'koneksi.php';
      case 'proses': return 'proses.php';
      case 'login': return 'login.php';
      case 'auth': return 'auth.php';
      case 'm_kelas': return 'manage_kelas.php';
      case 'm_wali': return 'manage_wali.php';
      case 'super_dash': return 'super_admin_dashboard.php';
      case 'dashboard': return 'wali_kelas_dashboard.php';
    }
  };

  const downloadFile = (text: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" id="php-mysql-export-section">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-sky-50 to-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-100 rounded-xl text-sky-600">
            <Database size={22} id="database-icon" />
          </div>
          <div>
            <h2 className="font-sans font-semibold text-lg text-slate-800" id="db-title-heading">
              Integrasi PHP & Database Control Panel
            </h2>
            <p className="text-xs text-slate-500 mt-0.5" id="db-desc-text">
              Salin dan pasang modul di bawah pada hosting web lokal (XAMPP/WAMP) untuk melepas versi full-stack online.
            </p>
          </div>
        </div>
      </div>

      {/* Info Warning */}
      <div className="p-4 mx-6 mt-6 bg-slate-50 rounded-xl border border-slate-100 flex gap-3 text-slate-600 text-xs" id="security-notes-container">
        <Info size={16} className="text-sky-500 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold text-slate-700">Audit Keamanan (SQLi & Brute Force Protection):</span> 
          {' '}Seluruh kode login menginstruksikan modul <strong>BCRYPT Password Hash</strong> dan <strong>PDO Prepared Statements</strong> demi menangkal eksploitasi peretasan. Form siswa tersamar secara objektif sehingga tidak merepresentasikan data denah kelas di sisi murid.
        </div>
      </div>

      {/* Selector Tabs - 9 Premium Tabs */}
      <div className="mx-6 mt-6 grid grid-cols-2 md:grid-cols-5 xl:grid-cols-9 gap-1 bg-slate-100 p-1 rounded-xl" id="code-tabs-selector">
        <button
          onClick={() => setActiveTab('sql')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'sql' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Database size={12} />
          Schema SQL
        </button>
        <button
          onClick={() => setActiveTab('koneksi')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'koneksi' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileCode size={12} />
          koneksi.php
        </button>
        <button
          onClick={() => setActiveTab('proses')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'proses' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileCode size={12} />
          proses.php
        </button>
        <button
          onClick={() => setActiveTab('login')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'login' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Lock size={12} />
          login.php
        </button>
        <button
          onClick={() => setActiveTab('auth')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'auth' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Lock size={12} />
          auth.php
        </button>
        <button
          onClick={() => setActiveTab('m_kelas')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'm_kelas' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileCode size={12} />
          manage_kelas.php
        </button>
        <button
          onClick={() => setActiveTab('m_wali')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'm_wali' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileCode size={12} />
          manage_wali.php
        </button>
        <button
          onClick={() => setActiveTab('super_dash')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'super_dash' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Database size={12} />
          super_admin_dashboard.php
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'dashboard' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Database size={12} />
          wali_kelas_dashboard.php
        </button>
      </div>

      {/* Code Viewer */}
      <div className="p-6">
        <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-900" id="code-block-viewer">
          {/* Code Header Bar */}
          <div className="flex justify-between items-center px-4 py-2 bg-slate-800 text-slate-400 border-b border-slate-700">
            <span className="text-xs font-mono select-none text-slate-300" id="code-active-filename">
              {getFileName()}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(getCodeContent())}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded transition-all active:scale-95"
                title="Salin Kode ke Clipboard"
                id="btn-copy-code"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Salin</span>
                  </>
                )}
              </button>
              <button
                onClick={() => downloadFile(getCodeContent(), getFileName())}
                className="flex items-center gap-1.5 px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white text-xs rounded transition-all active:scale-95"
                title="Unduh File Langsung"
                id="btn-download-file"
              >
                Unduh
              </button>
            </div>
          </div>

          {/* Actual Code Block */}
          <div className="p-4 overflow-x-auto max-h-[480px] font-mono text-xs leading-relaxed text-slate-300 antialiased font-medium select-text" id="code-pretext-wrapper">
            <pre className="whitespace-pre">{getCodeContent()}</pre>
          </div>
        </div>

        {/* Integration Instructions */}
        <div className="mt-6 bg-sky-50/50 p-5 rounded-xl border border-sky-100/60" id="deployment-instructions">
          <h4 className="font-sans font-semibold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={16} className="text-sky-500 animate-pulse" />
            Langkah Pemasangan (Local Server XAMPP):
          </h4>
          <ol className="list-decimal list-inside text-xs text-slate-600 space-y-2 leading-relaxed" id="steps-list">
            <li>Buka <strong>phpMyAdmin</strong> Anda dan impor isi berkas <code className="bg-sky-100/80 px-1 py-0.5 rounded text-sky-800 font-mono">skema_database.sql</code>.</li>
            <li>Salin file <code className="bg-sky-100/80 px-1 py-0.5 rounded text-sky-800 font-mono">koneksi.php</code>, <code className="bg-sky-100/80 px-1 py-0.5 rounded text-sky-800 font-mono">proses.php</code>, <code className="bg-sky-100/80 px-1 py-0.5 rounded text-sky-800 font-mono">login.php</code>, <code className="bg-sky-100/80 px-1 py-0.5 rounded text-sky-800 font-mono">auth.php</code>, <code className="bg-sky-100/80 px-1 py-0.5 rounded text-sky-800 font-mono">manage_kelas.php</code>, <code className="bg-sky-100/80 px-1 py-0.5 rounded text-sky-800 font-mono">manage_wali.php</code>, <code className="bg-sky-100/80 px-1 py-0.5 rounded text-sky-800 font-mono">super_admin_dashboard.php</code>, dan <code className="bg-sky-100/80 px-1 py-0.5 rounded text-sky-800 font-mono">wali_kelas_dashboard.php</code> ke folder <code className="bg-sky-100/80 px-1 py-0.5 rounded text-sky-800 font-mono">htdocs</code> di komputer server Anda.</li>
            <li>Murid dapat secara langsung mengakses pengisian blind test (Kuesioner Gaya Belajar) tanpa login. Data kuesioner otomatis disimpan di server dan diurutkan secara cerdas.</li>
            <li>Mengakses Akun Kontrol:
              <ul className="list-disc list-inside ms-5 mt-1 space-y-1">
                <li><strong>Super Admin (M. Khairul A.):</strong> Buka <code className="bg-sky-100/80 px-1 py-0.5 rounded text-sky-800 font-mono">login.php</code>, gunakan username <code className="bg-sky-100/80 px-1 py-0.5 rounded text-sky-800 font-mono">admin_super</code> dan password <code className="bg-sky-100/80 px-1 py-0.5 rounded text-sky-800 font-mono">super123</code> untuk mengontrol data master kelas & guru.</li>
                <li><strong>Wali Kelas Binaan:</strong> Gunakan akun wali kelas binaan (misal: username <code className="bg-sky-100/80 px-1 py-0.5 rounded text-sky-800 font-mono">ibnu_abbas</code> / sandi <code className="bg-sky-100/80 px-1 py-0.5 rounded text-sky-800 font-mono">wali123</code>) untuk monitoring dan drag & drop tempat duduk murid.</li>
              </ul>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
