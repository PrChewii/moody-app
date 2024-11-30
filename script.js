// Inicializar Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA4eG6m9_L9Tpv6HgrPU6mFzDq1Tyfa_NQ",
  authDomain: "moody-f7700.firebaseapp.com",
  projectId: "moody-f7700",
  storageBucket: "moody-f7700.appspot.com",
  messagingSenderId: "289533099184",
  appId: "1:289533099184:web:49c91d2ee1c68939b34f75",
  measurementId: "G-Q1TGWSY2VN"
};

// Inicializar Firebase (usando el objeto firebase ya cargado en el HTML)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Referencias a elementos HTML
const authContainer = document.getElementById('auth-container');
const mainApp = document.getElementById('main-app');
const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');
const logoutButton = document.createElement('button');
logoutButton.id = 'logout-button';
logoutButton.textContent = 'Cerrar Sesión';
logoutButton.classList.add('logout-button');
mainApp.appendChild(logoutButton);
const userInfo = document.createElement('div');
userInfo.id = 'user-info';
mainApp.insertBefore(userInfo, mainApp.firstChild);

// Animación para mostrar y ocultar la ventana de autenticación
function slideUp(element) {
  element.style.transition = 'transform 0.5s ease-in-out';
  element.style.transform = 'translateY(-100%)';
  setTimeout(() => {
    element.style.display = 'none';
  }, 500);
}

function slideDown(element) {
  element.style.display = 'block';
  element.style.transition = 'transform 0.5s ease-in-out';
  element.style.transform = 'translateY(0)';
}

// Iniciar Sesión
loginButton.addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    console.log("Sesión iniciada");
    toggleAuthState(true, email);
  } catch (error) {
    console.error("Error al iniciar sesión: ", error.message);
    alert("Error al iniciar sesión: " + error.message);
  }
});

// Registrarse
registerButton.addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    await auth.createUserWithEmailAndPassword(email, password);
    console.log("Usuario registrado");
    toggleAuthState(true, email);
  } catch (error) {
    console.error("Error al registrarse: ", error.message);
    alert("Error al registrarse: " + error.message);
  }
});

// Cerrar Sesión
logoutButton.addEventListener('click', async () => {
  try {
    await auth.signOut();
    console.log("Sesión cerrada");
    toggleAuthState(false);
  } catch (error) {
    console.error("Error al cerrar sesión: ", error.message);
    alert("Error al cerrar sesión: " + error.message);
  }
});

// Cambiar el estado de autenticación
function toggleAuthState(isAuthenticated, email = '') {
  if (isAuthenticated) {
    slideUp(authContainer);
    setTimeout(() => {
      mainApp.classList.remove('hidden');
      logoutButton.classList.remove('hidden');
      userInfo.textContent = `Conectado como: ${email}`;
    }, 500);
  } else {
    slideDown(authContainer);
    mainApp.classList.add('hidden');
    logoutButton.classList.add('hidden');
    userInfo.textContent = '';
  }
}

// Verificar el estado de autenticación
auth.onAuthStateChanged((user) => {
  if (user) {
    // Si el usuario está autenticado, mostrar la aplicación principal con su correo electrónico
    toggleAuthState(true, user.email);
  } else {
    // Si no hay un usuario autenticado, mostrar la ventana de autenticación
    toggleAuthState(false);
  }
});

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
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
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
