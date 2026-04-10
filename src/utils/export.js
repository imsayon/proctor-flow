// src/utils/export.js

/**
 * Download a string as a file
 */
function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export allocation results as CSV
 */
export function exportCSV(allocations, sessions, rooms) {
  const header = ['#', 'Date', 'Slot', 'Start Time', 'End Time', 'Subject', 'Room', 'Building', 'Invigilator 1', 'Invigilator 2', 'Students', 'Status'];

  const rows = allocations.map((a, idx) => {
    const session = sessions.find(s => s.id === a.sessionId);
    const room = rooms.find(r => r.id === session?.roomId);
    const dateStr = session ? new Date(session.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    return [
      String(idx + 1),
      dateStr,
      session?.slot || '—',
      session?.startTime || '—',
      session?.endTime || '—',
      session?.subject || '—',
      room?.name || session?.roomId || '—',
      room?.building || '—',
      a.f1Name || 'Unassigned',
      a.f2Name || 'Unassigned',
      String(a.studentCount || 0),
      a.status === 'assigned' ? 'Assigned' : 'Unassigned',
    ];
  });

  const csvContent = [header, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');

  const timestamp = new Date().toISOString().slice(0, 10);
  triggerDownload(csvContent, `ProctorFlow_Allocation_${timestamp}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Export allocation results as a printable PDF (opens print dialog)
 */
export function exportPDF(allocations, sessions, rooms) {
  const timestamp = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  const rowsHtml = allocations.map((a, idx) => {
    const session = sessions.find(s => s.id === a.sessionId);
    const room = rooms.find(r => r.id === session?.roomId);
    const dateStr = session ? new Date(session.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';
    const statusColor = a.status === 'assigned' ? '#3fb950' : '#f85149';
    const statusText = a.status === 'assigned' ? '✓ Assigned' : '✗ Unassigned';
    return `
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:8px 12px;font-size:12px;color:#374151;">${idx + 1}</td>
        <td style="padding:8px 12px;font-size:12px;font-family:monospace;">${dateStr}</td>
        <td style="padding:8px 12px;font-size:12px;font-family:monospace;">${session?.slot || '—'} ${session?.startTime || ''}</td>
        <td style="padding:8px 12px;font-size:12px;font-weight:500;">${session?.subject || '—'}</td>
        <td style="padding:8px 12px;font-size:12px;font-family:monospace;">${room?.name || '—'}</td>
        <td style="padding:8px 12px;font-size:12px;">${a.f1Name || '<em style="color:#9ca3af">None</em>'}</td>
        <td style="padding:8px 12px;font-size:12px;">${a.f2Name || '<em style="color:#9ca3af">None</em>'}</td>
        <td style="padding:8px 12px;font-size:12px;text-align:center;font-family:monospace;">${a.studentCount || 0}</td>
        <td style="padding:8px 12px;font-size:11px;font-family:monospace;color:${statusColor};font-weight:600;">${statusText}</td>
      </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>ProctorFlow — Duty Allocation Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #111827; background: white; padding: 32px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid #f0a500; }
    .logo { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
    .logo span { color: #f0a500; }
    .meta { font-size: 11px; color: #6b7280; margin-top: 4px; font-family: monospace; }
    h2 { font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    thead tr { background: #f9fafb; border-bottom: 2px solid #e5e7eb; }
    th { padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    .footer { margin-top: 24px; font-size: 10px; color: #9ca3af; text-align: right; font-family: monospace; border-top: 1px solid #e5e7eb; padding-top: 12px; }
    .stats { display: flex; gap: 20px; margin-bottom: 20px; }
    .stat { background: #f9fafb; border: 1px solid #e5e7eb; padding: 12px 16px; }
    .stat-val { font-size: 22px; font-weight: 700; }
    .stat-label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo"><span>Proctor</span>Flow — Duty Allocation Report</div>
      <div class="meta">ISE Department · DSCE · CIE-II · AY 2025-26</div>
    </div>
    <div style="text-align:right;font-size:11px;color:#6b7280;font-family:monospace;">
      Generated: ${timestamp}<br/>
      Total Sessions: ${allocations.length}
    </div>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="stat-val">${allocations.length}</div>
      <div class="stat-label">Total Sessions</div>
    </div>
    <div class="stat">
      <div class="stat-val" style="color:#3fb950;">${allocations.filter(a => a.status === 'assigned').length}</div>
      <div class="stat-label">Assigned</div>
    </div>
    <div class="stat">
      <div class="stat-val" style="color:#f85149;">${allocations.filter(a => a.status !== 'assigned').length}</div>
      <div class="stat-label">Unassigned</div>
    </div>
    <div class="stat">
      <div class="stat-val">${allocations.reduce((s, a) => s + (a.studentCount || 0), 0)}</div>
      <div class="stat-label">Total Students</div>
    </div>
  </div>

  <h2>Invigilator Duty Chart</h2>
  <table>
    <thead>
      <tr>
        <th>#</th><th>Date</th><th>Session</th><th>Subject</th><th>Room</th>
        <th>Invigilator 1</th><th>Invigilator 2</th><th>Students</th><th>Status</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>

  <div class="footer">
    ProctorFlow v2 · Auto-generated by Greedy Allocation Engine · DSCE ISE Department
  </div>

  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    // Fallback: download as HTML file
    triggerDownload(html, `ProctorFlow_Allocation_${new Date().toISOString().slice(0,10)}.html`, 'text/html;charset=utf-8;');
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
}
