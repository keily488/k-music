const formulario = document.getElementById("formulario");
const resultado = document.getElementById("resultado");

const campos = {
  nombre: document.getElementById("nombre"),
  apellido: document.getElementById("apellido"),
  apellidoMaterno: document.getElementById("apellidoMaterno"),
  fechaNacimiento: document.getElementById("fechaNacimiento"),
  edad: document.getElementById("edad"),
  telefono: document.getElementById("telefono"),
  correo: document.getElementById("correo")
};

// Nombres y apellidos: solo letras y espacios, siempre en MAYÚSCULAS.
["nombre", "apellido", "apellidoMaterno"].forEach((id) => {
  campos[id].addEventListener("input", () => {
    const posicion = campos[id].selectionStart;
    const texto = campos[id].value
      .replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "")
      .replace(/\s+/g, " ")
      .toLocaleUpperCase("es-MX");
    campos[id].value = texto.slice(0, 100);
    const nuevaPosicion = Math.min(posicion, campos[id].value.length);
    campos[id].setSelectionRange(nuevaPosicion, nuevaPosicion);
    revisarCampo(id);
    limpiarResultado();
  });
});

// Edad y teléfono: únicamente números.
["edad", "telefono"].forEach((id) => {
  campos[id].addEventListener("input", () => {
    campos[id].value = campos[id].value.replace(/[^0-9]/g, "");
    revisarCampo(id);
    limpiarResultado();
  });
});

campos.correo.addEventListener("input", () => {
  revisarCampo("correo");
  limpiarResultado();
});

// Selector de fecha en tres pasos: día, mes y año.
const selectorFecha = document.getElementById("selectorFecha");
const tituloFecha = document.getElementById("tituloFecha");
const opcionFecha = document.getElementById("opcionFecha");
const siguienteFecha = document.getElementById("siguienteFecha");
const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
let pasoFecha = 1;
let diaElegido = "";
let mesElegido = "";
let anioElegido = "";

function llenarOpciones(inicio, fin, texto) {
  opcionFecha.innerHTML = `<option value="">${texto}</option>`;
  for (let n = inicio; n <= fin; n++) {
    const option = document.createElement("option");
    option.value = String(n);
    option.textContent = String(n);
    opcionFecha.appendChild(option);
  }
}

function mostrarPasoFecha() {
  if (pasoFecha === 1) {
    tituloFecha.textContent = "1. Selecciona el día";
    llenarOpciones(1, 31, "Día");
  } else if (pasoFecha === 2) {
    tituloFecha.textContent = "2. Selecciona el mes";
    opcionFecha.innerHTML = '<option value="">Mes</option>';
    meses.forEach((mes, indice) => {
      const option = document.createElement("option");
      option.value = String(indice + 1);
      option.textContent = mes;
      opcionFecha.appendChild(option);
    });
  } else {
    tituloFecha.textContent = "3. Selecciona el año";
    llenarOpciones(1945,2008,"Año");
    // Los años recientes aparecen primero.
    const opciones = Array.from(opcionFecha.options).slice(1).reverse();
    opcionFecha.innerHTML = '<option value="">Año</option>';
    opciones.forEach((opcion) => opcionFecha.appendChild(opcion));
  }
}

campos.fechaNacimiento.addEventListener("click", () => {
  pasoFecha = 1;
  diaElegido = mesElegido = anioElegido = "";
  mostrarPasoFecha();
  selectorFecha.hidden = false;
  limpiarResultado();
});

siguienteFecha.addEventListener("click", () => {
  if (!opcionFecha.value) {
    tituloFecha.textContent = `Selecciona una opción para continuar`;
    return;
  }
  if (pasoFecha === 1) diaElegido = opcionFecha.value;
  if (pasoFecha === 2) mesElegido = opcionFecha.value;
  if (pasoFecha === 3) anioElegido = opcionFecha.value;

  if (pasoFecha < 3) {
    pasoFecha++;
    mostrarPasoFecha();
    return;
  }

  const fecha = new Date(Number(anioElegido), Number(mesElegido) - 1, Number(diaElegido));
  const esFechaReal = fecha.getFullYear() === Number(anioElegido) &&
    fecha.getMonth() === Number(mesElegido) - 1 &&
    fecha.getDate() === Number(diaElegido);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (!esFechaReal || fecha > hoy) {
    pasoFecha = 1;
    tituloFecha.textContent = "Esa fecha no es válida. Selecciona nuevamente el día";
    mostrarPasoFecha();
    return;
  }

  campos.fechaNacimiento.value = `${String(diaElegido).padStart(2, "0")}/${String(mesElegido).padStart(2, "0")}/${anioElegido}`;
  selectorFecha.hidden = true;
  revisarCampo("fechaNacimiento");
  limpiarResultado();
});

function limpiarResultado() {
  resultado.textContent = "";
  resultado.className = "";
}

function validarTexto(valor) {
  return valor.length <= 100 &&
    /^[A-ZÁÉÍÓÚÜÑ]+(?:[ ]+[A-ZÁÉÍÓÚÜÑ]+)*$/u.test(valor);
}

function validarEdad(valor) {
  if (!/^\d{1,3}$/.test(valor)) return false;
  const numero = Number(valor);
  return numero >= 18 && numero <= 120;
}

function validarTelefono(valor) {
  return /^\d{16}$/.test(valor);
}

function validarFechaNacimiento(valor) {
  const coincidencia = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
  if (!coincidencia) return false;
  const [, dia, mes, anio] = coincidencia;
  const fecha = new Date(Number(anio), Number(mes) - 1, Number(dia));
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return fecha.getFullYear() === Number(anio) &&
    fecha.getMonth() === Number(mes) - 1 &&
    fecha.getDate() === Number(dia) && fecha <= hoy;
}

function validarCorreo(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor);
}

const reglas = {
  nombre: { validar: validarTexto, mensaje: "Escribe solo letras y espacios. Máximo 100 caracteres." },
  apellido: { validar: validarTexto, mensaje: "Escribe solo letras y espacios. Máximo 100 caracteres." },
  apellidoMaterno: { validar: validarTexto, mensaje: "Escribe solo letras y espacios. Máximo 100 caracteres." },
  fechaNacimiento: { validar: validarFechaNacimiento, mensaje: "Selecciona una fecha de nacimiento válida." },
  edad: { validar: validarEdad, mensaje: "Escribe una edad de 1 a 3 dígitos, entre 18 y 120." },
  telefono: { validar: validarTelefono, mensaje: "El número de tarjeta debe tener exactamente 16 números." },
  correo: { validar: validarCorreo, mensaje: "Escribe un correo válido, por ejemplo nombre@correo.com." }
};

function revisarCampo(id) {
  const input = campos[id];
  const error = document.getElementById(`error-${id}`);
  const valor = input.value.trim();
  const esValido = reglas[id].validar(valor);
  input.classList.toggle("valido", esValido);
  input.classList.toggle("invalido", !esValido);
  error.textContent = esValido ? "" : reglas[id].mensaje;
  return esValido;
}

Object.keys(campos).forEach((id) => {
  campos[id].addEventListener("blur", () => revisarCampo(id));
});

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const todosValidos = Object.keys(campos).map((id) => revisarCampo(id)).every(Boolean);

  if (todosValidos) {

    resultado.textContent = "¡Formulario enviado correctamente!";
    resultado.className = "exito";
    setTimeout(()=> {
      document.querySelector("from").reset();
    }, 1500);
    formulario.reset();
    selectorFecha.hidden = true;
    Object.values(campos).forEach((input) => input.classList.remove("valido", "invalido"));
    Object.keys(campos).forEach((id) => {
      document.getElementById(`error-${id}`).textContent = "";
    });
  } else {
    resultado.textContent = "Revisa los campos marcados antes de continuar.";
    resultado.className = "fallo";
  }
});
