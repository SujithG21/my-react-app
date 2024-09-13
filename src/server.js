const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); 

const app = express();

app.use(cors());
app.use(express.json());

// Database connection
const db = async () => {
    try {
        await mongoose.connect('mongodb+srv://EiAether:project@data.9tbsu.mongodb.net/login?retryWrites=true&w=majority&appName=data', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Database connected to login!');
    } catch (error) {
        console.log('Database connection error:', error.message);
    }
};

db();

// Define schema and model
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
});

const Users = mongoose.model('login', userSchema);

// Register route (assuming you have a separate route for registration)
app.post('/register', async (request, response) => {
    const { name, password } = request.body;

    try {
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10); // Adjust saltRounds as needed

        // Create a new user with the hashed password
        const newUser = new Users({
            name,
            password: hashedPassword
        });
        await newUser.save();

        response.json({ success: true, message: 'Registration successful' });
    } catch (error) {
        console.error('Error:', error.message);
        response.status(500).send(error.message);
    }
});

// Login route
app.post('/login', async (request, response) => {
    const { name, password } = request.body;

    try {
        // Find user by name
        const user = await Users.findOne({ name });

        if (user) {
            // Compare hashed passwords
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                response.json({ success: true, message: 'Login successful' });
            } else {
                console.log('Invalid password');
                response.status(401).json({ success: false, message: 'Invalid credentials' });
            }
        } else {
            console.log('User not found');
            response.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error:', error.message);
        response.status(500).send(error.message);
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));