from django.http import HttpResponse
from rest_framework.renderers import JSONRenderer
from pymongo import MongoClient
from bson.code import Code
import json

client = MongoClient('localhost', 27017)
db = client.rtls

class JSONResponse(HttpResponse):
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)


def name_query(request):
    if request.method == 'GET':
        result = db.rtls.aggregate([{"$group" : {"_id" : "$name", "number" : {"$sum" : 1}}}])
        result = list(result)
        print json.dumps(result).decode("unicode_escape")
        return JSONResponse(result)

    return HttpResponse(status=404)

def group_query(request):
    if request.method == 'GET':
        result = db.rtls.aggregate([{"$group" : {"_id" : "$group", "number" : {"$sum" : 1}}}])
        result = list(result)
        print json.dumps(result).decode("unicode_escape")
        return JSONResponse(result)

    return HttpResponse(status=404)

def speed_query_(begTime, endTime, names, group, sex, minAge, maxAge):
    DAY = 24*60*60
    TIME_OFFSET = 8*60*60

    code ="function() {"
    if(names and names != []):
        code += "while(true){"
        for name in names:
            code += "if(this.name == \"" + name + "\")"
            code += "break;"
        code += "return;"
        code += "}"
    if(group and group != ''):
        code += "if(this.group != \"" + group + "\")"
        code += "return;"
    if(sex and sex != ''):
        code += "if(this.sex != \"" + sex + "\")"
        code += "return;"

    if(minAge and minAge != ''):
        code += "if(this.age < " + str(minAge) + ")"
        code += "return;"

    if(maxAge and maxAge != ''):
        code += "if(this.age > " + str(maxAge) + ")"
        code += "return;"

    code += "if(this.time < " + begTime + ")"
    code += "return;"
    code += "if(this.time > " + endTime + ")"
    code += "return;"

    code += "var time = this.time + " + str(TIME_OFFSET) + ";"
    code += "time -= time%"+str(DAY)+";"
    code += "time -= "+str(TIME_OFFSET)+";"

    code += "emit(time, {aveSpeed: this.speed, minSpeed: this.speed, maxSpeed: this.speed});"
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
    ret = []
    for doc in result.find():
        ret.append(doc)

    print json.dumps(ret)

    return ret


def speed_query(request):

    if request.method == 'GET':
        begTime = request.GET.get('begTime')
        endTime = request.GET.get('endTime')

        searchOptions = request.GET.get('searchOptions')
        print searchOptions

        ret = []
        for option in json.loads(searchOptions):
            print option
            ret.append(speed_query_(begTime, endTime, option['name'], option['group'], option['sex'], option['minAge'], option['maxAge'] ))

        return JSONResponse(ret)

    return HttpResponse(status=404)
