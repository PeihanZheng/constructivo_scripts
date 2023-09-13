// import the modules
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const bodyParser = require('body-parser');
const multer = require('multer');
const dotenv = require('dotenv');

// initialize dotenv
dotenv.config();

// create an express app
const app = express();

// define port
const port = process.env.PORT || 3000;

// configure body parser to parse json and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// configure multer to handle file uploads
const storage = multer.diskStorage({
    destination: 'uploads/', 
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

// configure multer to handle file uploads
const upload = multer({ storage: storage });

// define the method to send alert
async function sendAlert(token, title, description, file) {
    // define url
    // const url = `http://localhost:${port}`;
    const url = process.env.URL;

    // define the data 
    const data = {
        token,
        title,
        description
    };

    // create form data object if file exists
    if (file) {
        // form data object
        const formData = new FormData();
        formData.append('token', token);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('file', fs.createReadStream(file.path));

        // try to send put request
        try {
            // use axios to send put request
            const response = await axios.put(url, formData, {
                headers: {
                    ...formData.headers,
                    Authorization: process.env.AUTHORIZATION
                }
            });

            // check the status code
            if (response.status === 200) {
                return response.data;
            } else {
                return 'Unable to send alert...';
            }
        } catch (error) {
            // error handling
            console.error(error);
            return 'Check error message in console...';
        }
    } else {
        // send the data without the file
        try {
            // use axios to send put request
            const response = await axios.put(url, data, {
                headers: {
                    Authorization: process.env.AUTHORIZATION
                }
            });

            // check response status code
            if (response.status === 200) {
                return 'Alert sent successfully!';
            } else {
                return 'Unable to send alert...';
            }
        } catch (error) {
            // error handling
            console.error(error);
            return 'Check error message in console...';
        }
    }
}

// put request handler
app.put('/', upload.single('file'), async (req, res) => {
    // try catch block to handle the promise
    try {
        // get request body components
        const { token, title, description } = req.body;
        const file = req.file;

        // send alert
        const result = await sendAlert(token, title, description, file);

        // return the response
        res.status(200).json({
            success: 1,
            message: result
        });
    } catch (error) {
        // error handling
        console.error(error);
        res.status(500).json({
            success: 0,
            message: 'Unable to send alert...'
        });
    }
});

// listen on port
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
})
