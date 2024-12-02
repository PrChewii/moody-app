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
const auth = firebase.auth();  // Aquí se define `auth`
const db = firebase.firestore();  // Aquí se define `db`

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

// Inicializando Quill
const quill = new Quill('#editor', {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ]
  },
  placeholder: '¿Cómo estuvo tu día?',
  theme: 'snow'
});

// Definición de la función toggleAuthState
function toggleAuthState(isAuthenticated, email = '') {
  if (isAuthenticated) {
    slideUp(authContainer); // Ocultar el contenedor de autenticación
    setTimeout(() => {
      mainApp.classList.remove('hidden'); // Mostrar la aplicación principal
      userInfo.textContent = `Conectado como: ${email}`; // Mostrar el correo del usuario
    }, 500);
  } else {
    slideDown(authContainer); // Mostrar el contenedor de autenticación
    mainApp.classList.add('hidden'); // Ocultar la aplicación principal
    userInfo.textContent = ''; // Limpiar la información del usuario
  }
}

// Funciones para animaciones (slide up y slide down)
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

// Ahora que todo está inicializado, puedes proceder a agregar los eventListeners

// Iniciar Sesión
loginButton.addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    console.log("Sesión iniciada");
    console.log("UID del usuario:", auth.currentUser.uid);  // Imprimir el UID del usuario en la consola
    toggleAuthState(true, email);

    await updateExistingDocuments();
  } catch (error) {
    console.error("Error al iniciar sesión: ", error.message);
    alert("Error al iniciar sesión: " + error.message);
  }
});

async function verifyAndUpdateDocuments() {
  try {
    // Obtener todos los documentos de la colección "moodEntries"
    const snapshot = await db.collection('moodEntries').get();
    const user = auth.currentUser;

    if (user) {
      for (const doc of snapshot.docs) {
        const data = doc.data();
        
        // Verificar si el campo userId existe y si coincide con el usuario actual
        if (!data.userId || data.userId !== user.uid) {
          // Actualizar el documento agregando o corrigiendo el userId
          await db.collection('moodEntries').doc(doc.id).update({
            userId: user.uid
          });
          console.log(`Documento ${doc.id} actualizado con userId.`);
        }
      }
    }
  } catch (error) {
    console.error("Error al verificar y actualizar los documentos: ", error);
  }
}

// Llama a esta función después de iniciar sesión para verificar y actualizar los documentos
auth.onAuthStateChanged((user) => {
  if (user) {
    verifyAndUpdateDocuments();
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

// Verificar el estado de autenticación
auth.onAuthStateChanged((user) => {
  if (user) {
    // Si el usuario está autenticado, mostrar la aplicación principal con su correo electrónico
    toggleAuthState(true, user.email);

    // Renderizar el calendario cuando se detecta un usuario autenticado
    renderCalendar(currentDate);  
  } else {
    // Si no hay un usuario autenticado, mostrar la ventana de autenticación
    toggleAuthState(false);
  }
});


//UsedID

saveButton.addEventListener('click', async () => {
  const selectedDateElement = document.querySelector('.selected');
  if (!selectedDateElement) {
    alert('Por favor selecciona una fecha primero.');
    return;
  }

  const selectedDate = selectedDateElement.dataset.date; // El formato ahora será siempre YYYY-MM-DD
  const mood = moodDropdown.value;
  const note = quill.root.innerHTML;

  const user = auth.currentUser;
  if (!user) {
    alert('No se ha autenticado ningún usuario.');
    return;
  }

  // Crear los datos que vamos a guardar
  const moodData = {
    date: selectedDate,
    mood: mood,
    note: note,
    userId: user.uid,
  };

  try {
    // Guardar los datos en una subcolección del usuario autenticado
    await db.collection('moodEntries').doc(user.uid)
      .collection('userEntries').doc(selectedDate).set(moodData);

    selectedDateElement.style.backgroundColor = moodColors[mood];
    alert('Datos guardados!');
    setFormEditable(false);
  } catch (error) {
    console.error("Error al guardar datos: ", error);
    alert("Error al guardar datos: " + error.message);
  }
});

// Event Listener para el botón "Editar"
editButton.addEventListener('click', () => {
  setFormEditable(true); // Habilitar el formulario para editar
});

// Event Listener para el botón "Eliminar"
deleteButton.addEventListener('click', async () => {
  const selectedDateElement = document.querySelector('.selected');
  if (!selectedDateElement) {
    alert('Por favor selecciona una fecha primero.');
    return;
  }

  const selectedDate = selectedDateElement.dataset.date;
  const user = auth.currentUser;
  if (!user) {
    alert('No se ha autenticado ningún usuario.');
    return;
  }

  try {
    // Verificar si el documento existe antes de intentar eliminarlo
    const docRef = db.collection('moodEntries').doc(user.uid)
      .collection('userEntries').doc(selectedDate);
    
    const doc = await docRef.get();
    if (doc.exists && doc.data().userId === user.uid) {
      await docRef.delete();
      selectedDateElement.style.backgroundColor = ''; // Restablecer el color del día en el calendario
      moodDropdown.value = '';
      quill.setContents('');
      alert('Datos eliminados!');
      setFormEditable(false);
    } else {
      alert('No tienes permiso para eliminar estos datos.');
    }
  } catch (error) {
    console.error("Error al eliminar los datos: ", error);
    alert("Error al eliminar los datos: " + error.message);
  }
});



// Esta función actualiza documentos existentes para agregar el campo userId si no lo tienen
async function updateExistingDocuments() {
  try {
    // Obtener todos los documentos de la colección "moodEntries"
    const snapshot = await db.collection('moodEntries').get();
    const user = auth.currentUser;

    if (user) {
      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (!data.userId) {
          // Actualizar el documento agregando el userId del usuario autenticado
          await db.collection('moodEntries').doc(doc.id).update({
            userId: user.uid // Agregar el campo userId al documento
          });
          console.log(`Documento ${doc.id} actualizado con userId.`);
        }
      }
    }
  } catch (error) {
    console.error("Error al actualizar los documentos existentes: ", error);
  }
}




// Otros eventListeners (guardar, editar, eliminar)

const moodColors = {
  1: '#b9fbc0',
  2: '#a3e635',
  3: '#facc15',
  4: '#fb923c',
  5: '#60a5fa',
};

let currentDate = new Date();
let isEditable = false;


async function renderCalendar(date) {
  calendar.innerHTML = '';
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  currentMonthDisplay.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Obtener todos los estados de ánimo para el mes actual desde Firestore
  const user = auth.currentUser;
  if (!user) {
    console.error("No se ha autenticado ningún usuario.");
    return;
  }

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  let moodEntries = {};
  
  try {
    const snapshot = await db.collection('moodEntries').doc(user.uid)
      .collection('userEntries')
      .where('date', '>=', monthStart.toISOString().split('T')[0])
      .where('date', '<=', monthEnd.toISOString().split('T')[0])
      .get();

    snapshot.forEach(doc => {
      moodEntries[doc.id] = doc.data();
    });
  } catch (error) {
    console.error("Error al cargar los datos del calendario: ", error);
  }

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayElement = document.createElement('div');
    dayElement.textContent = daysInPrevMonth - i;
    dayElement.classList.add('gray');
    calendar.appendChild(dayElement);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement('div');
    dayElement.textContent = day;
    dayElement.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // Asegurarse de usar el formato YYYY-MM-DD

    if (moodEntries[dayElement.dataset.date]) {
      dayElement.style.backgroundColor = moodColors[moodEntries[dayElement.dataset.date].mood];
    }

    dayElement.addEventListener('click', () => selectDate(dayElement));
    calendar.appendChild(dayElement);
  }
}


async function selectDate(element) {
  const previouslySelected = document.querySelector('.selected');
  if (previouslySelected) previouslySelected.classList.remove('selected');
  element.classList.add('selected');
  formContainer.classList.remove('hidden');
  selectedDateDisplay.textContent = `Fecha: ${element.dataset.date}`;

  const user = auth.currentUser;
  if (!user) {
    alert('No se ha autenticado ningún usuario.');
    return;
  }

  try {
    // Obtener los datos del documento correspondiente en Firestore
    const doc = await db.collection('moodEntries').doc(user.uid)
      .collection('userEntries').doc(element.dataset.date).get();
    
    if (!doc.exists) {
      console.log(`El documento para la fecha ${element.dataset.date} no existe.`);
      // No hay datos para este día, permitir la entrada de nuevos datos
      moodDropdown.value = '';
      quill.setContents('');
      quill.root.dataset.placeholder = '¿Cómo estuvo tu día?';
      setFormEditable(true);
      return;
    }

    const savedData = doc.data();

    console.log("UID del usuario autenticado:", user.uid);
    console.log("UID almacenado en Firestore:", savedData.userId);

    if (savedData.userId === user.uid) {
      console.log("Los UID coinciden.");
      moodDropdown.value = savedData.mood;
      quill.setContents(quill.clipboard.convert(savedData.note || ''));
      setFormEditable(false);
    } else {
      console.log("Los UID NO coinciden.");
      alert("No tienes permiso para acceder a estos datos.");
      setFormEditable(true);
    }
  } catch (error) {
    console.error("Error al cargar los datos: ", error);
    alert("Error al cargar los datos: " + error.message);
  }
}

function setFormEditable(editable) {
  isEditable = editable;
  moodDropdown.disabled = !editable;
  quill.enable(editable);
  saveButton.disabled = !editable;
  
  if (editable) {
    editButton.classList.add('hidden');
    saveButton.classList.remove('hidden');
    deleteButton.disabled = false; // Habilitar el botón "Eliminar" cuando se está editando
  } else {
    editButton.classList.remove('hidden');
    saveButton.classList.add('hidden');
    deleteButton.disabled = true; // Deshabilitar el botón "Eliminar" cuando el formulario no está editable
  }
}

prevMonthButton.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
});

nextMonthButton.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
});

if (!auth.currentUser) {
  renderCalendar(currentDate);
}
