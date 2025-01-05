from flask import Flask, render_template

app = Flask(__name__)

# Home page route
@app.route('/')
def home():
    return render_template('home.html')

# Quantum Level page route
@app.route('/quantumlevel')
def quantum_level():
    return render_template('quantumlevel.html')

if __name__ == '__main__':
    # app.run(debug=True)
    app.config['ENV'] = 'production'
    app.config['DEBUG'] = False 
    app.run()