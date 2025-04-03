const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  doc: { type: String, required: true }
});

const passengerDataSchema = new mongoose.Schema({
  destination: { type: String, required: true },
  date: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  numPassengers: { type: Number, required: true },
  responsible: { type: String, required: true },
  assistant: { type: String, required: true },
  passengers: [passengerSchema],  // Este es el campo de los pasajeros
});

const PassengerData = mongoose.model('PassengerData', passengerDataSchema);

module.exports = PassengerData;
