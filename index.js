require("dotenv").config(); // Cargar variables de entorno
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(cors());

// Conectar a MongoDB  "mongodb+srv://Gali:GaliDev@clustertienda.u3umz.mongodb.net/?retryWrites=true&w=majority&appName=ClusterTienda";
const mongoURI =
  process.env.MONGO_URI || "mongodb+srv://ala282016viajes:ala282016viajes@cluster0.94owmnc.mongodb.net/?appName=Cluster0";
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conectado a la base de datos MongoDB"))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

// Definir el esquema para los viajes
// Updated Trip Schema with unique destination
const tripSchema = new mongoose.Schema({
  numPassengers: Number,
  price: Number,
  responsible: String,
  assistant: String,
  destination: { 
    type: String, 
    unique: true,   // This makes the destination field unique
    required: true  // Also making it required is a good practice for unique fields
  },
  date: { type: Date, default: Date.now },
  passengers: [
    {
      numberOfpassage: String, // Passenger number/ID
      name: String,
      dni: Number,
      pago: Number,
    },
  ],
});

// Add an index for better query performance
tripSchema.index({ destination: 1 }, { unique: true });

// Modelo de viaje
const Trip = mongoose.model("Trip", tripSchema);

// Ruta para obtener todos los viajes
app.get("/viajes", async (req, res) => {
  try {
    const trips = await Trip.find();
    res.json(trips);
  } catch (error) {
    res.status(500).send("Error al obtener los viajes.");
  }
});

// Ruta para crear o actualizar un viaje

app.post("/viajes", async (req, res) => {
  try {
    const { _id, numPassengers, price, responsible, assistant, destination, passengers } = req.body;

    // Si se proporciona un _id, se intenta actualizar el viaje existente
    if (_id) {
      const updatedTrip = await Trip.findByIdAndUpdate(
        _id,
        { numPassengers, price, responsible, assistant, destination, passengers },
        { new: true, runValidators: true }
      );

      if (!updatedTrip) {
        return res.status(404).send("Viaje no encontrado.");
      }

      return res.json(updatedTrip);
    }

    // Si no se proporciona _id, se crea un nuevo viaje
    const newTrip = new Trip({
      numPassengers,
      price,
      responsible,
      assistant,
      destination,
      passengers,
    });

    await newTrip.save();
    res.status(201).json(newTrip);
  } catch (error) {
    console.error("Error al guardar o actualizar el viaje:", error);
    
    // Verificar si es un error de clave duplicada (E11000)
    if (error.code === 11000 && error.keyPattern && error.keyPattern.destination) {
      return res.status(409).json({
        message: "Ya existe un viaje con ese destino. Utilice la función de actualización en su lugar.",
        error: "duplicate_destination"
      });
    }
    
    res.status(500).send("Error al guardar o actualizar el viaje.");
  }
});


// Ruta para obtener un viaje por ID
app.get("/viajes/:id", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).send("Viaje no encontrado.");
    }
    res.json(trip);
  } catch (error) {
    res.status(500).send("Error al obtener los detalles del viaje.");
  }
});




app.delete("/viajes/:id", async (req, res) => {
  const { id } = req.params;

  // Verificar si el id tiene un formato válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID no válido" });
  }

  try {
    const deletedTrip = await Trip.findByIdAndDelete(id);

    if (!deletedTrip) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    res.json({ message: "Viaje eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar el viaje:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});




// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});

