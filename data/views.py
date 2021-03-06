from django.http import HttpResponse
from rest_framework.renderers import JSONRenderer
from pymongo import MongoClient
from bson.code import Code
import json

client = MongoClient('localhost', 27017)
db = client.rtls

TIME_TYPE_DAY = 1
TIME_TYPE_MONTH = 2
TIME_TYPE_YEAR = 3

class JSONResponse(HttpResponse):
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)


def name_query(request):
    if request.method == 'GET':
        result = db.rtls.aggregate([{"$group" : {"_id" : "$name", "number" : {"$sum" : 1}}}])
        result = list(result)
        # print json.dumps(result).decode("unicode_escape")
        return JSONResponse(result)

    return HttpResponse(status=404)

def group_query(request):
    if request.method == 'GET':
        result = db.rtls.aggregate([{"$unwind":"$group"},{"$group" : {"_id" : "$group", "number" : {"$sum" : 1}}}])
        result = list(result)
        # print json.dumps(result).decode("unicode_escape")
        return JSONResponse(result)

    return HttpResponse(status=404)

def speed_query_(begTime, endTime, timeType, names, group, sex, minAge, maxAge):
    TIME_OFFSET = 8*60*60

    code ="function() {"
    if names and names != []:
        code += "while(true){"
        for name in names:
            code += "if(this.name == \"" + name + "\")"
            code += "break;"
        code += "return;"
        code += "}"
    if group and group != '':
        code += "if(this.group.indexOf(\"" + group + "\")==-1)"
        code += "return;"
    if sex and sex != '':
        code += "if(this.sex != \"" + sex + "\")"
        code += "return;"

    if minAge and minAge != '':
        code += "if(this.age < " + str(minAge) + ")"
        code += "return;"

    if maxAge and maxAge != '':
        code += "if(this.age > " + str(maxAge) + ")"
        code += "return;"

    code += "if(this.time < " + begTime + ")"
    code += "return;"
    code += "if(this.time > " + endTime + ")"
    code += "return;"

    code += "var date = new Date(this.time*1000);"
    if timeType == TIME_TYPE_DAY:
        code += "var time = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());"
    elif timeType == TIME_TYPE_MONTH:
        code += "var time = Date.UTC(date.getFullYear(), date.getMonth());"
    elif timeType == TIME_TYPE_YEAR:
        code += "var time = Date.UTC(date.getFullYear(), 0);"

    code += "time /= 1000;"
    code += "time -="+ str(TIME_OFFSET)+";"

    code += "emit(time, {sum: this.speed, count: 1, minSpeed: this.speed, maxSpeed: this.speed});"
    code += "}"
    # print code
    map = Code(code)

    code ="function(key, values) {"
    code += "var result = {sum: 0, count: 0, minSpeed: 99999, maxSpeed: 0};"
    code += "values.forEach( function(value) {"
    code += "result.sum += value.sum;"
    code += "result.count += value.count;"
    code += "if(result.maxSpeed < value.maxSpeed ){"
    code += "result.maxSpeed = value.maxSpeed"
    code += "}"
    code += "if(result.minSpeed > value.minSpeed){"
    code += "result.minSpeed = value.minSpeed"
    code += "}"
    code += "});"
    code += "return result;"
    code += "}"
    # print code
    reduce = Code(code)

    code = "function (key, reducedVal) {"
    code += "reducedVal.aveSpeed = reducedVal.sum / reducedVal.count;"
    code += "return reducedVal;"
    code += "}"
    # print code
    finalizeFunc = Code(code)

    result = db.rtls.map_reduce(map, reduce, finalize=finalizeFunc,  out={'merge': 'result'})
    ret = []
    for doc in result.find():
        ret.append(doc)

    print json.dumps(ret)

    return ret


def speed_query(request):

    if request.method == 'GET':
        begTime = request.GET.get('begTime')
        endTime = request.GET.get('endTime')

        timeType = request.GET.get('timeType')
        timeType = json.loads(timeType)

        searchOptions = request.GET.get('searchOptions')
        # print searchOptions

        ret = []
        for option in json.loads(searchOptions):
            print option
            ret.append(speed_query_(begTime, endTime, timeType, option['name'], option['group'], option['sex'], option['minAge'], option['maxAge'] ))

        return JSONResponse(ret)

    return HttpResponse(status=404)
