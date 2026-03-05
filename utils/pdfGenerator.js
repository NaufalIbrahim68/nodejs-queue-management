const PDFDocument = require('pdfkit');

const W = 260;
const H = 380;
const MX = 24;

const C = {
    primary: '#1a73e8',
    dark: '#1e293b',
    muted: '#64748b',
    divider: '#e2e8f0',
    bg: '#f8fafc',
    white: '#ffffff',
};

function formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric',
    });
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString('id-ID', {
        hour: '2-digit', minute: '2-digit',
    }) + ' WIB';
}

function dashedLine(doc, x1, y, x2) {
    doc.save().strokeColor('#cbd5e1').lineWidth(0.5).undash();
    let x = x1;
    while (x < x2) {
        doc.moveTo(x, y).lineTo(Math.min(x + 5, x2), y).stroke();
        x += 9;
    }
    doc.restore();
}

const generateTicketPDF = (queue, res) => {
    const doc = new PDFDocument({ size: [W, H], margin: 0 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="tiket-${queue.queueNumber}.pdf"`);
    doc.pipe(res);

    
    doc.rect(0, 0, W, H).fillColor(C.bg).fill();

    doc.rect(0, 0, W, 4).fillColor(C.primary).fill();

    doc.fontSize(11).font('Helvetica-Bold').fillColor(C.dark)
        .text('SISTEM ANTRIAN TOKO', 0, 20, { align: 'center', width: W });

    doc.fontSize(7.5).font('Helvetica').fillColor(C.muted)
        .text('Bukti Nomor Antrian', 0, 35, { align: 'center', width: W });

    // ── Divider ───────────────────────────────────────────────────────
    doc.moveTo(MX, 52).lineTo(W - MX, 52).lineWidth(0.5).strokeColor(C.divider).stroke();

    // ── Queue number ──────────────────────────────────────────────────
    doc.fontSize(56).font('Helvetica-Bold').fillColor(C.primary)
        .text(queue.queueNumber, 0, 62, { align: 'center', width: W });

    doc.fontSize(7.5).font('Helvetica').fillColor(C.muted)
        .text('Nomor Antrian Anda', 0, 122, { align: 'center', width: W });

    const perfY = 144;
    doc.save().circle(0, perfY, 8).fillColor(C.bg).fill().restore();
    doc.save().circle(W, perfY, 8).fillColor(C.bg).fill().restore();
    dashedLine(doc, 12, perfY, W - 12);

    const rows = [
        { label: 'Tanggal', value: formatDate(queue.createdAt) },
        { label: 'Jam', value: formatTime(queue.createdAt) },
        { label: 'Status', value: queue.status === 'waiting' ? 'Menunggu' : 'Diproses' },
    ];

    let ry = perfY + 18;
    rows.forEach((row, i) => {
        doc.fontSize(7.5).font('Helvetica').fillColor(C.muted)
            .text(row.label, MX, ry);

        doc.fontSize(7.5).font('Helvetica-Bold').fillColor(C.dark)
            .text(row.value, MX, ry, { align: 'right', width: W - MX * 2 });

        ry += 24;

        if (i < rows.length - 1) {
            doc.moveTo(MX, ry - 6).lineTo(W - MX, ry - 6)
                .lineWidth(0.4).strokeColor(C.divider).stroke();
        }
    });

    const perf2Y = ry + 10;
    doc.save().circle(0, perf2Y, 8).fillColor(C.bg).fill().restore();
    doc.save().circle(W, perf2Y, 8).fillColor(C.bg).fill().restore();
    dashedLine(doc, 12, perf2Y, W - 12);

    doc.fontSize(7).font('Helvetica').fillColor(C.muted)
        .text(
            'Harap tetap berada di area tunggu.\nNomor yang tidak hadir saat dipanggil akan dilewati.',
            MX, perf2Y + 14,
            { width: W - MX * 2, align: 'center' }
        );

    doc.rect(0, H - 28, W, 28).fillColor(C.primary).fill();
    doc.fontSize(6.5).font('Helvetica').fillColor('#c3d9ff')
        .text(
            `Sistem Antrian  •  ${new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}`,
            0, H - 17, { align: 'center', width: W }
        );

    doc.end();
};

module.exports = { generateTicketPDF };
