String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g,
				function (m, i) {
				    return args[i];
				});
}

String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "");
}

JSON2Swift = {
    _allClass: [],
    _genClassCode: function (obj, name) {
        var clasName = name || "Root";
        var clas = "struct {0}: Codable {\r\n".format(clasName);
        var codingKeys = "\r\n    private enum CodingKeys: String, CodingKey {\r\n";
        var extensionClas = "extension {0} {\r\n\r\n".format(clasName);
        var initFunc = "    init(from decoder: Decoder) throws {\r\n";
        initFunc += "        let container = try decoder.container(keyedBy: {0}.CodingKeys.self)\r\n\r\n".format(clasName);
        var encodeFunc = "    func encode(to encoder: Encoder) throws {\r\n";
        encodeFunc += "        var container = encoder.container(keyedBy: {0}.CodingKeys.self)\r\n\r\n".format(clasName);
        for (var n in obj) {
            var v = obj[n];
            n = n.trim();
            var paramName = this._updateObjName(n);
            var paramType = this._genTypeByProp(paramName, v);
            clas += "    {0}    let {2}: {1}?\r\n".format(this._genComment(v), paramType, paramName);
            if (paramName === n) {
                codingKeys += "        case {0}\r\n".format(paramName);
            }
            else {
                codingKeys += "        case {0} = \"{1}\"\r\n".format(paramName, n);
            }
            initFunc += "        {0} = try container.decode({1}.self, forKey: .{0})\r\n".format(paramName, paramType);
            encodeFunc += "        try container.encode({0}, forKey: .{0})\r\n".format(paramName);
        }
        codingKeys += "    }\r\n";
        clas += codingKeys + "}\r\n";
        initFunc += "    }\r\n";
        encodeFunc += "    }\r\n";
        extensionClas += initFunc + "\r\n" + encodeFunc + "}\r\n";
        clas += "\r\n" + extensionClas;
        this._allClass.push(clas);
        return this._allClass.join("\r\n");
    },
    _updateObjName: function (name) {
        do {
            var length = name.length
            if (length <= 0) {
                break;
            }
            if (name.charCodeAt(0) == 45 || name.charCodeAt(length) == 95) {
                break;
            }
            if (name.charCodeAt(length) == 45 || name.charCodeAt(length) == 95) {
                break;
            }
            var isAllAscii = true;
            for (var index = 0; index < length; index++) {
                if (name.charCodeAt(index) > 127) {
                    isAllAscii = false;
                    break;
                }
            }
            if (isAllAscii == false) {
                break;
            }
            var isNeedUp = false;
            var newName = "";
            for (var index = 0; index < length; index++) {
                if (name.charCodeAt(index) == 45 || name.charCodeAt(index) == 95) {
                    isNeedUp = true;
                    continue;
                }
                var subNameCode;
                if (isNeedUp == true) {
                    if (name.charCodeAt(index) >= 97 && name.charCodeAt(index) <= 122) {
                        subNameCode = name.charCodeAt(index) - 32;
                    }
                    else {
                        subNameCode = name.charCodeAt(index);
                    }
                    isNeedUp = false;
                }
                else {
                    subNameCode = name.charCodeAt(index);
                }
                newName += String.fromCharCode(subNameCode);
            }
            return newName;
        } while (false)
        return name;
    },
    _genTypeByProp: function (name, val) {
        switch (Object.prototype.toString.apply(val)) {
            case "[object Number]":
                {
                    return val.toString().indexOf(".") > -1 ? "Double" : "Int";
                }
            case "[object Date]":
                {
                    return "Date";
                }
            case "[object Object]":
                {
                    name = name.substring(0, 1).toUpperCase() + name.substring(1);
                    this._genClassCode(val, name);
                    return name;
                }
            case "[object Array]":
                {
                    return "[{0}]".format(this._genTypeByProp(name + "Item", val[0]));
                }
            default:
                {
                    return "String";
                }
        }
    },
    _genComment: function (val) {
    	
       var commm = typeof (val) == "string" && /.*[\u4e00-\u9fa5]+.*$/.test(val) ? val : "";
        return "/// " + commm + "\r\n";
    },
    convert: function (jsonObj) {
        
        this._allClass = [];
        return this._genClassCode(jsonObj);
    }
}

