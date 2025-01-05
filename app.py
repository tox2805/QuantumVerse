from flask import Flask, render_template
import os

app = Flask(__name__)

# Home page route
@app.route('/')
def home():
    return render_template('home.html')

# Quantum Level page route
@app.route('/quantumlevel')
def quantum_level():
    return render_template('quantumlevel.html')

app.config['ENV'] = 'production'
app.config['DEBUG'] = False 

if __name__ == '__main__':
    # port = int(os.environ.get("PORT", 5000))  # Get the port from environment or default to 5000
    app.run()  # Bind to 0.0.0.0 for production deployment