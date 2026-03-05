const PDFDocument = require('pdfkit');

const generateTicketPDF = (queue, res) => {
    const doc = new PDFDocument({ size: [250, 380], margin: 30 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
        'Content-Disposition',
        `attachment; filename="ticket-${queue.queueNumber}.pdf"`
    );

    doc.pipe(res);

    doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('TOKO SISTEM ANTRIAN', { align: 'center' });

    doc.moveDown(0.3);
    doc.moveTo(30, doc.y).lineTo(220, doc.y).lineWidth(1).stroke();
    doc.moveDown(0.5);

    doc
        .fontSize(64)
        .font('Helvetica-Bold')
        .fillColor('#1a73e8')
        .text(queue.queueNumber, { align: 'center' });

    doc.moveDown(0.3);
    doc.fillColor('black').moveTo(30, doc.y).lineTo(220, doc.y).lineWidth(1).stroke();
    doc.moveDown(0.8);

    const tanggal = new Date(queue.createdAt).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    const statusLabel = queue.status === 'waiting' ? 'Waiting' : 'Processed';

    doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('black');

    const col1 = 30;
    const col2 = 110;
    const lineH = 18;

    [
        ['Nomor Antrian', queue.queueNumber],
        ['Tanggal', tanggal],
        ['Status', statusLabel],
    ].forEach(([label, value]) => {
        const y = doc.y;
        doc.text(label, col1, y, { continued: false, width: col2 - col1 - 4 });
        doc.text(`: ${value}`, col2, y);
        doc.moveDown(lineH / doc.currentLineHeight());
    });

    doc.moveDown(1);
    doc
        .fontSize(8)
        .fillColor('#777')
        .text('Harap tunggu hingga nomor Anda dipanggil.', { align: 'center' });

    doc.end();
};

module.exports = { generateTicketPDF };
