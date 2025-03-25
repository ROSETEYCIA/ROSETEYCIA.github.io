const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const db = new sqlite3.Database("./database.db", (err) => {
    if (err) {
        console.error("Error al conectar con la base de datos:", err.message);
    } else {
        console.log("Conectado a la base de datos SQLite.");

        db.run(`CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario TEXT UNIQUE NOT NULL,
            contraseña TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error("Error al crear la tabla de usuarios:", err.message);
            } else {
                console.log("Tabla 'usuarios' lista.");

                // Insertar usuario "ROSETEYCIA" con contraseña "ROSETE2025"
                const contraseñaEncriptada = bcrypt.hashSync("ROSETE2025", 10);
                db.run(
                    `INSERT OR IGNORE INTO usuarios (usuario, contraseña) VALUES (?, ?)`,
                    ["ROSETEYCIA", contraseñaEncriptada],
                    (err) => {
                        if (err) console.error("Error al insertar usuario:", err.message);
                        else console.log("Usuario 'ROSETEYCIA' creado correctamente.");
                    }
                );
            }
        });
    }
});

module.exports = db;
