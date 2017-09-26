from django.http import HttpResponse
from rest_framework.renderers import JSONRenderer
from pymongo import MongoClient
from bson.code import Code
import json

client = MongoClient('localhost', 27017)
db = client.rtls
collection = db.rtls

class JSONResponse(HttpResponse):
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)



def speed_query(request):
    DAY = 24*60*60

    if request.method == 'GET':
        name = request.GET.get('name')
        group = request.GET.get('group')
        sex = request.GET.get('sex')
        begTime = request.GET.get('begTime')
        endTime = request.GET.get('endTime')

        code ="function() {"
        if(name != None):
            code += "if(this.name != \"" + name + "\")"
            code += "return;"
        if(group != None):
            code += "if(this.group != \"" + group + "\")"
            code += "return;"
        if(sex != None):
            code += "if(this.sex != \"" + sex + "\")"
            code += "return;"

        code += "if(this.time < " + begTime + ")"
        code += "return;"
        code += "if(this.time > " + endTime + ")"
        code += "return;"

        code += "emit(this.time-this.time%"+str(DAY)+", {aveSpeed: this.speed, minSpeed: this.speed, maxSpeed: this.speed});"
        code += "}"
        print code
        map = Code(code)

        code ="function(key, values) {"
        code += "var result = {aveSpeed: 0, minSpeed: 99999, maxSpeed: 0};"
        code += "var sum = 0;"
        code += "var total = 0;"
        code += "values.forEach( function(value) {"
        code += "sum += value.aveSpeed;"
        code += "if(result.maxSpeed < value.aveSpeed ){"
        code += "result.maxSpeed = value.aveSpeed"
        code += "}"
        code += "if(result.minSpeed > value.aveSpeed){"
        code += "result.minSpeed = value.aveSpeed"
        code += "}"
        code += "});"
        code += "if(result.minSpeed > result.maxSpeed){"
        code += "result.minSpeed = result.maxSpeed"
        code += "}"
        code += "result.aveSpeed = sum/values.length;"
        code += "return result;"
        code += "}"
        reduce = Code(code)

        result = db.rtls.map_reduce(map, reduce, "result")
        ret = "["

        for doc in result.find():
            ret += (json.dumps(doc)) + ","

        ret += "]"
        return HttpResponse(ret)

    return HttpResponse(status=404)
