from flask import Flask, send_from_directory, request, after_this_request
import os

app = Flask(__name__)

# Serve the index.html file from the directory
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Serve static files and handle gzipped files
@app.route('/<path:path>')
def serve_file(path):
    if os.path.exists(path + '.gz'):
        @after_this_request
        def add_header(response):
            response.headers['Content-Encoding'] = 'gzip'
            return response
        return send_from_directory('.', path + '.gz')
    return send_from_directory('.', path)

if __name__ == '__main__':
    app.run(debug=True)
