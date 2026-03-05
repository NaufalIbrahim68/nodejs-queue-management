function formatDate(date) {
    return new Date(date).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

async function fetchAndDisplayLatest(elementId) {
    try {
        const res = await fetch('/api/queue/latest');
        const data = await res.json();
        const el = document.getElementById(elementId);
        if (el) el.textContent = data.data?.queueNumber || '—';
    } catch (_) { }
}

function triggerPdfDownload(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function initCustomerPage(socket) {
    socket.on('queue_created', () => fetchAndDisplayLatest('latest-number'));
    fetchAndDisplayLatest('latest-number');
}

async function takeQueue() {
    const btn = document.getElementById('take-btn');
    btn.disabled = true;
    btn.textContent = 'Memproses...';

    try {
        const res = await fetch('/api/queue', { method: 'POST' });
        const data = await res.json();

        if (data.success) {
            const q = data.data;

            document.getElementById('my-queue-num').textContent = q.queueNumber;
            document.getElementById('my-queue-time').textContent =
                'Dibuat: ' + new Date(q.createdAt).toLocaleString('id-ID');
            document.getElementById('result').style.display = 'block';

            fetchAndDisplayLatest('latest-number');

            triggerPdfDownload(
                `/api/queue/${q._id}/ticket`,
                `tiket-${q.queueNumber}.pdf`
            );
        } else {
            alert('Gagal mengambil antrian: ' + data.message);
        }
    } catch (e) {
        alert('Terjadi kesalahan: ' + e.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Masuk Antrian';
    }
}

function initAdminPage(socket) {
    checkDbStatus();
    loadQueues();

    socket.on('queue_created', loadQueues);
    socket.on('queue_updated', loadQueues);

    setInterval(loadQueues, 15000);
}

async function checkDbStatus() {
    try {
        const res = await fetch('/api/status');
        const data = await res.json();
        if (data.database === 'disconnected') {
            const banner = document.getElementById('db-banner');
            if (banner) banner.style.display = 'block';
        }
    } catch (_) { }
}

async function loadQueues() {
    try {
        const res = await fetch('/api/queue');
        const data = await res.json();
        if (data.success) renderTable(data.data);
    } catch (e) {
        console.error(e);
    }
}

function renderTable(queues) {
    const waiting = queues.filter(q => q.status === 'waiting');
    const processed = queues.filter(q => q.status === 'processed');

    document.getElementById('stat-total').textContent = queues.length;
    document.getElementById('stat-waiting').textContent = waiting.length;
    document.getElementById('stat-done').textContent = processed.length;

    const tbody = document.getElementById('queue-tbody');

    if (queues.length === 0) {
        tbody.innerHTML =
            '<tr class="empty-row"><td colspan="4">Belum ada antrian hari ini 🎉</td></tr>';
        return;
    }

    tbody.innerHTML = queues.map(q => `
        <tr class="${q.status === 'processed' ? 'processed' : ''}" id="row-${q._id}">
            <td><span class="queue-num">${q.queueNumber}</span></td>
            <td>
                <span class="badge ${q.status === 'waiting' ? 'badge-waiting' : 'badge-processed'}">
                    ${q.status === 'waiting' ? 'Waiting' : 'Processed'}
                </span>
            </td>
            <td><span class="timestamp">${formatDate(q.createdAt)}</span></td>
            <td>
                ${q.status === 'waiting'
            ? `<button class="btn-process" onclick="processQueue('${q._id}', this)">Telah Diproses</button>`
            : '—'}
            </td>
        </tr>
    `).join('');
}

async function processQueue(id, btn) {
    btn.disabled = true;
    btn.textContent = 'Memproses...';

    try {
        const res = await fetch(`/api/queue/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'processed' }),
        });
        if (res.ok) {
            await loadQueues();
        } else {
            btn.disabled = false;
            btn.textContent = 'Telah Diproses';
        }
    } catch (e) {
        alert('Gagal memproses: ' + e.message);
        btn.disabled = false;
        btn.textContent = 'Telah Diproses';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    if (document.getElementById('take-btn')) {
        initCustomerPage(socket);
    } else if (document.getElementById('queue-tbody')) {
        initAdminPage(socket);
    }
});
