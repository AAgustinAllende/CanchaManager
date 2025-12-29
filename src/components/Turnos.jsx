import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Turnos = () => {
  const navigate = useNavigate();
  const [turnos, setTurnos] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const fetchTurnos = async () => {
    try {
      const res = await fetch("http://localhost:59470/api/Futbol");
      const data = await res.json();

      const turnosTraducidos = data.map((t) => ({
        id: t.Id,
        nombre: t.Nombre,
        dia: t.Dia.split("T")[0],
        hora: t.Hora,
        cancha: t.Cancha.trim(),
        precio: t.Precio,
        email: t.Email || t.email || ""
      }));

      setTurnos(turnosTraducidos);
    } catch (error) {
      console.error("Error al obtener turnos:", error);
    }
  };

  // turnos cargados al entrar
  useEffect(() => {
    fetchTurnos();
  }, []);

  const eliminarTurno = async (id) => {
    try {
      await fetch(`http://localhost:59470/api/Futbol/${id}`, {
        method: "DELETE",
      });
      fetchTurnos();
    } catch (error) {
      console.error("Error al eliminar turno", error);
    }
  };

  const handleEdit = (turno) => {
    navigate("/registro", { state: { turno } });
  };

  //  Filtrado por nombre
  const turnosFiltrados = turnos.filter((t) =>
    t.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold mb-4">📅 Turnos registrados</h3>

      <input
        className="input-style mb-4 text-black"
        id="searchbtn"
        type="text"
        placeholder="Buscar por nombre"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {turnosFiltrados.length === 0 ? (
        <p>No hay turnos registrados.</p>
      ) : (
        <table className="border-collapse border w-full text-black">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Nombre</th>
              <th className="border p-2">Fecha</th>
              <th className="border p-2">Hora</th>
              <th className="border p-2">Cancha</th>
              <th className="border p-2">Precio</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {turnosFiltrados.map((turno) => (
              <tr key={turno.id}>
                <td className="border p-2">{turno.nombre}</td>
                <td className="border p-2">{turno.dia}</td>
                <td className="border p-2">{turno.hora}</td>
                <td className="border p-2">{turno.cancha}</td>
                <td className="border p-2">${turno.precio}</td>
                <td className="border p-2">{turno.email}</td>
                <td className="border p-2 flex gap-2">
                  <button onClick={() => handleEdit(turno)}>Editar</button>
                  <button onClick={() => eliminarTurno(turno.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Turnos;
