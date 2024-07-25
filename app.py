from flask import Flask, render_template, request, send_file, jsonify
from werkzeug.utils import secure_filename
import os
import io
from pdf2docx import Converter

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['CONVERTED_FOLDER'] = 'converted'

# Ensure upload and converted directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['CONVERTED_FOLDER'], exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/convert', methods=['POST'])
def convert():
    if 'pdfFile' not in request.files:
        return jsonify({'error': 'No file part'})
    file = request.files['pdfFile']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    if file and file.filename.endswith('.pdf'):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        converted_filename = filename.replace('.pdf', '.docx')
        converted_filepath = os.path.join(app.config['CONVERTED_FOLDER'], converted_filename)

        # Convert PDF to DOCX
        cv = Converter(filepath)
        cv.convert(converted_filepath)
        cv.close()

        return jsonify({'fileUrl': f'/download/{converted_filename}'})

    return jsonify({'error': 'Invalid file format'})

@app.route('/download/<filename>')
def download(filename):
    filepath = os.path.join(app.config['CONVERTED_FOLDER'], filename)
    if os.path.exists(filepath):
        return send_file(filepath, as_attachment=True)
    return jsonify({'error': 'File not found'})

if __name__ == '__main__':
    app.run(debug=True)
