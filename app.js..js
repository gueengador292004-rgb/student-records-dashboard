const $ = (id) => document.getElementById(id);
const api = '/api/students';
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function loadStats() {
  const s = await (await fetch('/api/stats')).json();
  $('sTotal').textContent = s.totalStudents;
  $('sAvg').textContent = s.avgGrade;
  $('sTop').textContent = s.topGrade;
  $('sRisk').textContent = s.atRisk;
}

async function loadStudents() {
  const q = encodeURIComponent($('search').value);
  const items = await (await fetch(`${api}?q=${q}`)).json();
  $('rows').innerHTML = items.length
    ? items.map((s) => `
      <tr>
        <td>${s.id}</td><td>${esc(s.name)}</td><td>${esc(s.course)}</td>
        <td>${s.year_level}</td><td class="${s.grade < 75 ? 'low' : ''}">${s.grade}</td>
        <td>
          <button class="edit" onclick="editItem(${s.id})">Edit</button>
          <button class="danger" onclick="removeItem(${s.id})">Delete</button>
        </td>
      </tr>`).join('')
    : '<tr><td colspan="6">No students found.</td></tr>';
}

function refresh() { loadStats(); loadStudents(); }

function resetForm() {
  $('studentForm').reset();
  $('id').value = '';
  $('course').value = 'General';
  $('formTitle').textContent = 'Add Student';
  $('saveBtn').textContent = 'Add';
  $('cancelBtn').hidden = true;
  $('error').textContent = '';
}

$('studentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('id').value;
  const body = {
    name: $('name').value, course: $('course').value,
    year_level: $('year_level').value, grade: $('grade').value,
  };
  const res = await fetch(id ? `${api}/${id}` : api, {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) { $('error').textContent = (await res.json()).error; return; }
  resetForm();
  refresh();
});

async function editItem(id) {
  const s = await (await fetch(`${api}/${id}`)).json();
  $('id').value = s.id; $('name').value = s.name; $('course').value = s.course;
  $('year_level').value = s.year_level; $('grade').value = s.grade;
  $('formTitle').textContent = `Edit Student #${s.id}`;
  $('saveBtn').textContent = 'Update';
  $('cancelBtn').hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function removeItem(id) {
  if (!confirm('Delete this student?')) return;
  await fetch(`${api}/${id}`, { method: 'DELETE' });
  refresh();
}

$('cancelBtn').addEventListener('click', resetForm);
$('search').addEventListener('input', loadStudents);
refresh();
