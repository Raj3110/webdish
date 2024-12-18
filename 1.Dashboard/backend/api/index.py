import json
import os
import urllib.parse

import bson
from dotenv import load_dotenv
from flask import Flask, request, jsonify, redirect, session, url_for
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from pymongo import MongoClient

load_dotenv()
from datetime import datetime, timedelta
import re

import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
CORS(app, origins="*", supports_credentials=True)
app.secret_key = os.urandom(12)

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)

jwt = JWTManager(app)

client = MongoClient(os.getenv('MONGODB_URL'))
db = client['AI_Chef_Master']

# ==========================================================================================================================================


@app.route('/chef/checkDishExists', methods=['GET'])
def check_dish_exists():
    dish_name = request.args.get('name').lower()
    existing_dish = db.Dish.find_one({'dish_name': {"$regex": f'^{re.escape(dish_name)}$', "$options": "i"}})

    if existing_dish:
        return jsonify({'exists': True}), 200
    else:
        return jsonify({'exists': False}), 200


# @app.route('/chef/createDish', methods=['POST'])
# @jwt_required()
# def create_dish():
#     user_info = get_jwt_identity()
#     login_user = db.Chef.find_one({'email': user_info}, {'first_name': 1, 'last_name': 1})
#     kname = login_user['first_name'] + " " + login_user['last_name']
#
#     temp = request.get_json()
#     dish_name = temp['name'].lower()
#
#     existing_dish = db.Dish.find_one({'dish_name': {"$regex": f'^{re.escape(dish_name)}$', "$options": "i"}})
#
#     if existing_dish:
#         return jsonify({'error': 'Dish already exists with the same name'}), 400
#
#     formatted_time = datetime.now().strftime("%H:%M:%S")
#     formatted_date = datetime.now().strftime("%Y-%m-%d")
#
#     db.Dish.insert_one({
#         "created_by": kname,
#         "ingredients": temp['ingredients'],
#         "instructions": temp.get('instructions'),
#         "description": temp.get('description'),
#         "dish_name": temp['name'],
#         "veg_non_veg": temp['veg_non_veg'],
#         "popularity_state": temp['popularity_state'],
#         "Cuisine": temp['cuisine'],
#         "cooking_time": temp['cooking_time'],
#         "kitchen_equipments": temp['kitchen_equipments'],
#         "courses": temp['courses'],
#         "Created_date": formatted_date,
#         "Created_time": formatted_time,
#         "email": user_info
#     })
#
#     return jsonify({'message': 'Dish Saved Successfully'}), 201
#
#
# @app.route('/myAccount', methods=['GET'])
# @jwt_required()
# def myAccount():
#     user_info = get_jwt_identity()
#     login_user = db.Chef.find_one({'email': user_info}, {'first_name': 1, 'last_name': 1})
#     name = login_user['first_name'] + " " + login_user['last_name']
#
#     All_dis = db.Dish.find({'email': user_info})
#     output3 = []
#     for dish in All_dis:
#         dish_data = {
#             "id": str(dish['_id']),
#             "name": dish['dish_name'],
#             "cuisine": dish['Cuisine'],
#             "veg_non": dish['veg_non_veg'],
#             "course_type": dish['courses'],
#             "created_date": dish['Created_date'],
#             "created_time": dish['Created_time'],
#             "description": dish['description'],
#             "cooking_time": dish["cooking_time"],
#             "popularity_state": dish["popularity_state"]
#         }
#         output3.append(dish_data)
#
#     return jsonify(output3)


@app.route('/api/search', methods=['GET', 'POST'])
def search():
    query = request.get_json()
    sea = query
    final = sea["query"].lower()
    All_dishes = db.Dish.find({"dish_name": {"$regex": final, "$options": "i"}})
    output = []
    found_dishes = set()
    for dish in All_dishes:
        ingredients = dish['ingredients']
        ingredients_lower = [ing['name'].lower() for ing in ingredients]
        if (dish['dish_name'], tuple(ingredients_lower)) not in found_dishes:
            dish1 = {
                "name": dish['dish_name'],
                "cuisine": dish['Cuisine'],
                "veg_non_veg": dish['veg_non_veg'],
                "courses": dish['courses'],
                "created_date": dish['Created_date'],
                "created_time": dish['Created_time'],
                "created_by": dish['created_by'],
                "description": dish['description'],
                "cooking_time": dish["cooking_time"],
                "kitchen_equipments": dish["kitchen_equipments"],
                "popularity_state": dish["popularity_state"],
                "ingredients": dish['ingredients'],
                "instructions": dish['instructions'],
            }
            output.append(dish1)
            found_dishes.add((dish['dish_name'], tuple(ingredients_lower)))
    return jsonify(output)


@app.route('/api/dish/<id>', methods=['GET'])
@jwt_required()
def filter_by_id(id):
    dish = db.Dish.find_one({'_id': bson.ObjectId(oid=id)})

    dish_data = {
        "name": dish['dish_name'],
        "cuisine": dish['Cuisine'],
        "veg_non_veg": dish['veg_non_veg'],
        "courses": dish['courses'],
        "created_date": dish['Created_date'],
        "created_time": dish['Created_time'],
        "description": dish['description'],
        "cooking_time": dish["cooking_time"],
        "ingredients": dish['ingredients'],
        "instructions": dish['instructions'],
        "kitchen_equipments": dish["kitchen_equipments"],
        "popularity_state": dish["popularity_state"]
    }
    return dish_data


@app.route('/show')
@jwt_required()
def show():
    user_info = get_jwt_identity()
    login_user = db.Chef.find_one({'email': user_info}, {'firstName': 1, 'lastName': 1})
    name = login_user['firstName'] + " " + login_user['lastName']
    return jsonify({'name': name, 'email': user_info})


@app.route('/api/contact', methods=['POST'])
def contact():
    data = request.get_json()
    name = data['name']
    message = data['message']

    db.Contact.insert_one({'name': name, 'message': message})

    return jsonify({"message": "Message submitted successfully"}), 201


@app.route('/dishes', methods=['GET'])
def get_dishes():
    dishes = db.Dish.find({}, {'_id': 0})
    return jsonify([dish for dish in dishes])


@app.route('/name/<id>', methods=['GET'])
def get_details(id):
    details = db.Dish.find_one({'id': id}, {'_id': 0, 'dish_name': 1})
    return jsonify(details)


@app.route('/dishes/<id>/ingredients', methods=['GET'])
def get_ingredients(id):
    dish = db.Dish.find_one({'id': id})
    if dish:
        id = dish.get('id')
        cuisine = dish.get('Cuisine')
        name = dish.get('dish_name')
        image = dish.get('image')
        description = dish.get('description')
        type = dish.get('veg_non_veg')
        time = dish.get('cooking_time')
        ingredients = dish.get('ingredients', [])  # Replace 'ingredients' with your actual field name
        equipments = dish.get('kitchen_equipments', [])
        return jsonify({
            "ingredients": ingredients,
            "equipments": equipments,
            "Cuisine": cuisine,
            "name": name,
            "image": image,
            "description": description,
            "type": type,
            "time": time,
            "id": id
        })
    else:
        return jsonify({"error": "Dish not found"}), 404


@app.route('/recipes/<id>', methods=['GET'])
def get_recipe(id):
    dish = db.receipe.find_one({'id': id})
    if dish:
        return jsonify(dish['recipeSteps'])
    else:
        return jsonify({"error": "Recipe not found"}), 404


@app.route('/dishes/state', methods=['POST'])
def get_states():
    data = request.json
    print(data)
    state = data.get('state')
    print(state)
    cursor = db['Dish'].find({"popularity_state": state}, {"_id": 0})
    # Convert cursor to a list of dictionaries
    dishes = list(cursor)
    print(dishes)
    return jsonify(dishes)


@app.route('/feedback', methods=['POST'])
def feedback():
    data = request.json
    db.Feedback.insert_one({
        "email": data.get('email'),
        "message": data.get('message'),
        "reaction": data.get('reaction')
    })
    return jsonify({'message': 'Message added successfully'}), 201


@app.route('/steps/<id>', methods=['GET'])
def get_steps(id):
    dish = db.receipe.find_one({'id': id})
    print(dish)
    if dish:
        return jsonify(dish['recipeSteps'])
    else:
        return jsonify({"error": "Recipe not found"}), 404


# Raj Code
EMAIL_USER = os.getenv('EMAIL_USER')
EMAIL_PASS = os.getenv('EMAIL_PASS')

otp_store = {}
email_verified_store = {}


def generate_otp():
    return str(random.randint(100000, 999999))


def send_otp_email(email, otp):
    msg = MIMEMultipart()
    msg['From'] = EMAIL_USER
    msg['To'] = email
    msg['Subject'] = "Login OTP for 2-Step Verification"

    body = f"Your OTP for login is: {otp}"
    msg.attach(MIMEText(body, 'plain'))

    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(EMAIL_USER, EMAIL_PASS)
    text = msg.as_string()
    server.sendmail(EMAIL_USER, email, text)
    server.quit()


@app.route('/chef/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    username = data.get('email')  # The 'email' field actually contains the username

    if not username:
        return jsonify(message='Username is required'), 400

    # Check if user exists
    user = db.Chef.find_one({'userId': username})
    if not user:
        return jsonify(message='User not found'), 404

    email = user.get('email')
    if not email:
        return jsonify(message='Email not found for this user'), 404

    # Generate and send OTP
    otp = generate_otp()
    otp_store[email] = otp
    try:
        send_otp_email(email, otp)
        return jsonify(message='OTP sent successfully'), 200
    except Exception as e:
        print(f"Error sending OTP: {str(e)}")
        return jsonify(message='Failed to send OTP. Please try again.'), 500


@app.route('/chef/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    username = data.get('email')
    # Check if user exists
    user = db.Chef.find_one({'userId': username})
    if not user:
        return jsonify(message='User not found'), 404

    email = user.get('email')
    otp = data.get('otp')

    if not email or not otp:
        return jsonify(message='Email and OTP are required'), 400

    stored_otp = otp_store.get(email)
    if not stored_otp or stored_otp != otp:
        return jsonify(message='Invalid OTP'), 401

    # OTP is valid
    otp_store.pop(email, None)

    email_verified_store[email] = True

    return jsonify(message='Email verified successfully'), 200


@app.route('/chef/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('email')
    # Check if user exists
    user = db.Chef.find_one({'userId': username})
    if not user:
        return jsonify(message='User not found'), 404

    email = user.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify(message='Username and password are required'), 400

    login_user = db.Chef.find_one({'email': email, 'password': password})
    if not login_user:
        return jsonify(message='Invalid email or password'), 401

    # Check if email is verified using local storage
    if not email_verified_store.get(email, False):
        return jsonify(message='User not verified. Please verify your user first.'), 403
    else:
        email_verified_store[email] = False

    # Created access token
    access_token = create_access_token(identity=email)

    # Set session data
    session.permanent = True
    session['is_login'] = True
    session['email'] = email
    session['login_time'] = datetime.utcnow().isoformat()
    print("Current session data:", dict(session))

    return jsonify(
        message='Login Successful',
        access_token=access_token,
        email=email,
    ), 200

@app.route('/chef/createDish', methods=['POST'])
@jwt_required()
def create_dish():
    user_info = get_jwt_identity()

    login_user = db.Chef.find_one({'email': user_info}, {'firstName': 1, 'lastName': 1})
    if not login_user:
        return jsonify(message='User not found'), 404

    kname = login_user['firstName'] + " " + login_user['lastName']

    temp = request.get_json()
    if not temp:
        return jsonify(message='No data provided'), 400

    dish_name = temp.get('name', '').lower()
    if not dish_name:
        return jsonify(message='Dish name is required'), 400

    existing_dish = db.Dish.find_one({'dish_name': {"$regex": f'^{re.escape(dish_name)}$', "$options": "i"}})
    if existing_dish:
        return jsonify(message='Dish already exists with the same name'), 400

    formatted_time = datetime.utcnow().strftime("%H:%M:%S")
    formatted_date = datetime.utcnow().strftime("%Y-%m-%d")

    new_dish = {
        "created_by": kname,
        "ingredients": temp.get('ingredients'),
        "instructions": temp.get('instructions'),
        "description": temp.get('description'),
        "dish_name": temp.get('name'),
        "veg_non_veg": temp.get('veg_non_veg'),
        "popularity_state": temp.get('popularity_state'),
        "Cuisine": temp.get('cuisine'),
        "cooking_time": temp.get('cooking_time'),
        "kitchen_equipments": temp.get('kitchen_equipments'),
        "courses": temp.get('courses'),
        "Created_date": formatted_date,
        "Created_time": formatted_time,
        "email": user_info
    }

    result = db.Dish.insert_one(new_dish)
    if not result.inserted_id:
        return jsonify(message='Failed to save dish'), 500

    return jsonify(message='Dish Saved Successfully'), 201

@app.route('/myAccount', methods=['GET'])
@jwt_required()
def myAccount():
    user_info = get_jwt_identity()

    login_user = db.Chef.find_one({'email': user_info}, {'firstName': 1, 'lastName': 1})
    if not login_user:
        return jsonify(message='User not found'), 404

    All_dis = db.Dish.find({'email': user_info})

    dishes = [{**dish, '_id': str(dish['_id'])} for dish in All_dis]

    output3 = []
    for dish in dishes:
        dish_data = {
            "id": str(dish['_id']),
            "name": dish['dish_name'],
            "cuisine": dish['Cuisine'],
            "veg_non": dish['veg_non_veg'],
            "course_type": dish['courses'],
            "created_date": dish['Created_date'],
            "created_time": dish['Created_time'],
            "description": dish.get('description'),
            "cooking_time": dish["cooking_time"],
            "popularity_state": dish["popularity_state"]
        }
        output3.append(dish_data)

    return jsonify(dishes=output3)

@app.route('/chef/check-session', methods=['GET'])
@jwt_required()
def check_session():
    current_user = get_jwt_identity()
    if 'email' in session and session['email'] == current_user:
        login_time = datetime.fromisoformat(session['login_time'])
        current_time = datetime.utcnow()
        time_elapsed = current_time - login_time

        if time_elapsed < timedelta(hours=1):
            return jsonify(message='Session is valid', email=current_user), 200
        else:
            session.clear()
            return jsonify(message='Session has expired'), 401
    else:
        return jsonify(message='No active session'), 401


@app.route('/chef/logout', methods=['POST'])
@jwt_required()
def logout():
    session.clear()
    return jsonify(message='Logged out successfully'), 200


if __name__ == '__main__':
    app.debug = True
    app.run()
