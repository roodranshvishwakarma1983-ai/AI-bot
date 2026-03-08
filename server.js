require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware to parse JSON data and serve static files
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); // serves index.html, dashboard.html

// 1. Configure the node mailer transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

// 2. Handle the registration route
app.post('/register', async (req, res) => {
    // Extract user details from the request body
    const { name, email, enrollment, password } = req.body;

    if (!name || !email || !enrollment || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required. ❌' });
    }

    try {
        console.log(`User ${name} trying to register. Saving to Supabase...`);

        // Insert the user into the Supabase database
        const { data, error } = await supabase
            .from('users')
            .insert([
                { name, email, enrollment, password }
            ]);

        if (error) {
            console.error('Supabase error:', error);
            // If the table doesn't exist, we'll inform the user politely
            return res.status(500).json({ success: false, message: 'Database saving failed. Have you created the "users" table in Supabase? ⚠️' });
        }

        console.log(`Saved ${name} successfully. Sending verification email to ${email}...`);

        // 3. Define the email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to the App! 🚀 Verify Your Registration',
            text: `Hello ${name} 🎉,\n\nWelcome on board! You registered with enrollment number: ${enrollment}.\n\nPlease click the link below to verify your email:\nhttp://localhost:${PORT}/verify?email=${email}\n\nStay awesome! ✨`,
            html: `<div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                       <h2 style="color: #4CAF50;">Hello ${name}! 🎉</h2>
                       <p>Welcome on board! 🚀</p>
                       <p>Your enrollment number is <strong>${enrollment}</strong>.</p>
                       <p>Please click the button below to verify your email address:</p>
                       <a href="http://localhost:${PORT}/verify?email=${email}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email ✅</a>
                   </div>`
        };

        // 4. Send the email
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully.');

        // 5. Send a success response back to the client
        res.status(200).json({ success: true, message: 'Registration successful! 🌟 Redirecting...' });

    } catch (error) {
        console.error('Error in registration flow:', error);
        res.status(500).json({ success: false, message: 'An unexpected error occurred. Please try again. 💥' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} 🚀`);
});
