const authService = require('../services/authService');

async function login(req, res) {
    const {email, password} = req.body;

    try{
        const token = await authService.loginUser(email, password);
        res.json({token});
    } catch (error) {
        res.status(401).json({error: error.message})
    }
}

async function register(req, res) {
    const {email, password} = req.body;

    if(!email || !password) {
        return res.status(400).json({error: "Email and password are required"});
    }

    try {
        const user = await authService.registerUser(email, password);
        res.status(201).json(user);
    } catch (error) {
        if(error.code === "23505") {
            return res.status(409).json({error: "Email already registered"});
        }
        console.error("Registration failed: ", error.message);
        res.status(500).json({error: "Registration failed"});
    }
}


module.exports = {register, login};