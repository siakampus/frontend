import { jsPDF } from "jspdf"

export interface BuktiPesertaData {
  nomorPendaftaran: string
  nama: string
  nik: string
  programStudi: string
  fakultas: string
  tanggalBayar: string
  jumlahBayar: string
  isVerified: boolean
}

export interface KartuUjianData {
  nomorPendaftaran: string
  nama: string
  tanggalLahir: string
  programStudi: string
  tanggalUjian: string
  waktuUjian: string
  lokasiUjian: string
  fotoUrl?: string
}

/**
 * Generate dan unduh PDF Bukti Peserta Pendaftaran secara native (Direct Vector PDF)
 */
export function generateBuktiPesertaPdf(data: BuktiPesertaData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let y = 20

  // 1. Header Universitas
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(24, 43, 73) // Primary Navy
  doc.text("UNIVERSITAS GLOBAL NUSANTARA", pageWidth / 2, y, { align: "center" })

  y += 6
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text("PANITIA PENERIMAAN MAHASISWA BARU (PMB)", pageWidth / 2, y, { align: "center" })

  y += 5
  doc.setFontSize(8)
  doc.text("Jl. Pendidikan No. 123, Yogyakarta | Website: pmb.ugn.ac.id | Email: admisi@ugn.ac.id", pageWidth / 2, y, { align: "center" })

  y += 4
  // Garis Pembatas Header (Kop Surat)
  doc.setDrawColor(24, 43, 73)
  doc.setLineWidth(0.8)
  doc.line(margin, y, pageWidth - margin, y)
  doc.setLineWidth(0.2)
  doc.line(margin, y + 1, pageWidth - margin, y + 1)

  y += 10
  // 2. Judul Dokumen
  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.setTextColor(15, 23, 42)
  doc.text("TANDA BUKTI PESERTA PENDAFTARAN", pageWidth / 2, y, { align: "center" })

  y += 5
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(71, 85, 105)
  doc.text("SELEKSI MANDIRI PROGRAM SARJANA TAHUN AKADEMIK 2025/2026", pageWidth / 2, y, { align: "center" })

  y += 10
  // 3. Status Box
  doc.setFillColor(240, 253, 244) // Light green
  doc.setDrawColor(34, 197, 94) // Green border
  doc.roundedRect(margin, y, pageWidth - margin * 2, 12, 2, 2, "FD")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(21, 128, 61)
  doc.text("STATUS: PEMBAYARAN PENDAFTARAN TERVERIFIKASI & SAH", margin + 6, y + 7.5)

  y += 20
  // 4. Data Peserta
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(24, 43, 73)
  doc.text("A. DATA PESERTA PENDAFTAR", margin, y)

  y += 4
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)

  y += 8
  const rowHeight = 7.5
  const labelX = margin + 4
  const colonX = margin + 55
  const valueX = margin + 60

  const items = [
    { label: "Nomor Pendaftaran", value: data.nomorPendaftaran, bold: true },
    { label: "Nama Lengkap", value: data.nama, bold: true },
    { label: "NIK (Nomor Induk Kependudukan)", value: data.nik },
    { label: "Program Studi Pilihan", value: data.programStudi },
    { label: "Fakultas", value: data.fakultas },
    { label: "Tanggal Pembayaran", value: data.tanggalBayar },
    { label: "Jumlah Biaya Pendaftaran", value: data.jumlahBayar },
  ]

  items.forEach((item, index) => {
    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252)
      doc.rect(margin, y - 5, pageWidth - margin * 2, rowHeight, "F")
    }

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9.5)
    doc.setTextColor(71, 85, 105)
    doc.text(item.label, labelX, y)
    doc.text(":", colonX, y)

    doc.setFont("helvetica", item.bold ? "bold" : "normal")
    doc.setTextColor(15, 23, 42)
    doc.text(item.value || "-", valueX, y)

    y += rowHeight
  })

  y += 8
  // 5. Ketentuan & Informasi Penting
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(24, 43, 73)
  doc.text("B. KETENTUAN & CATATAN PENTING", margin, y)

  y += 4
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)

  y += 6
  const rules = [
    "1. Dokumen ini adalah tanda bukti sah bahwa Anda telah terdaftar sebagai peserta seleksi PMB UGN.",
    "2. Harap simpan dokumen ini dalam format PDF atau cetak untuk arsip pribadi.",
    "3. Jadwal dan ruang sesi ujian CBT dapat dilihat pada portal pendaftaran atau pada Kartu Ujian resmi.",
    "4. Peserta wajib mencetak Kartu Tanda Peserta Ujian sebelum pelaksanaan ujian dimulai.",
    "5. Informasi resmi dan hasil pengumuman kelulusan hanya dipublikasikan melalui pmb.ugn.ac.id.",
  ]

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  doc.setTextColor(51, 65, 85)

  rules.forEach((rule) => {
    doc.text(rule, margin + 4, y)
    y += 5.5
  })

  y += 12
  // 6. Tanggal & Tanda Tangan Elektronik
  const tglCetak = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const signatureX = pageWidth - margin - 65
  doc.setFontSize(8.5)
  doc.setTextColor(71, 85, 105)
  doc.text(`Yogyakarta, ${tglCetak}`, signatureX, y)
  y += 4.5
  doc.text("Panitia PMB UGN 2025", signatureX, y)

  y += 16
  doc.setFont("helvetica", "bold")
  doc.setTextColor(24, 43, 73)
  doc.text("Seksi Penerimaan & Admisi", signatureX, y)

  // 7. Footer Barcode & Verifikasi
  const footerY = doc.internal.pageSize.getHeight() - 14
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3)

  doc.setFont("helvetica", "italic")
  doc.setFontSize(7.5)
  doc.setTextColor(148, 163, 184)
  doc.text(
    `Dokumen ini dicetak otomatis secara elektronik dari Sistem Informasi Akademik UGN pada ${new Date().toLocaleString("id-ID")}`,
    margin,
    footerY
  )
  doc.text("Halaman 1 dari 1", pageWidth - margin, footerY, { align: "right" })

  // Save/Download PDF
  doc.save(`Bukti_Pendaftaran_${data.nomorPendaftaran}.pdf`)
}

/**
 * Generate dan unduh PDF Kartu Ujian CBT secara native (Direct Vector PDF)
 */
export function generateKartuUjianPdf(data: KartuUjianData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let y = 20

  // 1. Header Universitas
  doc.setFont("helvetica", "bold")
  doc.setFontSize(15)
  doc.setTextColor(24, 43, 73)
  doc.text("UNIVERSITAS GLOBAL NUSANTARA", pageWidth / 2, y, { align: "center" })

  y += 5.5
  doc.setFontSize(9.5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 116, 139)
  doc.text("SELEKSI PENERIMAAN MAHASISWA BARU (PMB 2025/2026)", pageWidth / 2, y, { align: "center" })

  y += 4
  doc.setDrawColor(24, 43, 73)
  doc.setLineWidth(0.8)
  doc.line(margin, y, pageWidth - margin, y)
  doc.setLineWidth(0.2)
  doc.line(margin, y + 1, pageWidth - margin, y + 1)

  y += 9
  // 2. Judul Kartu
  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.setTextColor(15, 23, 42)
  doc.text("KARTU TANDA PESERTA UJIAN (CBT)", pageWidth / 2, y, { align: "center" })

  y += 8
  // Outer Border Kartu
  const cardStartY = y
  const cardHeight = 195
  doc.setDrawColor(24, 43, 73)
  doc.setLineWidth(0.5)
  doc.roundedRect(margin, cardStartY, pageWidth - margin * 2, cardHeight, 3, 3, "D")

  y += 8
  // 3. Section Data Peserta (dengan kotak foto di sebelah kanan)
  const photoBoxWidth = 30
  const photoBoxHeight = 40
  const photoX = pageWidth - margin - photoBoxWidth - 6
  const photoY = y

  // Kotak Pas Foto
  doc.setDrawColor(148, 163, 184)
  doc.setFillColor(248, 250, 252)
  doc.rect(photoX, photoY, photoBoxWidth, photoBoxHeight, "FD")
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text("PAS FOTO", photoX + photoBoxWidth / 2, photoY + photoBoxHeight / 2 - 2, { align: "center" })
  doc.text("3 x 4 cm", photoX + photoBoxWidth / 2, photoY + photoBoxHeight / 2 + 3, { align: "center" })

  // Teks Identitas di sebelah kiri foto
  const idLabelX = margin + 6
  const idColonX = margin + 46
  const idValueX = margin + 50
  const idRowHeight = 7

  const idRows = [
    { label: "Nomor Pendaftaran", value: data.nomorPendaftaran, bold: true },
    { label: "Nama Lengkap", value: data.nama, bold: true },
    { label: "Tanggal Lahir", value: data.tanggalLahir },
    { label: "Program Studi", value: data.programStudi, bold: true },
  ]

  idRows.forEach((row) => {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(71, 85, 105)
    doc.text(row.label, idLabelX, y)
    doc.text(":", idColonX, y)

    doc.setFont("helvetica", row.bold ? "bold" : "normal")
    doc.setTextColor(15, 23, 42)
    doc.text(row.value || "-", idValueX, y)

    y += idRowHeight
  })

  // Set Y to past the photo box
  y = Math.max(y, photoY + photoBoxHeight + 6)

  // Divider Line
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.line(margin + 4, y, pageWidth - margin - 4, y)

  y += 7
  // 4. Section Jadwal Sesi CBT
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10.5)
  doc.setTextColor(24, 43, 73)
  doc.text("JADWAL & LOKASI UJIAN BERBASIS KOMPUTER (CBT)", margin + 6, y)

  y += 4.5
  // Box Jadwal
  const scheduleBoxHeight = 24
  doc.setFillColor(241, 245, 249)
  doc.setDrawColor(203, 213, 225)
  doc.roundedRect(margin + 5, y, pageWidth - (margin + 5) * 2, scheduleBoxHeight, 2, 2, "FD")

  const col1X = margin + 10
  const col2X = margin + 70
  const col3X = margin + 125
  const schedRowY = y + 7

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.text("TANGGAL UJIAN", col1X, schedRowY)
  doc.text("SESI & WAKTU", col2X, schedRowY)
  doc.text("LOKASI / RUANG", col3X, schedRowY)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(15, 23, 42)
  doc.text(data.tanggalUjian || "Sabtu, 15 Januari 2026", col1X, schedRowY + 7)
  doc.text(data.waktuUjian || "Sesi 2 (10:00 - 12:00 WIB)", col2X, schedRowY + 7)
  doc.text(data.lokasiUjian || "Lab Komputer 301", col3X, schedRowY + 7)

  y += scheduleBoxHeight + 8

  // Divider Line
  doc.setDrawColor(226, 232, 240)
  doc.line(margin + 4, y, pageWidth - margin - 4, y)

  y += 7
  // 5. Tata Tertib Peserta
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(24, 43, 73)
  doc.text("TATA TERTIB PESERTA UJIAN", margin + 6, y)

  y += 5
  const examRules = [
    "1. Peserta wajib hadir di lokasi ujian selambat-lambatnya 30 menit sebelum ujian dimulai.",
    "2. Peserta wajib membawa Kartu Ujian ini dan identitas resmi (KTP / SIM / Kartu Pelajar).",
    "3. Peserta wajib mengenakan pakaian rapi dan sopan (bukan kaos oblong) serta bersepatu.",
    "4. Dilarang membawa handphone, smartwatch, kalkulator, buku, atau catatan ke ruang ujian.",
    "5. Keterlambatan lebih dari 15 menit setelah ujian dimulai berakibat pembatalan keikutsertaan ujian.",
    "6. Segala bentuk kecurangan akan langsung dikenakan sanksi diskualifikasi dari PMB UGN.",
  ]

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(51, 65, 85)

  examRules.forEach((rule) => {
    doc.text(rule, margin + 8, y)
    y += 4.8
  })

  y += 6
  // Kolom Tanda Tangan Peserta dan Pengawas
  const sigBoxY = y
  doc.setFontSize(8)
  doc.setTextColor(71, 85, 105)

  const sigCol1 = margin + 12
  const sigCol2 = pageWidth - margin - 55

  doc.text("Tanda Tangan Peserta,", sigCol1, sigBoxY)
  doc.text("Petugas / Pengawas Ujian,", sigCol2, sigBoxY)

  doc.line(sigCol1, sigBoxY + 16, sigCol1 + 40, sigBoxY + 16)
  doc.line(sigCol2, sigBoxY + 16, sigCol2 + 40, sigBoxY + 16)

  doc.setFont("helvetica", "italic")
  doc.setFontSize(7.5)
  doc.text(`(${data.nama})`, sigCol1, sigBoxY + 20)
  doc.text("(Nama & TTD Pengawas)", sigCol2, sigBoxY + 20)

  // 6. Footer luar kartu
  const footerY = doc.internal.pageSize.getHeight() - 10
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7.5)
  doc.setTextColor(148, 163, 184)
  doc.text(
    `Kartu Ujian PMB UGN 2025/2026 | Dicetak pada: ${new Date().toLocaleString("id-ID")}`,
    margin,
    footerY
  )

  // Save/Download PDF
  doc.save(`Kartu_Ujian_${data.nomorPendaftaran}.pdf`)
}
