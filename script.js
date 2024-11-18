
const calendar = document.getElementById('calendar');
const formContainer = document.getElementById('form-container');
const selectedDateDisplay = document.getElementById('selected-date');
const saveButton = document.getElementById('save-button');
const editButton = document.getElementById('edit-button');
const deleteButton = document.getElementById('delete-button');
const moodDropdown = document.getElementById('mood');
const currentMonthDisplay = document.getElementById('current-month');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');

const moodColors = {
    1: '#b9fbc0',
    2: '#a3e635',
    3: '#facc15',
    4: '#fb923c',
    5: '#60a5fa',
};

let currentDate = new Date();
let isEditable = false;

// Inicializando Quill
const quill = new Quill('#editor', {
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],               // custom button values
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
            [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
            [{ 'direction': 'rtl' }],                         // text direction
            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['link', 'image'],                                // link and image
            ['clean']                                         // remove formatting button
        ]
    },
    placeholder: '¿Cómo estuvo tu día?',
    theme: 'snow'
});

function renderCalendar(date) {
    calendar.innerHTML = '';
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    currentMonthDisplay.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const dayElement = document.createElement('div');
        dayElement.textContent = daysInPrevMonth - i;
        dayElement.classList.add('gray');
        calendar.appendChild(dayElement);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        dayElement.dataset.date = `${year}-${month + 1}-${day}`;
        const savedData = JSON.parse(localStorage.getItem(dayElement.dataset.date));

        if (savedData && savedData.mood) {
            dayElement.style.backgroundColor = moodColors[savedData.mood];
        }

        dayElement.addEventListener('click', () => selectDate(dayElement));
        calendar.appendChild(dayElement);
    }
}

function selectDate(element) {
    const previouslySelected = document.querySelector('.selected');
    if (previouslySelected) previouslySelected.classList.remove('selected');
    element.classList.add('selected');
    formContainer.classList.remove('hidden');
    selectedDateDisplay.textContent = `Fecha: ${element.dataset.date}`;

    const savedData = JSON.parse(localStorage.getItem(element.dataset.date));
    if (savedData) {
        moodDropdown.value = savedData.mood;
        quill.setContents(quill.clipboard.convert(savedData.note || ''));  // Load saved note without placeholder overlap
        setFormEditable(false); // Lock form if data is already saved
    } else {
        moodDropdown.value = '';
        quill.setContents('');  // Clear the editor when no saved data exists
        quill.root.dataset.placeholder = '¿Cómo estuvo tu día?';  // Set placeholder for new entry
        setFormEditable(true); // Allow editing for new entry
    }
}

function setFormEditable(editable) {
    isEditable = editable;
    moodDropdown.disabled = !editable;
    quill.enable(editable);
    saveButton.disabled = !editable;
    editButton.disabled = editable;
    deleteButton.disabled = !editable;
}

saveButton.addEventListener('click', () => {
    const selectedDate = document.querySelector('.selected').dataset.date;
    const mood = moodDropdown.value;
    const note = quill.root.innerHTML;

    const moodData = {
        mood,
        note,
    };

    localStorage.setItem(selectedDate, JSON.stringify(moodData));

    const selectedDayElement = document.querySelector(`[data-date='${selectedDate}']`);
    selectedDayElement.style.backgroundColor = moodColors[mood];

    alert('Datos guardados!');
    setFormEditable(false); // Lock the form after saving
});

editButton.addEventListener('click', () => {
    setFormEditable(true); // Unlock the form for editing
});

deleteButton.addEventListener('click', () => {
    const selectedDate = document.querySelector('.selected').dataset.date;
    if (confirm('¿Estás seguro de que deseas eliminar todos los datos de este día?')) {
        localStorage.removeItem(selectedDate);
        quill.setContents('');  // Clear editor content
        moodDropdown.value = '';
        const selectedDayElement = document.querySelector(`[data-date='${selectedDate}']`);
        selectedDayElement.style.backgroundColor = '';
        setFormEditable(true); // Allow new data to be added
    }
});

prevMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
});

nextMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
});

renderCalendar(currentDate);
