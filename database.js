const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db", (err) => {
    if (err) console.error("Error al conectar con la base de datos", err.message);
    else {
        console.log("Conectado a la base de datos SQLite.");

        db.run(`CREATE TABLE IF NOT EXISTS registros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha TEXT NOT NULL,
            unidad TEXT NOT NULL,
            volumen REAL NOT NULL
        )`, (err) => {
            if (err) console.error("Error al crear la tabla registros:", err.message);
            else console.log("Tabla 'registros' lista.");
        });
    }
});

module.exports = db;
