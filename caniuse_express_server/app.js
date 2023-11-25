const fs = require('fs');
const caniuse = require('caniuse-api')
const path = require('path');
const express = require('express');

const app = express();
const port = 3000;

const directoryPath = '../text';
let prefix = 'tags-'

const browsers = ['chrome', 'edge', 'firefox', 'ie', 'safari']

app.get('/checkTags', (req, res) => {
    const domain = req.query.domain;
    const directory = directoryPath + '/' + domain
    const resp = {}

    if (!domain) {
        return res.status(400).send('Error: Please provide a "domain" query parameter.');
    }

    fs.readdir(directory, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        // Filter files that start with the specified domain string
        const filteredFiles = files.filter(file => file.startsWith(prefix + domain));

        // Read and process content of filtered files
        filteredFiles.forEach(file => {
            const filePath = path.join(directory, file);

            const data = fs.readFileSync(filePath, 'utf8')

            const delimitedValues = data.split(';'); // Assuming ';' delimited values

            resp[file.replace(/^tags-/, '').replace(/\.txt$/, '')] =
                delimitedValues.map(val => {
                    try {
                        const support = caniuse.getSupport(val, true)
                        const featureObj = {}
                        featureObj[val] = Object.fromEntries(
                            Object.entries(support)
                                .filter(([key]) => browsers.includes(key)))
                        return featureObj
                    } catch (e) {
                        //Suppress error as this api is questionable
                        //console.log(e)
                        return undefined
                    }

                }).filter(val => val !== undefined)
        });
        res.json(resp);
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
