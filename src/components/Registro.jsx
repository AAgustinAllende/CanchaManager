import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";

const Registro = () => {
  const location = useLocation();
  const turnoEditado = location.state?.turno || null;

  const preciosPorCancha = {
    "8vs8": 70000,
    "6vs6 A": 50000,
    "6vs6 B": 50000,
  };

  const [turnos, setTurnos] = useState([]);

  const [nuevoTurno, setNuevoTurno] = useState({
    nombre: "",
    dia: "",
    hora: "",
    cancha: "",
    precio: "",
    email: "",
  });

  const [horariosDisponibles, setHorariosDisponibles] = useState([
    "20:00 - 21:00",
    "21:00 - 22:00",
    "22:00 - 23:00",
  ]);
  const [canchasDisponibles, setCanchasDisponibles] = useState([]);

  useEffect(() => {
    if (turnoEditado) {
      setNuevoTurno(turnoEditado);
      setTimeout(() => actualizarDisponibilidad(), 0);
    }
  }, [turnoEditado]);

  useEffect(() => {
    const fetchTurnos = async () => {
      try {
        const res = await fetch("http://localhost:59470/api/Futbol");
        const data = await res.json();
        const turnosTraducidos = data.map((t) => ({
          id: t.Id,
          nombre: t.Nombre,
          dia: t.Dia.split("T")[0],
          hora: t.Hora.trim(),
          cancha: t.Cancha.trim(),
          precio: t.Precio,
          email: t.Email || t.email || "",
        }));
        setTurnos(turnosTraducidos);
      } catch (err) {
        console.error("Error al obtener turnos", err);
      }
    };

    fetchTurnos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cancha") {
      setNuevoTurno({
        ...nuevoTurno,
        cancha: value,
        precio: preciosPorCancha[value] || "",
      });
      return;
    }

    setNuevoTurno({
      ...nuevoTurno,
      [name]: value,
    });
  };

  useEffect(() => {
    if (nuevoTurno.dia) {
      actualizarDisponibilidad();
    }
  }, [nuevoTurno.dia, nuevoTurno.hora, turnos]);

  const actualizarDisponibilidad = () => {
    const horarios = ["20:00 - 21:00", "21:00 - 22:00", "22:00 - 23:00"];
    const horariosLibres = [];
    const canchasPorHorario = {};

    horarios.forEach((hora) => {
      const reservas = turnos.filter(
        (t) => t.dia === nuevoTurno.dia && t.hora === hora
      );

      let disponibles = Object.keys(preciosPorCancha);

      const ocupado6A = reservas.some((r) => r.cancha === "6vs6 A");
      const ocupado6B = reservas.some((r) => r.cancha === "6vs6 B");
      const ocupado8 = reservas.some((r) => r.cancha === "8vs8");

      if (ocupado8) {
        disponibles = [];
      } else {
        if (ocupado6A || ocupado6B) {
          disponibles = disponibles.filter((c) => c !== "8vs8");
        }
        if (ocupado6A) disponibles = disponibles.filter((c) => c !== "6vs6 A");
        if (ocupado6B) disponibles = disponibles.filter((c) => c !== "6vs6 B");
      }

      if (disponibles.length > 0) {
        horariosLibres.push(hora);
        canchasPorHorario[hora] = disponibles;
      }
    });

    setHorariosDisponibles(horariosLibres);

    if (nuevoTurno.hora) {
      setCanchasDisponibles(canchasPorHorario[nuevoTurno.hora] || []);
    } else {
      setCanchasDisponibles([]);
    }
  };

  const agregarTurno = async () => {
    try {
      const method = turnoEditado ? "PUT" : "POST";
      const url = turnoEditado
        ? `http://localhost:59470/api/Futbol/${turnoEditado.id}`
        : "http://localhost:59470/api/Futbol";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoTurno),
      });

      if (res.ok) {
        setNuevoTurno({ nombre: "", dia: "", hora: "", cancha: "", precio: "", email: "" });
      }
    } catch (error) {
      console.error("Error al guardar turno", error);
    }
  };

  return (
    <div>
      <h2>{turnoEditado ? "Editar turno" : "Nuevo turno"}</h2>
      <form className="form-container" onSubmit={(e) => e.preventDefault()}>

        <input
          className="input-style input-card"
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={nuevoTurno.nombre}
          onChange={handleChange}
        />
        <input
          className="input-style input-card"
          type="text"
          name="email"
          placeholder="Correo electronico"
          value={nuevoTurno.email}
          onChange={handleChange}
        />
        <input
          className="input-style input-card"
          type="date"
          name="dia"
          value={nuevoTurno.dia}
          onChange={handleChange}
        />

        <select
          className="input-style input-card"
          name="hora"
          value={nuevoTurno.hora}
          onChange={handleChange}
        >
          <option value="">Seleccionar un horario</option>
          {horariosDisponibles.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>

        <select
          className="input-style input-card"
          name="cancha"
          value={nuevoTurno.cancha}
          onChange={handleChange}
        >
          <option value="">Seleccionar cancha</option>
          {canchasDisponibles.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input
          className="input-style input-card"
          type="number"
          name="precio"
          placeholder="Precio"
          value={nuevoTurno.precio}
          readOnly
        />

        <button onClick={agregarTurno}>
          {turnoEditado ? "Actualizar" : "Agregar"}
        </button>
      </form>
    </div>
  );
};

export default Registro;
