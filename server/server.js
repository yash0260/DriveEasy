const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const seedData = require('./seedData');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3001;

mongoose.connect('mongodb://localhost:27017/vehicle-tracking', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());

const carSchema = new mongoose.Schema({
  companyName: String,
  distanceCovered: Number,
  mileage: Number,
  serviceDates: [Date],
  owner: {
    name: String,
    email: String,
  },
  image: String,
});

const Car = mongoose.model('Car', carSchema);

const seedDatabase = async () => {
  try {
    const existingCars = await Car.find();
    if (existingCars.length > 0) {
      await Car.deleteMany();
      console.log('Existing cars deleted.');
    }
    await Car.create(seedData);
    console.log('Seed data added to the database.');
  } catch (error) {
    console.error('Error seeding the database:', error);
  }
};

seedDatabase();

app.get('/api/cars', async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/cars/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json(car);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/cars', async (req, res) => {
  try {
    const newCar = await Car.create(req.body);
    res.status(201).json(newCar);
  } catch (error) {
    res.status(400).json({ error: 'Bad Request' });
  }
});

app.put('/api/cars/:id', async (req, res) => {
  try {
    const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCar) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json(updatedCar);
  } catch (error) {
    res.status(400).json({ error: 'Bad Request' });
  }
});

app.delete('/api/cars/:id', async (req, res) => {
  try {
    const deletedCar = await Car.findByIdAndDelete(req.params.id);
    if (!deletedCar) {
      return res.status(404).json({ error: 'Car not found' });
    }
    console.log('Car is deleted successfully');
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
