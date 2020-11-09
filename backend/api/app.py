from flask import Flask, jsonify, request
from flask_restful import Api, Resource
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timedelta
from bson import ObjectId

import json


app = Flask(__name__)
CORS(app)

api = Api(app)

client = MongoClient("mongodb://db:27017")
db = client.KeeperApp
notes = db["Notes"]

EXPIRE_DAYS = 3

#JSONEncoder to manage the MongoDB ObjectId
class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

class Note(Resource):
    def post(self):
        postedData = request.get_json()

        title = postedData["title"]
        note = postedData["note"]

        if title and note:
            result = notes.insert_one({
                "Title": title[:50],
                "Note": note[:200],
                "created": datetime.utcnow()
            })

            retJson = {
                "status" : 200,
                "msg": "Note is successfully created.",
                "insertedId": JSONEncoder().encode(result.inserted_id).replace("\"", "")
            }
            return jsonify(retJson)
        return jsonify({"status": 422})
    
    def delete(self):
        postedData = request.get_json()
        id = postedData["id"]
        notes.delete_one({"_id": ObjectId(id)})
        retJson = {
            "status" : 200,
            "msg": "Note is successfully deleted."
        }
        return jsonify(retJson)

    
class Notes(Resource):
    def get(self):
        # remove notes which are older than EXPIRE_DAYS
        Helper.removeOldNotes(EXPIRE_DAYS)

        items = []
        # get all the notes
        notes_cursor = notes.find({})

        for note in notes_cursor:
            items.append({
                "_id": JSONEncoder().encode(note["_id"]).replace("\"", ""), 
                "title": note["Title"], 
                "note": note["Note"],
                "created": note["created"]
            })
        
        return jsonify(data=items)

class Helper:
    @staticmethod
    def removeOldNotes(expire_days):
        expire_date = datetime.utcnow() - timedelta(days=expire_days)
        notes.remove({"created": { "$lte": expire_date}})


api.add_resource(Note, '/api/note')
api.add_resource(Notes, '/api/notes')

if __name__ == "__main__":
    app.run(host='0.0.0.0')