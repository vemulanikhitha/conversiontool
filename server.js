const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const libre = require('libreoffice-convert');

const app = express();
const PORT = 5000;

app.use(cors());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Multer config
const upload = multer({ dest: path.join(__dirname, 'uploads/') });

// DOC/DOCX to PDF route
app.post('/convert-to-pdf', upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  const outputPath = `${filePath}.pdf`;

  const docBuf = fs.readFileSync(filePath);

  libre.convert(docBuf, '.pdf', undefined, (err, done) => {
    if (err) {
      console.error('Error converting file:', err);
      return res.status(500).send('Conversion failed');
    }

    fs.writeFileSync(outputPath, done);
    res.download(outputPath, 'converted.pdf', (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      fs.unlinkSync(filePath);
      fs.unlinkSync(outputPath);
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`DOC to PDF converter running at http://localhost:${PORT}`);
});
