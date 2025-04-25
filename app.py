from flask import Flask, render_template, request, redirect, url_for, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from ibm_granite import get_granite_explanation
import os

app = Flask(__name__)
load_dotenv()

# Config
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
app.secret_key = os.getenv('SECRET_KEY')

class Questions(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Text, nullable=False)
    correct_answer = db.Column(db.Text, nullable=False)
    choices = db.Column(db.Text(db.Text), nullable=True)

# ONLY RUN UNCOMMENT WHEN ADDING NEW QUESTIONS
# @app.route('/add')
# def add_sample_question():
#     q = Questions(
#         question="What is a qubit?",
#         correct_answer="A quantum version of a classical bit",
#         choices="A quantum version of a classical bit, A hard drive, A classical computer unit, A resistor"
#     )
#     db.session.add(q)
#     db.session.commit()
#     return "Question added!"

# Home page route
@app.route('/')
def home():
    return render_template('home.html')

# Quantum Level page route
@app.route('/quantumlevel')
def quantum_level():
    return render_template('quantumlevel.html')

@app.route('/quantumar')
def quantumar():
    return render_template('quantumar.html')

@app.route('/quantumprocessor')
def QProcessorAR():
    return render_template('QProcessorAR.html')

@app.route('/quiz', methods=['GET', 'POST'])
def quiz():
    questions = Questions.query.all()

    if 'answers' not in session:
        session['answers'] = {}
    if 'q_index' not in session:
        session['q_index'] = 0

    if request.method == 'POST':
        current_q = questions[session['q_index']]
        selected = request.form.get('answer')
        if selected:
            session['answers'][str(current_q.id)] = selected

        if 'next' in request.form:
            session['q_index'] = min(session['q_index'] + 1, len(questions) - 1)
        elif 'prev' in request.form:
            session['q_index'] = max(session['q_index'] - 1, 0)
        elif 'submit' in request.form:
            score = 0
            for q in questions:
                if session['answers'].get(str(q.id)) == q.correct_answer:
                    score += 1
            answers = session.pop('answers', {})
            session.pop('q_index', None)
            return render_template('quiz_result.html', score=score, total=len(questions), answers=answers, questions=questions)

    index = session['q_index']
    question = questions[index]
    selected_answer = session['answers'].get(str(question.id), None)

    return render_template(
        'quiz.html',
        question=question,
        index=index + 1,
        total=len(questions),
        is_first=(index == 0),
        is_last=(index == len(questions) - 1),
        selected_answer=selected_answer
    )

@app.route('/reset_quiz')
def reset_quiz():
    session['answers'] = {}
    session['q_index'] = 0
    return redirect(url_for('quiz'))

@app.route('/explain', methods=['POST'])
def explain():
    data = request.get_json()
    question = data.get('question')
    correct_answer = data.get('correct_answer')
    my_answer = data.get('my_answer')

    if not question or not correct_answer:
        return jsonify({'error': 'Invalid input'}), 400

    explanation = get_granite_explanation(question, correct_answer, my_answer)
    return jsonify({'explanation': explanation})


app.config['ENV'] = 'production'
app.config['DEBUG'] = False 

if __name__ == '__main__':
    # port = int(os.environ.get("PORT", 5000))  # Get the port from environment or default to 5000
    app.run()  # Bind to 0.0.0.0 for production deployment