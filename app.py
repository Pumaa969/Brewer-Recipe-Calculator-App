from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('base.html')

@app.route('/recetas')
def recipes():
    return render_template('previousRecipes.html')

@app.route('/nueva')
def nueva():
    return render_template('newRecipe.html')

if __name__ == '__main__':
    app.run(debug=True)
