const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const session = require("express-session");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Conexión a la base de datos
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("Error al conectar con la base de datos:", err.message);
  } else {
    console.log("Conectado a la base de datos SQLite.");

    // Crear tabla de usuarios
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )`);

    // Crear tabla de registros con fecha en un solo campo (YYYY-MM-DD)
    db.run(`CREATE TABLE IF NOT EXISTS registros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha TEXT NOT NULL,
      unidad TEXT NOT NULL,
      numero_trafico TEXT NOT NULL,
      producto TEXT NOT NULL,
      volumen REAL NOT NULL,
      importe REAL NOT NULL
    )`);
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: "secreto",
  resave: false,
  saveUninitialized: true
}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Usuario por defecto
db.get("SELECT * FROM usuarios WHERE usuario = ?", ["ROSETEYCIA"], (err, row) => {
  if (!row) {
    db.run("INSERT INTO usuarios (usuario, password) VALUES (?, ?)", ["ROSETEYCIA", "ROSETE2025"]);
  }
});

// Página de login
app.get("/", (req, res) => {
  res.render("login", { error: null });
});

// Manejo de login
app.post("/login", (req, res) => {
  const { usuario, password } = req.body;
  db.get("SELECT * FROM usuarios WHERE usuario = ? AND password = ?", [usuario, password], (err, row) => {
    if (row) {
      req.session.usuario = usuario;
      res.redirect("/dashboard");
    } else {
      res.render("login", { error: "Usuario o contraseña incorrectos" });
    }
  });
});

// Dashboard
app.get("/dashboard", (req, res) => {
  if (!req.session.usuario) return res.redirect("/");
  db.all("SELECT * FROM registros", [], (err, datos) => {
    if (err) console.error(err.message);
    res.render("dashboard", { usuario: req.session.usuario, datos });
  });
});

// Registrar datos
// El usuario ingresa día, mes, año => el servidor lo convierte a 'YYYY-MM-DD'
app.post("/registrar", (req, res) => {
  const { dia, mes, anio, unidad, numero_trafico, producto, volumen, importe } = req.body;
  // Convertir a formato YYYY-MM-DD (agregamos ceros si es necesario)
  const dd = String(dia).padStart(2, "0");
  const mm = String(mes).padStart(2, "0");
  const yyyy = String(anio).padStart(4, "0");
  const fecha = `${yyyy}-${mm}-${dd}`;

  db.run(`INSERT INTO registros (fecha, unidad, numero_trafico, producto, volumen, importe)
          VALUES (?, ?, ?, ?, ?, ?)`,
    [fecha, unidad, numero_trafico, producto, volumen, importe],
    (err) => {
      if (err) console.error("Error al registrar datos:", err.message);
      res.redirect("/dashboard");
    }
  );
});

// Descargar JSON con rango de fechas (YYYY-MM-DD)
app.get("/descargar", (req, res) => {
  const { desde, hasta } = req.query;
  // Filtrar registros donde fecha BETWEEN desde y hasta
  const sql = "SELECT * FROM registros WHERE fecha BETWEEN ? AND ?";
  db.all(sql, [desde, hasta], (err, datos) => {
    if (err) {
      console.error("Error al filtrar datos:", err.message);
      return res.end("Error al filtrar datos");
    }
    // Enviar como archivo adjunto
    res.setHeader("Content-Disposition", "attachment; filename=registros.json");
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(datos, null, 2));
  });
});

// Borrar registro
app.post("/borrar/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM registros WHERE id = ?", [id], (err) => {
    if (err) console.error("Error al borrar registro:", err.message);
    res.redirect("/dashboard");
  });
});

// Cerrar sesión
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
